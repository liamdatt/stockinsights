import { prisma } from './prisma'

export interface StockWithMetrics {
    ticker: string
    closingPrice: number
    volume: number
    change1DayPct: number | null
    change30DayPct: number | null
    relativeVolume: number | null
    volumeConviction: number | null
    volatilityRank: number | null
    high52w: number | null
    low52w: number | null
    high52wDistance: number | null // (currentPrice / high52w) - 1
    priceHistory: number[] // Last 30 days closing prices for sparkline
}

export interface ReportData {
    date: string
    formattedDate: string
    marketMood: number // Percentage of gainers
    totalTickers: number
    totalGainers: number
    totalLosers: number
    topGainers: StockWithMetrics[] // Top 3
    topLosers: StockWithMetrics[] // Top 3
    volumeLeaders: StockWithMetrics[] // Hot Tab - Top 5 by volume
    unusualVolume: StockWithMetrics[] // Shock Tab - relativeVolume > 2.0
    momentumDaily: StockWithMetrics[] // Top 10 by change1DayPct
    momentumMonthly: StockWithMetrics[] // Top 10 by change30DayPct
    highRelativeVolume: StockWithMetrics[] // relativeVolume > 1.5
    recoveryStocks: StockWithMetrics[] // Bounce back filter
}

/**
 * Fetch and compute all report data for a given date.
 */
export async function getReportData(startDate: Date, endDate: Date, formattedDate: string): Promise<ReportData | null> {
    // Fetch all price data for the date
    const dayData = await prisma.priceData.findMany({
        where: {
            date: {
                gte: startDate,
                lt: endDate,
            },
        },
        orderBy: { ticker: 'asc' },
    })

    if (dayData.length === 0) {
        return null
    }

    // Get unique tickers
    const tickers = [...new Set(dayData.map(d => d.ticker))]

    // Fetch 52-week historical data for all tickers
    const oneYearAgo = new Date(startDate)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const historicalData = await prisma.priceData.findMany({
        where: {
            ticker: { in: tickers },
            date: {
                gte: oneYearAgo,
                lt: endDate,
            },
        },
        orderBy: { date: 'desc' },
        select: {
            ticker: true,
            date: true,
            closingPrice: true,
            volume: true,
            change1DayPct: true,
        },
    })

    // Group historical data by ticker
    const historyByTicker = new Map<string, typeof historicalData>()
    for (const record of historicalData) {
        const existing = historyByTicker.get(record.ticker) || []
        existing.push(record)
        historyByTicker.set(record.ticker, existing)
    }

    // Enrich day data with calculated metrics
    const enrichedData: StockWithMetrics[] = dayData.map(stock => {
        const history = historyByTicker.get(stock.ticker) || []

        // 52-week high/low
        const prices52w = history.map(h => h.closingPrice)
        const high52w = prices52w.length > 0 ? Math.max(...prices52w) : null
        const low52w = prices52w.length > 0 ? Math.min(...prices52w) : null

        // Last 30 days for sparkline and volatility
        const last30 = history.slice(0, 30)
        const priceHistory = last30.map(h => h.closingPrice).reverse() // Chronological order

        // Volatility rank (std dev of daily changes)
        const changes = last30.map(h => h.change1DayPct).filter((c): c is number => c !== null)
        let volatilityRank: number | null = null
        if (changes.length >= 5) {
            const mean = changes.reduce((a, b) => a + b, 0) / changes.length
            const variance = changes.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / changes.length
            volatilityRank = Math.sqrt(variance)
        }

        // Volume conviction
        const volumeConviction = (stock.change1DayPct !== null && stock.relativeVolume !== null)
            ? stock.change1DayPct * stock.relativeVolume
            : null

        return {
            ticker: stock.ticker,
            closingPrice: stock.closingPrice,
            volume: stock.volume,
            change1DayPct: stock.change1DayPct,
            change30DayPct: stock.change30DayPct,
            relativeVolume: stock.relativeVolume,
            volumeConviction,
            volatilityRank,
            high52w,
            low52w,
            high52wDistance: high52w ? (stock.closingPrice / high52w) - 1 : null,
            priceHistory,
        }
    })

    // Calculate market mood
    const gainers = enrichedData.filter(s => (s.change1DayPct ?? 0) > 0)
    const losers = enrichedData.filter(s => (s.change1DayPct ?? 0) < 0)
    const marketMood = enrichedData.length > 0 ? (gainers.length / enrichedData.length) * 100 : 50

    // Top 3 Gainers (sorted by change1DayPct DESC)
    const topGainers = [...enrichedData]
        .filter(s => s.change1DayPct !== null && s.change1DayPct > 0)
        .sort((a, b) => (b.change1DayPct ?? 0) - (a.change1DayPct ?? 0))
        .slice(0, 3)

    // Top 3 Losers (sorted by change1DayPct ASC)
    const topLosers = [...enrichedData]
        .filter(s => s.change1DayPct !== null && s.change1DayPct < 0)
        .sort((a, b) => (a.change1DayPct ?? 0) - (b.change1DayPct ?? 0))
        .slice(0, 3)

    // Hot Tab: Volume Leaders (top 5 by raw volume)
    const volumeLeaders = [...enrichedData]
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5)

    // Shock Tab: Unusual Volume (relativeVolume > 2.0)
    const unusualVolume = [...enrichedData]
        .filter(s => (s.relativeVolume ?? 0) > 2.0)
        .sort((a, b) => (b.relativeVolume ?? 0) - (a.relativeVolume ?? 0))
        .slice(0, 10)

    // Momentum Daily: Top 10 by change1DayPct
    const momentumDaily = [...enrichedData]
        .filter(s => s.change1DayPct !== null)
        .sort((a, b) => (b.change1DayPct ?? 0) - (a.change1DayPct ?? 0))
        .slice(0, 10)

    // Momentum Monthly: Top 10 by change30DayPct
    const momentumMonthly = [...enrichedData]
        .filter(s => s.change30DayPct !== null)
        .sort((a, b) => (b.change30DayPct ?? 0) - (a.change30DayPct ?? 0))
        .slice(0, 10)

    // High Relative Volume: > 1.5x average
    const highRelativeVolume = [...enrichedData]
        .filter(s => (s.relativeVolume ?? 0) > 1.5)
        .sort((a, b) => (b.relativeVolume ?? 0) - (a.relativeVolume ?? 0))

    // Recovery: change1DayPct > 3 AND change30DayPct < -10
    const recoveryStocks = [...enrichedData]
        .filter(s => (s.change1DayPct ?? 0) > 3 && (s.change30DayPct ?? 0) < -10)
        .sort((a, b) => (b.change1DayPct ?? 0) - (a.change1DayPct ?? 0))

    return {
        date: startDate.toISOString().split('T')[0],
        formattedDate,
        marketMood,
        totalTickers: enrichedData.length,
        totalGainers: gainers.length,
        totalLosers: losers.length,
        topGainers,
        topLosers,
        volumeLeaders,
        unusualVolume,
        momentumDaily,
        momentumMonthly,
        highRelativeVolume,
        recoveryStocks,
    }
}
