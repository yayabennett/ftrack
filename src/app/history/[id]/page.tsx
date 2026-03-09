"use client"

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Clock, Barbell, Calendar, Info } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { WorkoutSessionDTO } from '@/lib/types'

export default function SessionDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: session, isLoading, error } = useQuery({
        queryKey: ['session', id],
        queryFn: async () => {
            const res = await fetch(`/api/sessions/${id}`)
            if (!res.ok) throw new Error('Failed to fetch session details')
            return res.json() as Promise<WorkoutSessionDTO>
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
                    <Skeleton className="h-[100px] w-full rounded-2xl bg-card border border-white/5" />
                    <Skeleton className="h-[200px] w-full rounded-2xl bg-card border border-white/5" />
                </div>
            </div>
        )
    }

    if (error || !session) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                    <Info className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Einheit nicht gefunden</h2>
                <p className="text-muted-foreground mb-6">Wir konnten diese Einheit leider nicht laden.</p>
                <Button onClick={() => router.push('/history')} variant="secondary" className="rounded-xl">
                    Zurück zum Verlauf
                </Button>
            </div>
        )
    }

    // Calculate aggregated stats
    let totalVolume = 0
    let totalSets = 0
    session.exercises.forEach(ex => {
        ex.sets.forEach(set => {
            totalVolume += set.weight * set.reps
            totalSets += 1
        })
    })

    const startedAt = new Date(session.startedAt)
    const endedAt = session.endedAt ? new Date(session.endedAt) : null
    const durationMins = endedAt ? Math.round((endedAt.getTime() - startedAt.getTime()) / 60000) : 0
    const volumeStr = totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`

    return (
        <div className="min-h-screen bg-background pb-28">
            <header className="sticky top-0 z-40 h-14 bg-background/60 backdrop-blur-[32px] px-4 flex items-center gap-4 border-b border-white/5">
                <Link href="/history">
                    <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full -ml-2 text-foreground hover:bg-secondary/80">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-[18px] font-bold tracking-tight text-foreground truncate">
                    {session.template?.name || 'Freies Workout'}
                </h1>
            </header>

            <div className="container mx-auto p-4 space-y-6 mt-2 animate-in slide-in-from-bottom-4 duration-300">
                {/* Overview Hero Card */}
                <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent ring-1 ring-white/10 border-0 rounded-3xl overflow-hidden">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-[12px] font-bold tracking-wider text-muted-foreground uppercase mb-4">
                            <Calendar className="w-4 h-4" />
                            {startedAt.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-background/40 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                                <span className="text-2xl font-extrabold text-foreground">{volumeStr}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Volumen</span>
                            </div>
                            <div className="bg-background/40 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                                <span className="text-2xl font-extrabold text-foreground">{durationMins}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Minuten</span>
                            </div>
                            <div className="bg-background/40 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                                <span className="text-2xl font-extrabold text-foreground">{totalSets}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Sätze</span>
                            </div>
                        </div>

                        {session.notes && (
                            <div className="mt-4 p-3 bg-secondary/30 rounded-xl text-sm italic text-muted-foreground">
                                &quot;{session.notes}&quot;
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Exercises List */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">
                        Übungen ({session.exercises.length})
                    </h3>

                    {session.exercises.map((ex, index) => (
                        <Card key={ex.id} className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                            <CardContent className="p-0">
                                <div className="p-3 bg-secondary/30 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">
                                            {index + 1}
                                        </div>
                                        <Link href={`/exercises/${ex.exercise.id}`} className="font-semibold text-[15px] hover:text-primary transition-colors">
                                            {ex.exercise.name}
                                        </Link>
                                    </div>
                                </div>
                                <div className="grid grid-cols-[3rem_1fr_1fr] gap-2 p-3 pb-2 text-[11px] font-bold text-muted-foreground text-center uppercase tracking-wider">
                                    <div>Satz</div>
                                    <div>kg</div>
                                    <div>Wdh</div>
                                </div>
                                <div className="space-y-1 p-2 pt-0">
                                    {ex.sets.map((set, sIdx) => (
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
                    ))}
                </div>
            </div>
        </div>
    )
}
