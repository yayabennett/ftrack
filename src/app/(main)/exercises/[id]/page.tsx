"use client"

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Barbell, TrendUp, Info } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ExerciseDetailDTO } from '@/lib/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function ExerciseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: exercise, isLoading, error } = useQuery({
        queryKey: ['exercise-detail', id],
        queryFn: async () => {
            const res = await fetch(`/api/exercises/${id}`)
            if (!res.ok) throw new Error('Failed to fetch exercise details')
            return res.json() as Promise<ExerciseDetailDTO>
        }
    })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pb-28">
                <header className="sticky top-0 z-40 h-14 bg-background/60 backdrop-blur-[32px] px-4 flex items-center gap-4 border-b border-white/5">
                    <Skeleton className="w-9 h-9 rounded-full bg-secondary" />
                    <Skeleton className="w-32 h-6 bg-secondary" />
                </header>
                <div className="container mx-auto p-4 space-y-4">
                    <Skeleton className="h-[200px] w-full rounded-2xl bg-card border border-white/5" />
                    <Skeleton className="h-[300px] w-full rounded-2xl bg-card border border-white/5" />
                </div>
            </div>
        )
    }

    if (error || !exercise) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                    <Info className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Übung nicht gefunden</h2>
                <p className="text-muted-foreground mb-6">Diese Übung konnte nicht geladen werden.</p>
                <Button onClick={() => router.back()} variant="secondary" className="rounded-xl">
                    Zurück
                </Button>
            </div>
        )
    }

    // Process chart data: Reverse so oldest is first for the X-Axis progression
    const chartData = [...exercise.history].reverse().map(session => {
        const d = new Date(session.date)
        return {
            dateStr: d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
            e1rm: session.e1RM,
            tooltipDate: d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
        }
    })

    const currentE1RM = chartData.length > 0 ? chartData[chartData.length - 1].e1rm : 0

    return (
        <div className="min-h-screen bg-background pb-28">
            <header className="sticky top-0 z-40 h-14 bg-background/60 backdrop-blur-[32px] px-4 flex items-center gap-4 border-b border-white/5">
                <Button onClick={() => router.back()} size="icon" variant="ghost" className="h-9 w-9 rounded-full -ml-2 text-foreground hover:bg-secondary/80">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-[18px] font-bold tracking-tight text-foreground truncate">
                    {exercise.name}
                </h1>
            </header>

            <div className="container mx-auto p-4 space-y-6 mt-2 animate-in slide-in-from-bottom-4 duration-300">
                {/* Progression Chart Card */}
                <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-3xl border-0 overflow-hidden text-card-foreground">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                                <TrendUp className="w-4 h-4" /> Progression (e1RM)
                            </CardTitle>
                        </div>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold text-foreground">{currentE1RM}</span>
                            <span className="text-sm font-bold text-muted-foreground">kg</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-6 px-2">
                        {chartData.length > 1 ? (
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="dateStr" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload
                                                    return (
                                                        <div className="bg-background/95 backdrop-blur-md ring-1 ring-white/10 p-3 rounded-xl shadow-lg">
                                                            <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">{data.tooltipDate}</p>
                                                            <p className="text-sm font-extrabold text-primary flex items-center gap-1">
                                                                {payload[0].value} kg e1RM
                                                            </p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Line type="monotone" dataKey="e1rm" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground bg-secondary/10 rounded-2xl mx-4">
                                <Barbell className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm font-medium">Nicht genug Daten für einen Chart.</p>
                                <p className="text-xs">Trainiere diese Übung öfter!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Session History Feed */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">
                        Vergangene Einheiten ({exercise.history.length})
                    </h3>

                    <div className="space-y-3">
                        {exercise.history.map((session, idx) => {
                            const date = new Date(session.date)
                            return (
                                <Link key={session.sessionId} href={`/history/${session.sessionId}`} className="block active:scale-[0.98] transition-transform">
                                    <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                                        <CardContent className="p-0">
                                            <div className="p-3 bg-secondary/30 border-b border-white/5 flex items-center justify-between">
                                                <span className="font-semibold text-[14px]">
                                                    {date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                                </span>
                                                <div className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                                    e1RM: {session.e1RM}kg
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-[3rem_1fr_1fr] gap-2 p-3 pb-2 text-xs font-bold text-muted-foreground text-center uppercase tracking-wider">
                                                <div>Satz</div>
                                                <div>kg</div>
                                                <div>Wdh</div>
                                            </div>
                                            <div className="space-y-1 p-2 pt-0">
                                                {session.sets.map((set, sIdx) => (
                                                    <div key={set.id} className="grid grid-cols-[3rem_1fr_1fr] gap-2 items-center rounded-xl p-2 bg-secondary/20">
                                                        <div className="text-center text-[13px] font-bold text-muted-foreground">
                                                            {sIdx + 1}
                                                        </div>
                                                        <div className="text-center font-semibold text-[15px]">{set.weight}</div>
                                                        <div className="text-center font-semibold text-[15px]">{set.reps}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )
                        })}

                        {exercise.history.length === 0 && (
                            <div className="text-center py-10 bg-secondary/10 rounded-2xl border border-white/5">
                                <p className="text-muted-foreground text-sm font-medium">Bisher keine abgeschlossenen Sätze.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
