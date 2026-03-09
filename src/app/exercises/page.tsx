"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Barbell, MagnifyingGlass, CaretRight, Sparkle, TrendUp, TrendDown, Minus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import type { ExerciseDTO } from '@/lib/types'
import { MiniSparkline } from '@/components/ui/mini-sparkline'

type ExerciseWithTrend = ExerciseDTO & {
    trend?: 'up' | 'down' | 'flat' | null
    history?: number[]
}

// Group exercises by muscle group
function groupByMuscle(exercises: ExerciseWithTrend[]) {
    const groups: Record<string, ExerciseWithTrend[]> = {}
    for (const ex of exercises) {
        const key = ex.muscleGroup || 'Sonstige'
        if (!groups[key]) groups[key] = []
        groups[key].push(ex)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'de'))
}

export default function ExercisesPage() {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'frequent' | 'focus'>('all')
    const [mounted, setMounted] = useState(false)

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true) }, [])

    const { data: exercises = [], isLoading } = useQuery<ExerciseWithTrend[]>({
        queryKey: ['exercises-with-trends'],
        queryFn: async () => {
            const res = await fetch('/api/exercises')
            if (!res.ok) throw new Error('Failed to fetch')
            const list: ExerciseDTO[] = await res.json()

            // Fetch trend data for all exercises in ONE parallel request (fixing N+1 issue)
            try {
                const trendsRes = await fetch('/api/exercises/trends')
                if (trendsRes.ok) {
                    const trendsData = await trendsRes.json()

                    return list.map(ex => {
                        const t = trendsData[ex.id]
                        return {
                            ...ex,
                            trend: t?.trend || null,
                            history: t?.history || []
                        }
                    })
                }
            } catch (err) {
                console.error("Failed to fetch trends batch", err)
            }

            // Fallback
            return list.map(ex => ({ ...ex, trend: null, history: [] }))
        },
    })

    const filtered = useMemo(() => {
        let result = exercises.filter(ex =>
            ex.name.toLowerCase().includes(search.toLowerCase()) ||
            (ex.muscleGroup?.toLowerCase().includes(search.toLowerCase()))
        )

        if (filter === 'frequent') {
            // Filter to only those with solid history (e.g. at least 3 points)
            result = result.filter(ex => (ex.history?.length || 0) >= 3)
        } else if (filter === 'focus') {
            // Needs focus = declining trend or flat trend despite history
            result = result.filter(ex => ex.trend === 'down' || ex.trend === 'flat')
        }

        return result
    }, [exercises, search, filter])

    const grouped = useMemo(() => groupByMuscle(filtered), [filtered])

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <header className="px-5 pt-8 pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <Barbell className="w-5 h-5 text-primary" />
                    <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-60">Bibliothek</p>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Übungen<span className="text-primary">.</span>
                </h1>
            </header>

            {/* Search & Filters */}
            <div className="px-5 py-3 space-y-3">
                <div className="relative">
                    <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Übung suchen…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-secondary/60 border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                </div>

                {/* Smart Filter Pills */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                        { id: 'all', label: 'Alle' },
                        { id: 'frequent', label: 'Im Fokus' },
                        { id: 'focus', label: 'Brauchen Liebe' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as 'all' | 'frequent' | 'focus')}
                            className={cn(
                                "whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all shrink-0",
                                filter === f.id
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 space-y-6 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {(isLoading || !mounted) ? (
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-14 rounded-2xl bg-card animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary/40 flex items-center justify-center mb-4">
                            <Barbell className="w-7 h-7 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground">Keine Übungen gefunden</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Versuch einen anderen Suchbegriff.</p>
                    </div>
                ) : (
                    grouped.map(([group, items]) => (
                        <section key={group}>
                            <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2 px-1 flex items-center gap-1.5">
                                <Sparkle className="w-3 h-3 text-primary/60" />
                                {group}
                                <span className="text-muted-foreground/40 ml-1">({items.length})</span>
                            </h2>
                            <div className="space-y-1.5">
                                {items.map((ex) => (
                                    <Link
                                        key={ex.id}
                                        href={`/exercises/${ex.id}`}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-3.5 rounded-2xl",
                                            "bg-card/60 ring-1 ring-white/[0.04] border-0",
                                            "active:scale-[0.98] transition-all duration-150",
                                            "hover:bg-card hover:ring-white/[0.08]",
                                            "group"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Barbell className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[14px] font-semibold truncate">{ex.name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {ex.equipment && (
                                                        <span className="text-xs text-muted-foreground/80 font-medium truncate bg-secondary/50 px-1.5 py-0.5 rounded-md">{ex.equipment}</span>
                                                    )}
                                                    {ex.history && ex.history.length > 0 && (
                                                        <span className="text-xs text-primary/70 font-bold tracking-wider">Lvl {Math.min(ex.history.length, 10)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-2">
                                            {ex.history && ex.history.length > 1 && (
                                                <MiniSparkline data={ex.history} trend={ex.trend || null} />
                                            )}
                                            <div className="flex items-center gap-1">
                                                {ex.trend === 'up' && <TrendUp className="w-4 h-4 text-green-400" />}
                                                {ex.trend === 'down' && <TrendDown className="w-4 h-4 text-red-400" />}
                                                {ex.trend === 'flat' && <Minus className="w-4 h-4 text-muted-foreground/50" />}
                                                <CaretRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors ml-1" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </div>
    )
}
