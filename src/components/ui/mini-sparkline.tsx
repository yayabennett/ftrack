export function MiniSparkline({ data, trend }: { data: number[], trend: 'up' | 'down' | 'flat' | null }) {
    if (!data || data.length < 2) return null

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min === 0 ? 1 : max - min

    // SVG viewBox standardizes coordinates (width 40, height 16)
    const w = 40
    const h = 16

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * w
        // Y is inverted (0 is top in SVG)
        const y = h - ((val - min) / range) * h
        return `${x},${y}`
    }).join(' ')

    // Color based on trend
    let strokeClass = "stroke-muted-foreground/30"
    if (trend === 'up') strokeClass = "stroke-green-400"
    if (trend === 'down') strokeClass = "stroke-red-400"

    return (
        <svg
            width={w}
            height={h}
            viewBox={`-2 -2 ${w + 4} ${h + 4}`}
            className="overflow-visible opacity-80"
            aria-hidden="true"
        >
            <polyline
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={strokeClass}
                points={points}
            />
            {/* Show the last data point as a prominent dot if there's a trend */}
            {trend && data.length > 0 && (
                <circle
                    cx={w}
                    cy={h - ((data[data.length - 1] - min) / range) * h}
                    r="2.5"
                    className={`fill-current opacity-100 ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground'}`}
                />
            )}
        </svg>
    )
}
