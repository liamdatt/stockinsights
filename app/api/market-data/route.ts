import { NextResponse } from 'next/server'
import { getAllMarketDataRows, groupMarketDataRows } from '@/lib/market-data'

export async function GET() {
  try {
    const rows = await getAllMarketDataRows()

    return NextResponse.json({
      success: true,
      stocks: groupMarketDataRows(rows),
    })
  } catch (error) {
    console.error('Failed to fetch market data:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch market data',
      },
      { status: 500 }
    )
  }
}
