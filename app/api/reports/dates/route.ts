import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toDateKey } from '@/lib/date'

export async function GET() {
    try {
        const grouped = await prisma.priceData.groupBy({
            by: ['date'],
            orderBy: {
                date: 'desc'
            }
        })

        const seen = new Set<string>()
        const dates: string[] = []

        for (const item of grouped) {
            const dateKey = toDateKey(item.date)
            if (!seen.has(dateKey)) {
                seen.add(dateKey)
                dates.push(dateKey)
            }
        }

        return NextResponse.json({
            success: true,
            dates
        })
    } catch (error) {
        console.error('Failed to fetch available dates:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch available report dates'
            },
            { status: 500 }
        )
    }
}
