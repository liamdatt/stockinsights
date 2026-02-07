import { Svg, Rect, Circle } from '@react-pdf/renderer'

interface PricePositionBarProps {
    currentPrice: number
    low52w: number
    high52w: number
    width?: number
    height?: number
}

/**
 * 52-week price position indicator.
 * Shows a horizontal bar representing the range with a dot for current position.
 */
export function PricePositionBar({
    currentPrice,
    low52w,
    high52w,
    width = 60,
    height = 12
}: PricePositionBarProps) {
    // Calculate position as percentage
    const range = high52w - low52w
    if (range <= 0) {
        // If no range, show at center
        return (
            <Svg width={width} height={height}>
                <Rect x={0} y={4} width={width} height={4} fill="#e2e8f0" rx={2} />
                <Circle cx={width / 2} cy={6} r={4} fill="#718096" />
            </Svg>
        )
    }

    const position = Math.max(0, Math.min(1, (currentPrice - low52w) / range))
    const dotX = position * (width - 8) + 4 // Account for dot radius

    // Color based on position: near high = green, near low = red
    let dotColor = '#718096' // neutral gray
    if (position >= 0.8) {
        dotColor = '#38a169' // near 52w high
    } else if (position <= 0.2) {
        dotColor = '#e53e3e' // near 52w low
    }

    return (
        <Svg width={width} height={height}>
            {/* Track */}
            <Rect x={0} y={4} width={width} height={4} fill="#e2e8f0" rx={2} />
            {/* Current position dot */}
            <Circle cx={dotX} cy={6} r={4} fill={dotColor} />
        </Svg>
    )
}
