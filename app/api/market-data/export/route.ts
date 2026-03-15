import { NextResponse } from 'next/server'
import { buildMarketDataCsv, getAllMarketDataRows } from '@/lib/market-data'

export async function GET() {
  try {
    const rows = await getAllMarketDataRows()
    const csv = buildMarketDataCsv(rows)

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="market-data-export.csv"',
      },
    })
  } catch (error) {
    console.error('Failed to export market data CSV:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export market data CSV',
      },
      { status: 500 }
    )
  }
}
