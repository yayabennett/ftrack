"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, Barbell, Play } from '@phosphor-icons/react'
import type { HistorySessionDTO } from '@/lib/types'
import Link from 'next/link'

export default function HistoryPage() {
    const [visibleCount, setVisibleCount] = useState(20)

    const { data: sessions = [], isLoading } = useQuery({
        queryKey: ['history-sessions'],
        queryFn: async () => {
            const res = await fetch('/api/sessions')
            if (!res.ok) throw new Error('Failed to fetch history')
            return res.json() as Promise<HistorySessionDTO[]>
        }
    })

    const visibleSessions = sessions.slice(0, visibleCount)

    // Grouping by Month/Year
    const grouped = visibleSessions.reduce((acc, session) => {
        const d = new Date(session.startedAt)
        const monthYear = d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
        if (!acc[monthYear]) acc[monthYear] = []
        acc[monthYear].push(session)
        return acc
    }, {} as Record<string, HistorySessionDTO[]>)

    return (
        <div className="min-h-screen bg-background pb-28">
            <header className="sticky top-0 z-40 h-14 bg-background/60 backdrop-blur-[32px] px-4 flex items-center border-b border-white/5">
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Verlauf</h1>
            </header>

            <div className="container mx-auto p-4 space-y-6 mt-2">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-32 bg-secondary/50 mb-2 mt-4" />
                        <Skeleton className="h-[96px] w-full rounded-2xl bg-card border border-white/5" />
                        <Skeleton className="h-[96px] w-full rounded-2xl bg-card border border-white/5" />
                        <Skeleton className="h-4 w-32 bg-secondary/50 mb-2 mt-8" />
                        <Skeleton className="h-[96px] w-full rounded-2xl bg-card border border-white/5" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center mt-12 mb-12 space-y-3 p-8 glass-panel rounded-3xl mx-2 shadow-soft">
                        <div className="w-20 h-20 bg-primary/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 inner-highlight shadow-sm shadow-primary/20">
                            <Calendar className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">Kein Verlauf</h3>
                        <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                            Du hast noch keine Workouts abgeschlossen.
                        </p>
                        <Link href="/workout/start">
                            <button className="mt-4 px-6 py-2 bg-primary/10 text-primary font-bold rounded-xl active:scale-95 transition-transform">
                                Erstes Workout starten
                            </button>
                        </Link>
                    </div>
                ) : (
                    Object.entries(grouped).map(([month, monthSessions]) => (
                        <div key={month} className="space-y-3">
                            <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">
                                {month}
                            </h3>
                            <div className="space-y-2">
                                {monthSessions.map(session => {
                                    const d = new Date(session.startedAt)
                                    const now = new Date()
                                    now.setHours(0, 0, 0, 0)
                                    const sessionDateOnly = new Date(d)
                                    sessionDateOnly.setHours(0, 0, 0, 0)

                                    const diffDays = Math.round((now.getTime() - sessionDateOnly.getTime()) / (1000 * 60 * 60 * 24))

                                    let relativeLabel = d.toLocaleDateString('de-DE', { weekday: 'short' })
                                    let isHighlight = false
                                    if (diffDays === 0) { relativeLabel = 'Heute'; isHighlight = true }
                                    else if (diffDays === 1) { relativeLabel = 'Gestern'; isHighlight = true }

                                    const volumeStr = session.volume > 1000 ? `${(session.volume / 1000).toFixed(1)}t` : `${session.volume}kg`

                                    return (
                                        <Link key={session.id} href={`/history/${session.id}`} className="block active:scale-[0.98] transition-transform">
                                            <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                                                <CardContent className="p-4 flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${isHighlight ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : 'bg-secondary/50 text-muted-foreground'}`}>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{relativeLabel}</span>
                                                        <span className={`text-[18px] font-black leading-none mt-0.5 ${isHighlight ? 'text-primary' : 'text-foreground'}`}>{d.getDate()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-[15px] truncate">
                                                            {session.template?.name || 'Freies Workout'}
                                                        </h4>
                                                        <div className="flex gap-3 text-[12px] text-muted-foreground mt-1">
                                                            <span className="flex items-center gap-1 font-medium">
                                                                <Barbell className="w-3.5 h-3.5" /> {volumeStr}
                                                            </span>
                                                            <span className="flex items-center gap-1 font-medium">
                                                                <Clock className="w-3.5 h-3.5" /> {session.durationMinutes} min
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))
                )}

                {!isLoading && sessions.length > visibleCount && (
                    <div className="pt-4 pb-8 flex justify-center w-full">
                        <Button variant="outline" onClick={() => setVisibleCount(c => c + 20)} className="rounded-full shadow-sm text-xs font-bold ring-1 ring-white/5 bg-transparent border-0 text-muted-foreground hover:bg-secondary/40 active:scale-95 transition-all w-full">
                            Ältere Einheiten laden
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
