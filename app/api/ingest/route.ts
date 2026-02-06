import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getDateRangeForDateKey } from '@/lib/date'

// Helper to parse strings like "20,776" or "4.00" to number
function parseNumber(val: string | number | null | undefined): number {
    if (val === null || val === undefined) return 0
    if (typeof val === 'number') return val
    // Remove commas and dollar signs
    const clean = val.replace(/[$,]/g, '')
    const num = parseFloat(clean)
    return isNaN(num) ? 0 : num
}

// New Payload Type Definition
type ScraperData = {
    "Volume": string
    "Last Traded Price ($)": string
    "Closing Price ($)": string
    "Price Change ($)": string
    "Closing Bid ($)": string
    "Closing Ask ($)": string
}

type DailyEntry = {
    "1_day_change_pct": number | null
    "30_day_change_pct": number | null
    "relative_volume": number | null
    "data": ScraperData
}

type IngestPayload = {
    [ticker: string]: {
        [date: string]: DailyEntry
    }
}

type IngestError = {
    ticker: string
    date: string
    reason: string
}

type ParsedData = {
    volume: number
    lastTradedPrice: number
    closingPrice: number
    priceChange: number
    closingBid: number
    closingAsk: number
}

function isUniqueConstraintError(error: unknown): boolean {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
    )
}

async function calculateMetrics(ticker: string, date: Date, data: DailyEntry, parsedData: ParsedData) {

    // If metrics are provided in payload, use them (unless null)
    let change1DayPct = data['1_day_change_pct']
    let change30DayPct = data['30_day_change_pct']
    let relativeVolume = data['relative_volume']

    // If any metric is missing/null, try to calculate it from history
    if (change1DayPct === null || change30DayPct === null || relativeVolume === null) {
        const history = await prisma.priceData.findMany({
            where: {
                ticker: ticker,
                date: {
                    lt: date
                }
            },
            orderBy: {
                date: 'desc'
            },
            take: 30
        })

        // Calculate change1DayPct if null
        if (change1DayPct === null) {
            change1DayPct = 0
            if (history.length > 0) {
                const prev = history[0]
                if (prev.closingPrice > 0) {
                    change1DayPct = ((parsedData.closingPrice - prev.closingPrice) / prev.closingPrice) * 100
                }
            }
        }

        // Calculate change30DayPct if null
        if (change30DayPct === null) {
            change30DayPct = 0
            if (history.length > 0) {
                const indexToCompare = history.length >= 29 ? 28 : history.length - 1
                const oldData = history[indexToCompare]
                if (oldData.closingPrice > 0) {
                    change30DayPct = ((parsedData.closingPrice - oldData.closingPrice) / oldData.closingPrice) * 100
                }
            }
        }

        // Calculate Relative Volume if null
        if (relativeVolume === null) {
            relativeVolume = 0
            if (history.length > 0) {
                const totalVol = history.reduce((sum, item) => sum + item.volume, 0)
                const avgVol = totalVol / history.length
                if (avgVol > 0) {
                    relativeVolume = parsedData.volume / avgVol
                }
            }
        }
    }

    return {
        change1DayPct: change1DayPct ?? 0,
        change30DayPct: change30DayPct ?? 0,
        relativeVolume: relativeVolume ?? 0
    }
}

export async function POST(request: Request) {
    try {
        const payload: IngestPayload = await request.json()

        if (!payload || Object.keys(payload).length === 0) {
            return NextResponse.json({ success: false, message: 'Empty payload' }, { status: 400 })
        }

        const summary = {
            success: true,
            received: 0,
            inserted: 0,
            skipped: 0,
            failed: 0,
            errors: [] as IngestError[]
        }

        for (const [ticker, datesData] of Object.entries(payload)) {
            // Upsert Stock
            try {
                await prisma.stock.upsert({
                    where: { ticker },
                    update: {},
                    create: { ticker }
                })
            } catch {
                for (const dateStr of Object.keys(datesData)) {
                    summary.received += 1
                    summary.failed += 1
                    summary.errors.push({
                        ticker,
                        date: dateStr,
                        reason: 'Failed to upsert stock record'
                    })
                }
                continue
            }

            const sortedEntries = Object.entries(datesData).sort(([a], [b]) => a.localeCompare(b))

            for (const [dateStr, entry] of sortedEntries) {
                summary.received += 1
                const dateRange = getDateRangeForDateKey(dateStr)
                if (!dateRange) {
                    summary.failed += 1
                    summary.errors.push({
                        ticker,
                        date: dateStr,
                        reason: 'Invalid date format, expected YYYY-MM-DD'
                    })
                    continue
                }

                // Parse raw data strings to numbers
                const pData = {
                    volume: parseNumber(entry.data['Volume']),
                    lastTradedPrice: parseNumber(entry.data['Last Traded Price ($)']),
                    closingPrice: parseNumber(entry.data['Closing Price ($)']),
                    priceChange: parseNumber(entry.data['Price Change ($)']),
                    closingBid: parseNumber(entry.data['Closing Bid ($)']),
                    closingAsk: parseNumber(entry.data['Closing Ask ($)'])
                }

                try {
                    // Date-only duplicate guard before insert
                    const existing = await prisma.priceData.findFirst({
                        where: {
                            ticker,
                            date: {
                                gte: dateRange.start,
                                lt: dateRange.end
                            }
                        }
                    })

                    if (existing) {
                        summary.skipped += 1
                        continue
                    }

                    // Calculate or retrieve metrics for new rows only
                    const metrics = await calculateMetrics(ticker, dateRange.start, entry, pData)

                    await prisma.priceData.create({
                        data: {
                            ticker,
                            date: dateRange.start,
                            ...pData,
                            ...metrics
                        }
                    })

                    summary.inserted += 1
                } catch (error) {
                    if (isUniqueConstraintError(error)) {
                        summary.skipped += 1
                        continue
                    }

                    summary.failed += 1
                    const reason =
                        error instanceof Error ? error.message : 'Failed to insert price row'
                    summary.errors.push({
                        ticker,
                        date: dateStr,
                        reason
                    })
                }
            }
        }

        summary.success = summary.failed === 0
        return NextResponse.json(summary)
    } catch (error) {
        console.error('Ingestion error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to ingest data' },
            { status: 500 }
        )
    }
}
