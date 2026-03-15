import { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { toDateKey } from './date'

export const MARKET_DATA_VALUE_FIELDS = [
  'volume',
  'lastTradedPrice',
  'closingPrice',
  'priceChange',
  'closingBid',
  'closingAsk',
  'change1DayPct',
  'change30DayPct',
  'relativeVolume',
] as const

export const MARKET_DATA_CSV_COLUMNS = [
  'ticker',
  'date',
  ...MARKET_DATA_VALUE_FIELDS,
] as const

const marketDataSelect = {
  ticker: true,
  date: true,
  volume: true,
  lastTradedPrice: true,
  closingPrice: true,
  priceChange: true,
  closingBid: true,
  closingAsk: true,
  change1DayPct: true,
  change30DayPct: true,
  relativeVolume: true,
} satisfies Prisma.PriceDataSelect

type MarketDataRow = Prisma.PriceDataGetPayload<{
  select: typeof marketDataSelect
}>

export interface MarketDataPoint {
  date: string
  volume: number
  lastTradedPrice: number
  closingPrice: number
  priceChange: number
  closingBid: number
  closingAsk: number
  change1DayPct: number | null
  change30DayPct: number | null
  relativeVolume: number | null
}

export interface StockMarketData {
  ticker: string
  marketData: MarketDataPoint[]
}

type CsvCellValue = string | number | null

type FlatMarketDataRecord = {
  ticker: string
} & MarketDataPoint

export async function getAllMarketDataRows(): Promise<MarketDataRow[]> {
  return prisma.priceData.findMany({
    select: marketDataSelect,
    orderBy: [{ ticker: 'asc' }, { date: 'asc' }],
  })
}

export function groupMarketDataRows(rows: MarketDataRow[]): StockMarketData[] {
  const stocks: StockMarketData[] = []
  let currentStock: StockMarketData | null = null

  for (const row of rows) {
    if (!currentStock || currentStock.ticker !== row.ticker) {
      currentStock = {
        ticker: row.ticker,
        marketData: [],
      }
      stocks.push(currentStock)
    }

    currentStock.marketData.push(toMarketDataPoint(row))
  }

  return stocks
}

export function buildMarketDataCsv(rows: MarketDataRow[]): string {
  const header = MARKET_DATA_CSV_COLUMNS.join(',')
  const dataRows = rows.map((row) => {
    const record = toFlatMarketDataRecord(row)

    return MARKET_DATA_CSV_COLUMNS.map((column) => {
      const value = record[column]
      return escapeCsvCell(value)
    }).join(',')
  })

  return [header, ...dataRows].join('\n')
}

function toMarketDataPoint(row: MarketDataRow): MarketDataPoint {
  return {
    date: toDateKey(row.date),
    volume: row.volume,
    lastTradedPrice: row.lastTradedPrice,
    closingPrice: row.closingPrice,
    priceChange: row.priceChange,
    closingBid: row.closingBid,
    closingAsk: row.closingAsk,
    change1DayPct: row.change1DayPct,
    change30DayPct: row.change30DayPct,
    relativeVolume: row.relativeVolume,
  }
}

function toFlatMarketDataRecord(row: MarketDataRow): FlatMarketDataRecord {
  return {
    ticker: row.ticker,
    ...toMarketDataPoint(row),
  }
}

function escapeCsvCell(value: CsvCellValue): string {
  if (value === null) {
    return ''
  }

  const stringValue = String(value)
  if (!/[",\n]/.test(stringValue)) {
    return stringValue
  }

  return `"${stringValue.replace(/"/g, '""')}"`
}
