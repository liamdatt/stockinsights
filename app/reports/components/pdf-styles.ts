import { StyleSheet } from '@react-pdf/renderer'

// Professional color palette
export const colors = {
    // Text
    textPrimary: '#1A202C',
    textSecondary: '#4A5568',
    textMuted: '#718096',

    // Status
    positive: '#2F855A',
    positiveBg: '#F0FFF4',
    negative: '#C53030',
    negativeBg: '#FFF5F5',

    // Accents
    blue: '#3182CE',
    amber: '#D69E2E',
    amberBg: '#FFFAF0',

    // Backgrounds
    headerBg: '#1A365D',
    cardBg: '#FFFFFF',
    tableBg: '#F8FAFC',
    border: '#E2E8F0',
    borderDark: '#CBD5E0',

    // Branding
    brand: '#4C51BF',
    accent: '#ED8936',
}

export const styles = StyleSheet.create({
    // Page layout
    page: {
        padding: 20,
        fontSize: 8,
        fontFamily: 'Roboto',
        backgroundColor: '#FAFBFC',
    },

    // ============ ROW 1: Header (10%) ============
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 8,
        borderBottom: `1pt solid ${colors.border}`,
        marginBottom: 10,
    },
    headerBrand: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    brandLogo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.brand,
    },
    brandAccent: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.accent,
    },
    brandSubtitle: {
        fontSize: 7,
        color: colors.textMuted,
        marginLeft: 6,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    headerDate: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    moodBar: {
        flexDirection: 'row',
        marginTop: 4,
        height: 6,
        width: 100,
        borderRadius: 3,
        overflow: 'hidden',
    },
    moodPositive: {
        backgroundColor: colors.positive,
        height: '100%',
    },
    moodNegative: {
        backgroundColor: colors.negative,
        height: '100%',
    },
    moodLabel: {
        fontSize: 6,
        color: colors.textMuted,
        marginTop: 2,
    },

    // ============ GRID LAYOUT ============
    gridRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 10,
    },
    gridCol2: {
        flex: 1,
    },
    gridCol3: {
        flex: 1,
    },

    // ============ CARD STYLING ============
    card: {
        backgroundColor: colors.cardBg,
        borderRadius: 4,
        border: `0.5pt solid ${colors.border}`,
        padding: 8,
    },
    cardHeader: {
        fontSize: 7,
        fontWeight: 'bold',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
        paddingBottom: 4,
        borderBottom: `0.5pt solid ${colors.border}`,
    },

    // ============ MINI CARDS (Top Movers) ============
    miniCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 6,
        marginBottom: 3,
        borderRadius: 3,
        backgroundColor: colors.tableBg,
    },
    miniCardGainer: {
        borderLeft: `2pt solid ${colors.positive}`,
    },
    miniCardLoser: {
        borderLeft: `2pt solid ${colors.negative}`,
    },
    tickerSymbol: {
        fontWeight: 'bold',
        fontSize: 9,
        color: colors.textPrimary,
    },
    priceSmall: {
        fontSize: 7,
        color: colors.textMuted,
    },

    // ============ PERCENTAGE PILLS ============
    pillPositive: {
        color: colors.positive,
        backgroundColor: colors.positiveBg,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 3,
        fontSize: 8,
        fontWeight: 'bold',
    },
    pillNegative: {
        color: colors.negative,
        backgroundColor: colors.negativeBg,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 3,
        fontSize: 8,
        fontWeight: 'bold',
    },

    // ============ TABLE STYLING ============
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.tableBg,
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderBottom: `1pt solid ${colors.borderDark}`,
    },
    tableHeaderCell: {
        fontSize: 6,
        fontWeight: 'bold',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 3,
        paddingHorizontal: 4,
        borderBottom: `0.5pt solid ${colors.border}`,
    },
    tableRowAlt: {
        backgroundColor: '#FAFBFC',
    },
    tableRowHighlight: {
        backgroundColor: colors.amberBg,
    },
    tableCell: {
        fontSize: 7,
        color: colors.textSecondary,
    },
    tableCellTicker: {
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },

    // ============ STATUS INDICATORS ============
    statusPositive: {
        color: colors.positive,
        fontWeight: 'bold',
    },
    statusNegative: {
        color: colors.negative,
        fontWeight: 'bold',
    },

    // ============ FOOTER ============
    footer: {
        position: 'absolute',
        bottom: 15,
        left: 20,
        right: 20,
        textAlign: 'center',
        fontSize: 6,
        color: colors.textMuted,
        borderTop: `0.5pt solid ${colors.border}`,
        paddingTop: 6,
    },
})

// Column width configurations
export const columnWidths = {
    ticker: 45,
    price: 40,
    change: 38,
    volume: 35,
    relVol: 32,
    volatility: 32,
    dist52w: 35,
    status: 20,
}
