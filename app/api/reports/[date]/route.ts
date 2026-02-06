import { NextResponse } from 'next/server'
import { generateReportPDF, getReportPresignedUrl, reportExists } from '@/lib/pdf'
import { prisma } from '@/lib/prisma'
import { getDateRangeForDateKey } from '@/lib/date'
import type { DateRange } from '@/lib/date'

interface Props {
    params: Promise<{ date: string }>
}

function errorResponse(status: number, code: string, message: string) {
    return NextResponse.json(
        {
            success: false,
            error: {
                code,
                message
            }
        },
        { status }
    )
}

async function hasDataForDate(dateRange: DateRange): Promise<boolean> {
    const count = await prisma.priceData.count({
        where: {
            date: {
                gte: dateRange.start,
                lt: dateRange.end
            }
        }
    })

    return count > 0
}

export async function GET(_request: Request, props: Props) {
    const params = await props.params;
    const { date } = params;

    try {
        const dateRange = getDateRangeForDateKey(date)
        if (!dateRange) {
            return errorResponse(400, 'INVALID_DATE', 'Date must be in YYYY-MM-DD format')
        }

        if (!(await hasDataForDate(dateRange))) {
            return errorResponse(404, 'NO_DATA_FOR_DATE', 'No market data found for this date')
        }

        const exists = await reportExists(date)
        if (!exists) {
            return errorResponse(404, 'REPORT_NOT_FOUND', 'Report has not been generated for this date')
        }

        const url = await getReportPresignedUrl(date)

        return NextResponse.json({
            success: true,
            date,
            url
        })
    } catch (error) {
        console.error('Report fetch error:', error)
        return errorResponse(500, 'REPORT_FETCH_FAILED', 'Failed to fetch report URL')
    }
}

export async function POST(_request: Request, props: Props) {
    const params = await props.params
    const { date } = params

    try {
        const dateRange = getDateRangeForDateKey(date)
        if (!dateRange) {
            return errorResponse(400, 'INVALID_DATE', 'Date must be in YYYY-MM-DD format')
        }

        if (!(await hasDataForDate(dateRange))) {
            return errorResponse(404, 'NO_DATA_FOR_DATE', 'No market data found for this date')
        }

        const url = await generateReportPDF(date)

        return NextResponse.json(
            {
                success: true,
                date,
                url
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Report generation error:', error)
        return errorResponse(500, 'REPORT_GENERATION_FAILED', 'Failed to generate report')
    }
}
