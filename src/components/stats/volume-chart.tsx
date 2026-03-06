"use client"

import { useMemo } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

// Define the shape of our daily volume data
export interface DailyVolume {
    date: string // e.g., '2026-03-01'
    volume: number // total weight * reps for that day
    label: string // e.g., '01.03'
}

interface VolumeChartProps {
    data: DailyVolume[]
    totalVolume: number
}

// A custom tooltip to match our dark UI theme
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover text-popover-foreground rounded-lg ring-1 ring-white/10 p-2 shadow-xl border-0 text-xs">
                <p className="font-bold mb-1 opacity-70">{label}</p>
                <p className="font-bold text-primary text-[14px]">
                    {payload[0].value.toLocaleString('de-DE')} kg
                </p>
            </div>
        )
    }
    return null
}

export function VolumeChart({ data, totalVolume }: VolumeChartProps) {
    // Format the total volume for the header
    const volumeText = totalVolume > 1000
        ? `${(totalVolume / 1000).toFixed(1)}t`
        : `${totalVolume.toLocaleString('de-DE')} kg`

    return (
        <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Volumen Verlauf (30 Tage)
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                    Insgesamt <span className="font-bold text-foreground">{volumeText}</span> bewegt.
                </p>
            </CardHeader>
            <CardContent className="p-4 pt-4">
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: '#888888', fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                hide={false}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: '#888888' }}
                                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Bar
                                dataKey="volume"
                                radius={[4, 4, 4, 4]}
                                maxBarSize={40}
                            >
                                {
                                    data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            // Highlight the bar if it's the highest, otherwise make it slightly dimmer
                                            fill="hsl(var(--primary))"
                                            fillOpacity={entry.volume > 0 ? 0.9 : 0.3}
                                        />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
