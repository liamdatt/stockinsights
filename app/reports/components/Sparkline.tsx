import { Svg, Polyline } from '@react-pdf/renderer'

interface SparklineProps {
    data: number[]
    width?: number
    height?: number
    color?: string
}

/**
 * Mini sparkline chart for price trends using react-pdf SVG primitives.
 * Maps an array of values to X,Y coordinates for a polyline.
 */
export function Sparkline({
    data,
    width = 60,
    height = 20,
    color = '#3182ce'
}: SparklineProps) {
    if (!data || data.length < 2) {
        return null
    }

    // Calculate min/max for normalization
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1 // Avoid division by zero

    // Padding for visual breathing room
    const paddingY = 2
    const availableHeight = height - (paddingY * 2)

    // Generate points string for polyline
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width
        // Invert Y because SVG Y-axis is top-down
        const normalizedY = (value - min) / range
        const y = paddingY + (1 - normalizedY) * availableHeight
        return `${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')

    // Determine color based on trend (start vs end)
    const trendColor = data[data.length - 1] >= data[0] ? '#38a169' : '#e53e3e'

    return (
        <Svg width={width} height={height}>
            <Polyline
                points={points}
                stroke={color === 'auto' ? trendColor : color}
                strokeWidth={1.5}
                fill="none"
            />
        </Svg>
    )
}
