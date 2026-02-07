import { Document, Page, View, Text, Font, Image } from '@react-pdf/renderer'
import { styles, colors } from './pdf-styles'
import type { ReportData, StockWithMetrics } from '@/lib/report-data'

Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
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
            <Page size="A4" style={[styles.page, { fontFamily: 'Roboto' }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>
                            <Text style={styles.headerBrand}>Flo</Text>
                            <Text style={styles.headerAccent}>Pro</Text>
                        </Text>
                        <Text style={styles.headerSubtitle}>EQUITY INSIGHTS</Text>
                    </View>
                    <View>
                        <Text style={styles.headerDate}>{data.formattedDate}</Text>
                        <Text style={[styles.headerSubtitle, { textAlign: 'right' }]}>Daily Market Summary</Text>
                    </View>
                </View>

                {/* Market Mood Bar */}
                <View style={styles.moodContainer}>
                    <Text style={styles.moodLabel}>
                        Market Mood: {data.totalGainers} Gainers / {data.totalLosers} Losers
                    </Text>
                    <View style={styles.moodBar}>
                        <View style={[styles.moodPositive, { width: `${data.marketMood}%` }]}>
                            <Text style={styles.moodText}>{data.marketMood.toFixed(0)}%</Text>
                        </View>
                        <View style={[styles.moodNegative, { width: `${100 - data.marketMood}%` }]}>
                            <Text style={styles.moodText}>{(100 - data.marketMood).toFixed(0)}%</Text>
                        </View>
                    </View>
                </View>

                {/* Top Gainers/Losers - Compact Cards */}
                <View style={styles.columnWrapper}>
                    <View style={styles.column}>
                        <Text style={[styles.sectionHeader, { borderLeftColor: colors.positive }]}>Top Gainers</Text>
                        {data.topGainers.slice(0, 3).map(stock => (
                            <CompactCard key={stock.ticker} stock={stock} type="gainer" />
                        ))}
                    </View>
                    <View style={styles.column}>
                        <Text style={[styles.sectionHeader, { borderLeftColor: colors.negative }]}>Top Losers</Text>
                        {data.topLosers.slice(0, 3).map(stock => (
                            <CompactCard key={stock.ticker} stock={stock} type="loser" />
                        ))}
                    </View>
                </View>

                {/* Hot Tab & Shock Tab */}
                <View style={[styles.columnWrapper, { marginTop: 10 }]}>
                    <View style={styles.column}>
                        <Text style={[styles.sectionHeader, { borderLeftColor: '#ed8936' }]}>Volume Leaders</Text>
                        <CompactTable stocks={data.volumeLeaders.slice(0, 5)} showVolume />
                    </View>
                    <View style={styles.column}>
                        <Text style={[styles.sectionHeader, { borderLeftColor: '#805ad5' }]}>Unusual Volume</Text>
                        <CompactTable stocks={data.unusualVolume.slice(0, 5)} showRelVol />
                    </View>
                </View>

                {/* Momentum Leaders - Single Row Tables */}
                <View style={[styles.columnWrapper, { marginTop: 10 }]}>
                    <View style={styles.column}>
                        <Text style={[styles.sectionHeader, { borderLeftColor: colors.positive }]}>Daily Leaders (1D%)</Text>
                        <CompactTable stocks={data.momentumDaily.slice(0, 5)} showChange1d />
                    </View>
                    <View style={styles.column}>
                        <Text style={[styles.sectionHeader, { borderLeftColor: colors.blue }]}>Monthly Leaders (30D%)</Text>
                        <CompactTable stocks={data.momentumMonthly.slice(0, 5)} showChange30d />
                    </View>
                </View>

                {/* Recovery Section (if any) */}
                {data.recoveryStocks.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                        <Text style={[styles.sectionHeader, { borderLeftColor: colors.positive }]}>
                            Recovery Watch (1D% &gt;3%, 30D% &lt;-10%)
                        </Text>
                        <CompactTable stocks={data.recoveryStocks.slice(0, 4)} showBoth />
                    </View>
                )}


                {/* Footer */}
                <Text style={styles.footer}>
                    Generated by FloPro Equity Insights • {new Date().getFullYear()}
                </Text>
            </Page>
        </Document >
    )
}

// Compact card for top gainers/losers
function CompactCard({ stock, type }: { stock: StockWithMetrics; type: 'gainer' | 'loser' }) {
    const isGainer = type === 'gainer'
    return (
        <View style={[styles.card, isGainer ? styles.cardGainer : styles.cardLoser, { padding: 4, marginBottom: 3 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={[styles.cardTicker, { fontSize: 10 }]}>
                        {stock.ticker}
                    </Text>
                    <VibeEmoji change={stock.change1DayPct} size={12} />
                </View>
                <Text style={[styles.cardChange, isGainer ? styles.positive : styles.negative, { fontSize: 9 }]}>
                    {formatPercent(stock.change1DayPct)}
                </Text>
            </View>
            <Text style={[styles.cardPrice, { fontSize: 8 }]}>${stock.closingPrice.toFixed(2)}</Text>
        </View>
    )
}

// Compact table without arrows, with vibes
function CompactTable({ stocks, showVolume, showRelVol, showChange1d, showChange30d, showBoth }: {
    stocks: StockWithMetrics[]
    showVolume?: boolean
    showRelVol?: boolean
    showChange1d?: boolean
    showChange30d?: boolean
    showBoth?: boolean
}) {
    return (
        <View>
            <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: 50 }]}>Ticker</Text>
                <Text style={[styles.tableHeaderCell, { width: 45, textAlign: 'right' }]}>Price</Text>
                {showVolume && <Text style={[styles.tableHeaderCell, { width: 40, textAlign: 'right' }]}>Vol</Text>}
                {showRelVol && <Text style={[styles.tableHeaderCell, { width: 35, textAlign: 'right' }]}>R.Vol</Text>}
                {(showChange1d || showVolume || showRelVol) && (
                    <Text style={[styles.tableHeaderCell, { width: 45, textAlign: 'right' }]}>1D%</Text>
                )}
                {showChange30d && <Text style={[styles.tableHeaderCell, { width: 45, textAlign: 'right' }]}>30D%</Text>}
                {showBoth && (
                    <>
                        <Text style={[styles.tableHeaderCell, { width: 40, textAlign: 'right' }]}>1D%</Text>
                        <Text style={[styles.tableHeaderCell, { width: 40, textAlign: 'right' }]}>30D%</Text>
                    </>
                )}
                <Text style={[styles.tableHeaderCell, { width: 25, textAlign: 'center' }]}>Vibe</Text>
            </View>
            {stocks.map((stock, i) => (
                <View key={stock.ticker} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                    <Text style={[styles.tableCellTicker, { width: 50 }]}>{stock.ticker}</Text>
                    <Text style={[styles.tableCell, { width: 45, textAlign: 'right' }]}>${stock.closingPrice.toFixed(2)}</Text>
                    {showVolume && <Text style={[styles.tableCell, { width: 40, textAlign: 'right' }]}>{formatCompact(stock.volume)}</Text>}
                    {showRelVol && <Text style={[styles.tableCell, { width: 35, textAlign: 'right' }]}>{(stock.relativeVolume ?? 0).toFixed(1)}x</Text>}
                    {(showChange1d || showVolume || showRelVol) && (
                        <Text style={[styles.tableCell, { width: 45, textAlign: 'right' }, getChangeStyle(stock.change1DayPct)]}>{formatPercent(stock.change1DayPct)}</Text>
                    )}
                    {showChange30d && (
                        <Text style={[styles.tableCell, { width: 45, textAlign: 'right' }, getChangeStyle(stock.change30DayPct)]}>{formatPercent(stock.change30DayPct)}</Text>
                    )}
                    {showBoth && (
                        <>
                            <Text style={[styles.tableCell, { width: 40, textAlign: 'right' }, getChangeStyle(stock.change1DayPct)]}>{formatPercent(stock.change1DayPct)}</Text>
                            <Text style={[styles.tableCell, { width: 40, textAlign: 'right' }, getChangeStyle(stock.change30DayPct)]}>{formatPercent(stock.change30DayPct)}</Text>
                        </>
                    )}
                    <View style={{ width: 25, alignItems: 'center', justifyContent: 'center' }}>
                        <VibeEmoji change={stock.change1DayPct} size={10} />
                    </View>
                </View>
            ))}
            {stocks.length === 0 && (
                <Text style={{ fontSize: 7, color: colors.textMuted, padding: 4, textAlign: 'center' }}>No data</Text>
            )}
        </View>
    )
}

// Utility functions
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
    return value >= 0 ? styles.positive : styles.negative
}

// Twemoji CDN base URL (emoji images)
const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72'

// Emoji codepoints for Twemoji
const EMOJI_CODES = {
    rocket: '1f680',      // 🚀
    fire: '1f525',        // 🔥
    chartUp: '1f4c8',     // 📈
    triangleDown: '1f53b', // 🔻 (red triangle down)
    ice: '1f9ca',         // 🧊
    chartDown: '1f4c9',   // 📉
    dot: '2022',          // •
}

function VibeEmoji({ change, size = 10 }: { change: number | null; size?: number }) {
    let code = EMOJI_CODES.dot
    if (change === null) code = EMOJI_CODES.dot
    else if (change >= 15) code = EMOJI_CODES.rocket
    else if (change >= 5) code = EMOJI_CODES.fire
    else if (change > 0) code = EMOJI_CODES.chartUp
    else if (change <= -10) code = EMOJI_CODES.triangleDown
    else if (change <= -5) code = EMOJI_CODES.ice
    else code = EMOJI_CODES.chartDown

    return (
        <Image
            src={`${TWEMOJI_BASE}/${code}.png`}
            style={{ width: size, height: size }}
        />
    )
}
