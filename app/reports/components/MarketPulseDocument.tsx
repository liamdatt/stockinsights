import { Document, Page, View, Text, Font, Image, Svg, Polyline } from '@react-pdf/renderer'
import { styles, colors, columnWidths } from './pdf-styles'
import type { ReportData, StockWithMetrics } from '@/lib/report-data'

// Register Roboto font for professional typography
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' }
    ]
})

interface MarketPulseDocumentProps {
    data: ReportData
}

export function MarketPulseDocument({ data }: MarketPulseDocumentProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ============ ROW 1: HEADER & MARKET BREADTH (10%) ============ */}
                <View style={styles.headerRow}>
                    <View style={styles.headerBrand}>
                        <Text style={styles.brandLogo}>Flo</Text>
                        <Text style={styles.brandAccent}>Pro</Text>
                        <Text style={styles.brandSubtitle}>Equity Insights</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.headerDate}>{data.formattedDate}</Text>
                        <View style={styles.moodBar}>
                            <View style={[styles.moodPositive, { width: `${data.marketMood}%` }]} />
                            <View style={[styles.moodNegative, { width: `${100 - data.marketMood}%` }]} />
                        </View>
                        <Text style={styles.moodLabel}>{data.totalGainers}G / {data.totalLosers}L</Text>
                    </View>
                </View>

                {/* ============ ROW 2: TOP MOVERS (25%) ============ */}
                <View style={styles.gridRow}>
                    {/* Top Gainers */}
                    <View style={[styles.card, styles.gridCol3]}>
                        <Text style={styles.cardHeader}>Top Daily Gainers</Text>
                        {data.topGainers.slice(0, 3).map(stock => (
                            <MiniCard key={stock.ticker} stock={stock} type="gainer" />
                        ))}
                    </View>

                    {/* Top Losers */}
                    <View style={[styles.card, styles.gridCol3]}>
                        <Text style={styles.cardHeader}>Top Daily Losers</Text>
                        {data.topLosers.slice(0, 3).map(stock => (
                            <MiniCard key={stock.ticker} stock={stock} type="loser" />
                        ))}
                    </View>

                    {/* Market Summary */}
                    <View style={[styles.card, styles.gridCol3]}>
                        <Text style={styles.cardHeader}>Market Summary</Text>
                        <View style={{ gap: 4 }}>
                            <SummaryRow label="Total Stocks" value={data.totalTickers.toString()} />
                            <SummaryRow label="Gainers" value={data.totalGainers.toString()} positive />
                            <SummaryRow label="Losers" value={data.totalLosers.toString()} negative />
                            <SummaryRow label="Market Sentiment" value={`${data.marketMood.toFixed(0)}% Bullish`} />
                        </View>
                    </View>
                </View>

                {/* ============ ROW 3: VOLUME & SURGE (30%) ============ */}
                <View style={styles.gridRow}>
                    {/* Market Liquidity */}
                    <View style={[styles.card, styles.gridCol2]}>
                        <Text style={styles.cardHeader}>Market Liquidity (Top Volume)</Text>
                        <DataTable
                            stocks={data.volumeLeaders.slice(0, 6)}
                            columns={['ticker', 'price', 'volume', 'change', 'status']}
                        />
                    </View>

                    {/* Activity Surges */}
                    <View style={[styles.card, styles.gridCol2]}>
                        <Text style={styles.cardHeader}>Activity Surges (Rel. Volume &gt;2x)</Text>
                        <DataTable
                            stocks={data.unusualVolume.slice(0, 6)}
                            columns={['ticker', 'price', 'relVol', 'change', 'status']}
                            highlightHighVolume
                        />
                    </View>
                </View>

                {/* ============ ROW 4: MOMENTUM & RECOVERY (35%) ============ */}
                <View style={styles.gridRow}>
                    {/* Medium-Term Momentum */}
                    <View style={[styles.card, styles.gridCol2]}>
                        <Text style={styles.cardHeader}>Medium-Term Momentum (30D Leaders)</Text>
                        <DataTable
                            stocks={data.momentumMonthly.slice(0, 6)}
                            columns={['ticker', 'price', 'change30d', 'dist52w', 'sparkline']}
                            showSparklines
                        />
                    </View>

                    {/* Recovery Watch */}
                    <View style={[styles.card, styles.gridCol2]}>
                        <Text style={styles.cardHeader}>Recovery Watch (Daily Bounce)</Text>
                        {data.recoveryStocks.length > 0 ? (
                            <DataTable
                                stocks={data.recoveryStocks.slice(0, 6)}
                                columns={['ticker', 'price', 'change', 'change30d', 'volatility']}
                            />
                        ) : (
                            <Text style={{ fontSize: 7, color: colors.textMuted, textAlign: 'center', padding: 8 }}>
                                No recovery candidates today
                            </Text>
                        )}
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Generated by FloPro Equity Insights • {new Date().getFullYear()} • Confidential
                </Text>
            </Page>
        </Document>
    )
}

// ============ MINI CARD COMPONENT ============
function MiniCard({ stock, type }: { stock: StockWithMetrics; type: 'gainer' | 'loser' }) {
    const isGainer = type === 'gainer'
    return (
        <View style={[styles.miniCard, isGainer ? styles.miniCardGainer : styles.miniCardLoser]}>
            <View>
                <Text style={styles.tickerSymbol}>{stock.ticker}</Text>
                <Text style={styles.priceSmall}>${stock.closingPrice.toFixed(2)}</Text>
            </View>
            <Text style={isGainer ? styles.pillPositive : styles.pillNegative}>
                {formatPercent(stock.change1DayPct)}
            </Text>
        </View>
    )
}

// ============ SUMMARY ROW COMPONENT ============
function SummaryRow({ label, value, positive, negative }: {
    label: string;
    value: string;
    positive?: boolean;
    negative?: boolean
}) {
    const valueColor = positive ? colors.positive : negative ? colors.negative : colors.textPrimary
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
            <Text style={{ fontSize: 7, color: colors.textMuted }}>{label}</Text>
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: valueColor }}>{value}</Text>
        </View>
    )
}

// ============ DATA TABLE COMPONENT ============
type ColumnType = 'ticker' | 'price' | 'volume' | 'change' | 'change30d' | 'relVol' | 'volatility' | 'dist52w' | 'status' | 'sparkline'

function DataTable({ stocks, columns, highlightHighVolume, showSparklines }: {
    stocks: StockWithMetrics[]
    columns: ColumnType[]
    highlightHighVolume?: boolean
    showSparklines?: boolean
}) {
    const headerLabels: Record<ColumnType, string> = {
        ticker: 'TICKER',
        price: 'PRICE',
        volume: 'VOLUME',
        change: '1D CHG',
        change30d: '30D CHG',
        relVol: 'REL. VOL',
        volatility: 'RISK',
        dist52w: '52W DIST',
        status: '',
        sparkline: '30D TREND',
    }

    const colWidths: Record<ColumnType, number> = {
        ticker: 45,
        price: 40,
        volume: 38,
        change: 40,
        change30d: 40,
        relVol: 38,
        volatility: 32,
        dist52w: 40,
        status: 18,
        sparkline: 50,
    }

    return (
        <View>
            {/* Header */}
            <View style={styles.tableHeader}>
                {columns.map(col => (
                    <Text key={col} style={[styles.tableHeaderCell, { width: colWidths[col], textAlign: col === 'ticker' ? 'left' : 'right' }]}>
                        {headerLabels[col]}
                    </Text>
                ))}
            </View>

            {/* Data Rows */}
            {stocks.map((stock, i) => {
                const isHighVolume = highlightHighVolume && (stock.relativeVolume ?? 0) > 5.0
                const rowStyles = [
                    styles.tableRow,
                    ...(i % 2 === 1 ? [styles.tableRowAlt] : []),
                    ...(isHighVolume ? [styles.tableRowHighlight] : [])
                ]
                return (
                    <View key={stock.ticker} style={rowStyles}>
                        {columns.map(col => (
                            <TableCell key={col} stock={stock} column={col} width={colWidths[col]} showSparklines={showSparklines} />
                        ))}
                    </View>
                )
            })}

            {stocks.length === 0 && (
                <Text style={{ fontSize: 7, color: colors.textMuted, padding: 6, textAlign: 'center' }}>
                    No data available
                </Text>
            )}
        </View>
    )
}

// ============ TABLE CELL COMPONENT ============
function TableCell({ stock, column, width, showSparklines }: {
    stock: StockWithMetrics;
    column: ColumnType;
    width: number;
    showSparklines?: boolean;
}) {
    switch (column) {
        case 'ticker':
            return <Text style={[styles.tableCellTicker, { width }]}>{stock.ticker}</Text>
        case 'price':
            return <Text style={[styles.tableCell, { width, textAlign: 'right' }]}>${stock.closingPrice.toFixed(2)}</Text>
        case 'volume':
            return <Text style={[styles.tableCell, { width, textAlign: 'right' }]}>{formatCompact(stock.volume)}</Text>
        case 'change':
            return (
                <Text style={[styles.tableCell, { width, textAlign: 'right' }, getChangeStyle(stock.change1DayPct)]}>
                    {formatPercent(stock.change1DayPct)}
                </Text>
            )
        case 'change30d':
            return (
                <Text style={[styles.tableCell, { width, textAlign: 'right' }, getChangeStyle(stock.change30DayPct)]}>
                    {formatPercent(stock.change30DayPct)}
                </Text>
            )
        case 'relVol':
            return (
                <Text style={[styles.tableCell, { width, textAlign: 'right', fontWeight: (stock.relativeVolume ?? 0) > 5 ? 'bold' : 'normal' }]}>
                    {(stock.relativeVolume ?? 0).toFixed(1)}x
                </Text>
            )
        case 'volatility':
            return (
                <Text style={[styles.tableCell, { width, textAlign: 'right' }]}>
                    {stock.volatilityRank !== null ? stock.volatilityRank.toFixed(1) : '-'}
                </Text>
            )
        case 'dist52w':
            return (
                <Text style={[styles.tableCell, { width, textAlign: 'right' }, getChangeStyle(stock.high52wDistance)]}>
                    {formatPercent(stock.high52wDistance)}
                </Text>
            )
        case 'status':
            return (
                <View style={{ width, alignItems: 'center' }}>
                    <StatusIndicator change={stock.change1DayPct} />
                </View>
            )
        case 'sparkline':
            return showSparklines && stock.priceHistory.length > 0 ? (
                <View style={{ width, height: 14 }}>
                    <Sparkline data={stock.priceHistory} width={width - 4} height={12} />
                </View>
            ) : (
                <Text style={[styles.tableCell, { width, textAlign: 'center' }]}>-</Text>
            )
        default:
            return <Text style={[styles.tableCell, { width }]}>-</Text>
    }
}

// ============ SPARKLINE COMPONENT ============
function Sparkline({ data, width, height }: { data: number[]; width: number; height: number }) {
    if (data.length < 2) return null

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * (height - 2) - 1
        return `${x},${y}`
    }).join(' ')

    const isPositive = data[data.length - 1] >= data[0]

    return (
        <Svg width={width} height={height}>
            <Polyline
                points={points}
                fill="none"
                stroke={isPositive ? colors.positive : colors.negative}
                strokeWidth={1}
            />
        </Svg>
    )
}

// ============ STATUS INDICATOR ============
function StatusIndicator({ change }: { change: number | null }) {
    if (change === null) return <Text style={{ fontSize: 6, color: colors.textMuted }}>-</Text>

    const isPositive = change >= 0
    return (
        <View style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: isPositive ? colors.positive : colors.negative,
        }} />
    )
}

// ============ UTILITY FUNCTIONS ============
function formatPercent(value: number | null): string {
    if (value === null) return '-'
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
}

function formatCompact(num: number): string {
    return Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(num)
}

function getChangeStyle(value: number | null) {
    if (value === null) return {}
    return value >= 0 ? styles.statusPositive : styles.statusNegative
}
