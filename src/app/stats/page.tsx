"use client"

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Flame, TrendingUp, Dumbbell, Zap } from 'lucide-react'
import Link from 'next/link'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'
import type { WeeklyStatsDTO } from '@/lib/types'

type WeeklyResponse = WeeklyStatsDTO & {
    weeklyStreak: number
    totalSessionsEver: number
}

function StatTile({ icon, value, label, color, bgColor }: {
    icon: React.ReactNode; value: number; label: string; color: string; bgColor: string
}) {
    return (
        <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 text-card-foreground card-hover">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-1.5">
                <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">{value}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
            </CardContent>
        </Card>
    )
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

export default function StatsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['weekly-stats'],
        queryFn: async () => {
            const res = await fetch('/api/stats/weekly')
            if (!res.ok) throw new Error('Failed to fetch stats')
            return res.json() as Promise<WeeklyResponse>
        }
    })

    const totalVolume = data?.totalVolume ?? 0
    const volumeDisplay = totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}` : `${totalVolume}`
    const volumeUnit = totalVolume > 1000 ? 't' : 'kg'
    const weeklyStreak = data?.weeklyStreak ?? 0
    const sessionsCount = data?.sessionsCount ?? 0
    const totalSessionsEver = data?.totalSessionsEver ?? 0

    // Detect today's bar
    const todayISO = new Date().toISOString().split('T')[0]

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between border-b border-white/5">
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Statistiken</h1>
                <Link href="/settings">
                    <div className="h-9 w-9 rounded-full bg-secondary ring-1 ring-white/5 flex items-center justify-center text-muted-foreground hover:bg-secondary/80 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                </Link>
            </header>

            <div className="container mx-auto p-4 space-y-5 animate-in fade-in duration-300">
                {/* Hero Volume Card */}
                <Card className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent ring-1 ring-white/10 border-0 rounded-3xl overflow-hidden glow-primary">
                    <CardContent className="p-6 text-center">
                        <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-2">Wochen-Volumen</p>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center gap-2 h-[88px]">
                                <Skeleton className="h-12 w-32 rounded-lg bg-primary/20" />
                                <Skeleton className="h-4 w-48 rounded-md bg-primary/10" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-extrabold text-gradient tracking-tighter">{volumeDisplay}</span>
                                    <span className="text-lg font-bold text-muted-foreground">{volumeUnit}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">{data?.totalSets ?? 0} Sätze in {sessionsCount} Einheiten</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Stat Tiles */}
                <div className="grid grid-cols-3 gap-3">
                    <StatTile icon={<Flame className="h-5 w-5" />} value={weeklyStreak} label="Streak" color="text-orange-400" bgColor="bg-orange-400/10" />
                    <StatTile icon={<Activity className="h-5 w-5" />} value={sessionsCount} label="Diese Woche" color="text-primary" bgColor="bg-primary/10" />
                    <StatTile icon={<Dumbbell className="h-5 w-5" />} value={totalSessionsEver} label="Gesamt" color="text-emerald-400" bgColor="bg-emerald-400/10" />
                </div>

                {/* Real Recharts Bar Chart */}
                <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-foreground">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Wochenübersicht — Volumen (kg)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        {isLoading ? (
                            <div className="h-[176px] flex items-end justify-between px-2 gap-2 pb-6 pt-8">
                                <Skeleton className="w-8 h-12 rounded-t-sm bg-secondary" />
                                <Skeleton className="w-8 h-24 rounded-t-sm bg-secondary" />
                                <Skeleton className="w-8 h-16 rounded-t-sm bg-secondary" />
                                <Skeleton className="w-8 h-32 rounded-t-sm bg-primary/40" />
                                <Skeleton className="w-8 h-20 rounded-t-sm bg-secondary" />
                                <Skeleton className="w-8 h-8 rounded-t-sm bg-secondary" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={176}>
                                <BarChart
                                    data={data?.days ?? []}
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
                                        {(data?.days ?? []).map((entry) => (
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
                        )}
                    </CardContent>
                </Card>

                {/* Motivation Card */}
                <div className="bg-secondary/20 rounded-2xl p-4 flex gap-3 items-center border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[13px] font-semibold text-foreground">
                            {weeklyStreak > 0 ? `${weeklyStreak} Wochen am Stück!` : 'Starte deinen Streak!'}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                            {weeklyStreak >= 4 ? 'Unglaubliche Konsistenz. Du bist eine Maschine.' :
                                weeklyStreak >= 2 ? 'Dranbleiben! Die Gewohnheit formt sich.' :
                                    weeklyStreak >= 1 ? "Guter Start. Nächste Woche wird's zum Streak!" :
                                        'Jede Reise beginnt mit dem ersten Schritt.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
