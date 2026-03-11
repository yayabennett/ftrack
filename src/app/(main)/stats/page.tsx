"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pulse, Flame, TrendUp, Barbell, Lightning } from '@phosphor-icons/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { StatTile } from '@/components/ui/stat-tile'
import dynamic from 'next/dynamic'
import type { WeeklyStatsDTO } from '@/lib/types'

const WeeklyChart = dynamic(() => import('@/components/stats/weekly-chart'), {
    ssr: false,
    loading: () => (
        <div className="h-[176px] flex items-end justify-between px-2 gap-2 pb-6 pt-8 w-full">
            {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="w-8 flex-1 rounded-t-sm bg-secondary animate-pulse" style={{ height: `${Math.random() * 60 + 20}%` }} />
            ))}
        </div>
    )
})

type WeeklyResponse = WeeklyStatsDTO & {
    weeklyStreak: number
    totalSessionsEver: number
}





export default function StatsPage() {
    const [range, setRange] = useState(7)
    const rangeOptions = [
        { label: 'Woche', value: 7 },
        { label: 'Monat', value: 30 },
        { label: '3 Monate', value: 90 },
    ]

    const { data, isLoading } = useQuery<WeeklyResponse>({
        queryKey: ['weekly-stats', range],
        queryFn: async () => {
            const res = await fetch(`/api/stats/weekly?range=${range}`)
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
            <header className="sticky top-0 z-40 h-14 bg-background/60 backdrop-blur-[32px] px-4 flex items-center justify-between border-b border-white/5">
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
                {/* Time Range Tabs */}
                <div className="flex gap-1.5 bg-secondary/40 rounded-2xl p-1">
                    {rangeOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setRange(opt.value)}
                            className={cn(
                                "flex-1 py-2 rounded-xl text-[12px] font-bold transition-all",
                                range === opt.value
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                {/* Hero Volume Card */}
                <Card className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent ring-1 ring-white/10 border-0 rounded-3xl overflow-hidden glow-primary">
                    <CardContent className="p-6 text-center">
                        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">
                            {range === 7 ? "Wochen-Volumen" : `Volumen (${range} Tage)`}
                        </p>
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
                    <StatTile icon={<Flame className="h-5 w-5" />} value={weeklyStreak} label="Streak" color="text-orange-400" bg="bg-orange-400/10" />
                    <StatTile icon={<Pulse className="h-5 w-5" />} value={sessionsCount} label={range === 7 ? "Diese Woche" : `${range} Tage`} color="text-primary" bg="bg-primary/10" />
                    <StatTile icon={<Barbell className="h-5 w-5" />} value={totalSessionsEver} label="Gesamt" color="text-emerald-400" bg="bg-emerald-400/10" />
                </div>

                {/* Real Recharts Bar Chart */}
                <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-foreground">
                            <TrendUp className="h-4 w-4 text-primary" />
                            Wochenübersicht — Volumen (kg)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        {isLoading ? (
                            <div className="h-[176px] flex items-end justify-between px-2 gap-2 pb-6 pt-8 w-full">
                                {Array.from({ length: range }).map((_, i) => (
                                    <Skeleton key={i} className={cn("rounded-t-sm bg-secondary animate-pulse", range > 7 ? "w-full" : "w-8")} style={{ height: `${Math.random() * 60 + 20}%` }} />
                                ))}
                            </div>
                        ) : (
                            <WeeklyChart data={data?.days ?? []} todayISO={todayISO} range={range} />
                        )}
                    </CardContent>
                </Card>

                {/* Motivation Card */}
                <div className="bg-secondary/20 rounded-2xl p-4 flex gap-3 items-center border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Lightning className="w-5 h-5" />
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
