import { StyleSheet } from '@react-pdf/renderer'

// Color palette based on template.md specification
export const colors = {
    background: '#fff',
    text: '#1a202c',
    textMuted: '#718096',
    border: '#edf2f7',
    tableHeader: '#f7fafc',
    positive: '#38a169',
    negativeBg: '#fff5f5',
    positiveBg: '#e6fffa',
    negative: '#e53e3e',
    blue: '#3182ce',
}

export const styles = StyleSheet.create({
    // Page layouts
    page: {
        padding: 25, // Reduced from 40
        fontFamily: 'Helvetica',
        backgroundColor: colors.background,
        fontSize: 9, // Reduced from 10
    },

    // Header section
    header: {
        fontSize: 16, // Reduced from 20
        marginBottom: 10, // Reduced from 20
        color: colors.text,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    headerTitle: {
        fontSize: 20, // Reduced from 24
        fontWeight: 'bold',
    },
    headerBrand: {
        color: colors.text,
    },
    headerAccent: {
        color: '#ed8936', // Orange accent
    },
    headerSubtitle: {
        fontSize: 8,
        color: colors.textMuted,
        marginTop: 2,
    },
    headerDate: {
        fontSize: 10,
        color: colors.textMuted,
        textAlign: 'right',
    },

    // Market Mood Bar
    moodContainer: {
        marginBottom: 12, // Reduced from 20
    },
    moodLabel: {
        fontSize: 8,
        color: colors.textMuted,
        marginBottom: 2,
    },
    moodBar: {
        height: 8, // Reduced from 12
        flexDirection: 'row',
        borderRadius: 4,
        overflow: 'hidden',
    },
    moodPositive: {
        backgroundColor: colors.positive,
    },
    moodNegative: {
        backgroundColor: colors.negative,
    },
    moodText: {
        fontSize: 6,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 1.4,
    },

    // Column layouts
    columnWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    column: {
        flex: 1,
    },

    // Metric cards (Top Gainers/Losers)
    card: {
        padding: 6, // Reduced from 10
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 4, // Reduced from 8
    },
    cardGainer: {
        backgroundColor: colors.positiveBg,
    },
    cardLoser: {
        backgroundColor: colors.negativeBg,
    },
    cardTicker: {
        fontSize: 10, // Reduced
        fontWeight: 'bold',
        color: colors.text,
    },
    cardPrice: {
        fontSize: 8,
        color: colors.textMuted,
        marginTop: 1,
    },
    cardChange: {
        fontSize: 9, // Reduced
        fontWeight: 'bold',
        marginTop: 2,
    },

    // Section headers
    sectionHeader: {
        fontSize: 10, // Reduced
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 10, // Reduced from 16
        marginBottom: 4, // Reduced from 8
        borderLeftWidth: 3,
        borderLeftColor: colors.blue,
        paddingLeft: 6,
    },

    // Tables
    tableHeader: {
        backgroundColor: colors.tableHeader,
        padding: 3, // Reduced
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tableHeaderCell: {
        fontSize: 7, // Reduced
        fontWeight: 'bold',
        color: colors.textMuted,
    },
    tableRow: {
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
        padding: 3, // Reduced
        flexDirection: 'row',
    },
    tableRowAlt: {
        backgroundColor: '#fafafa',
    },
    tableCell: {
        fontSize: 7, // Reduced
        color: colors.text,
    },
    tableCellTicker: {
        fontSize: 8, // Reduced
        fontWeight: 'bold',
    },
    tableCellRight: {
        textAlign: 'right',
    },

    // Value styling
    positive: {
        color: colors.positive,
        fontWeight: 'bold',
    },
    negative: {
        color: colors.negative,
        fontWeight: 'bold',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 25,
        right: 25,
        textAlign: 'center',
        fontSize: 7,
        color: colors.textMuted,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
        paddingTop: 8,
    },

    // Sparkline container
    sparklineContainer: {
        width: 60,
        height: 20,
    },

    // Price position bar
    priceBarContainer: {
        width: 60,
        height: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceBarTrack: {
        flex: 1,
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
    },
})

// Table column widths
export const columnWidths = {
    ticker: '15%',
    price: '15%',
    volume: '15%',
    change: '15%',
    sparkline: '20%',
    position: '20%',
}
