"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'

export interface ChartDataEntry {
    date: string
    label: string
    volume: number
}

// Custom tooltip for the bar chart
function CustomTooltip({ active, payload, label }: {
    active?: boolean
    payload?: { value: number }[]
    label?: string
}) {
    if (!active || !payload?.length) return null
    const volume = payload[0].value
    return (
        <div className="bg-background/95 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-lg">
            <p className="font-bold text-foreground">{label}</p>
            {volume > 0 ? (
                <p className="text-primary font-semibold">
                    {volume >= 1000 ? `${(volume / 1000).toFixed(1)}t` : `${volume} kg`}
                </p>
            ) : (
                <p className="text-muted-foreground">Kein Training</p>
            )}
        </div>
    )
}

export default function WeeklyChart({ data, todayISO }: { data: ChartDataEntry[], todayISO: string }) {
    return (
        <ResponsiveContainer width="100%" height={176}>
            <BarChart
                data={data}
                margin={{ top: 8, right: 0, left: -24, bottom: 0 }}
                barCategoryGap="30%"
            >
                <XAxis
                    dataKey="label"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}t` : `${v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="volume" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {data.map((entry) => (
                        <Cell
                            key={entry.date}
                            fill={
                                entry.date === todayISO
                                    ? 'hsl(var(--primary))'
                                    : entry.volume > 0
                                        ? 'hsl(var(--primary) / 0.45)'
                                        : 'hsl(var(--secondary))'
                            }
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
