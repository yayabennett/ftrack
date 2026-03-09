"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Dumbbell, Clock, Flame, TrendingUp, Home, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

interface RecapData {
    templateName: string | null
    duration: number // minutes
    totalVolume: number
    totalSets: number
    exerciseCount: number
    prs: { exerciseName: string; weight: number; reps: number }[]
    previousVolume: number | null // for comparison
}

function RecapContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const sessionId = searchParams.get('sessionId')
    const [data, setData] = useState<RecapData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!sessionId) {
            router.push('/')
            return
        }

        const fetchRecap = async () => {
            try {
                const res = await fetch(`/api/sessions/${sessionId}/recap`)
                if (res.ok) {
                    setData(await res.json())
                }
            } catch {
                // fallback: redirect home
            } finally {
                setIsLoading(false)
            }
        }
        fetchRecap()
    }, [sessionId, router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Zusammenfassung wird geladen…</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8 text-center">
                <p className="text-muted-foreground">Keine Daten verfügbar.</p>
                <Link href="/">
                    <Button variant="secondary">Zurück zur Startseite</Button>
                </Link>
            </div>
        )
    }

    const volumeChange = data.previousVolume
        ? ((data.totalVolume - data.previousVolume) / data.previousVolume * 100)
        : null
    const volumeDisplay = data.totalVolume > 1000 ? `${(data.totalVolume / 1000).toFixed(1)}t` : `${data.totalVolume}kg`

    // Motivational message based on performance
    const getMessage = () => {
        if (data.prs.length > 0) return '🏆 Neue Bestleistungen aufgestellt!'
        if (volumeChange && volumeChange > 5) return '📈 Stärker als letztes Mal. Weiter so!'
        if (data.totalSets >= 20) return '💪 Mächtige Einheit absolviert!'
        return '✅ Gut gemacht. Konsistenz ist alles.'
    }

    return (
        <div className="min-h-screen bg-background pb-28 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="pt-12 pb-6 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4 glow-primary">
                    <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    {data.templateName || 'Freies Workout'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Training abgeschlossen</p>
            </div>

            {/* Motivation Banner */}
            <div className="px-5 mb-6">
                <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent rounded-2xl p-4 text-center border border-white/5">
                    <p className="text-[15px] font-bold text-foreground">{getMessage()}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="px-5 grid grid-cols-2 gap-3 mb-6">
                <Card className="bg-card ring-1 ring-white/5 border-0 rounded-2xl">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                        <Dumbbell className="w-5 h-5 text-primary mb-1" />
                        <span className="text-2xl font-extrabold text-foreground">{volumeDisplay}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Volumen</span>
                        {volumeChange !== null && (
                            <span className={`text-[11px] font-bold mt-1 ${volumeChange > 0 ? 'text-green-400' : volumeChange < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                                {volumeChange > 0 ? '↑' : volumeChange < 0 ? '↓' : '→'} {Math.abs(volumeChange).toFixed(1)}%
                            </span>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card ring-1 ring-white/5 border-0 rounded-2xl">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                        <Clock className="w-5 h-5 text-primary mb-1" />
                        <span className="text-2xl font-extrabold text-foreground">{data.duration}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Minuten</span>
                    </CardContent>
                </Card>

                <Card className="bg-card ring-1 ring-white/5 border-0 rounded-2xl">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                        <Flame className="w-5 h-5 text-orange-400 mb-1" />
                        <span className="text-2xl font-extrabold text-foreground">{data.totalSets}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sätze</span>
                    </CardContent>
                </Card>

                <Card className="bg-card ring-1 ring-white/5 border-0 rounded-2xl">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                        <TrendingUp className="w-5 h-5 text-emerald-400 mb-1" />
                        <span className="text-2xl font-extrabold text-foreground">{data.exerciseCount}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Übungen</span>
                    </CardContent>
                </Card>
            </div>

            {/* PRs */}
            {data.prs.length > 0 && (
                <div className="px-5 mb-6">
                    <h3 className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-3 px-1">
                        🏆 Neue PRs
                    </h3>
                    <div className="space-y-2">
                        {data.prs.map((pr, idx) => (
                            <Card key={idx} className="bg-gradient-to-r from-primary/10 to-transparent ring-1 ring-primary/20 border-0 rounded-2xl">
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                                        <Trophy className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[14px] font-semibold">{pr.exerciseName}</p>
                                        <p className="text-[12px] text-muted-foreground">
                                            {pr.weight} kg × {pr.reps} Wdh
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="px-5 space-y-3">
                <Link href="/" className="block">
                    <Button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[16px] flex items-center gap-2">
                        <Home className="w-5 h-5" />
                        Zurück zur Startseite
                    </Button>
                </Link>
                <Link href={`/history/${sessionId}`} className="block">
                    <Button variant="secondary" className="w-full h-12 rounded-2xl font-semibold text-[14px] flex items-center gap-2">
                        Details ansehen
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export default function WorkoutRecapPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>}>
            <RecapContent />
        </Suspense>
    )
}
