"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Barbell, MagnifyingGlass, CaretRight, Sparkle, TrendUp, TrendDown, Minus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import type { ExerciseDTO } from '@/lib/types'
import { ExerciseListItem } from '@/components/exercises/exercise-list-item'
import { MuscleGroupSection } from '@/components/exercises/muscle-group-section'
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

    // "Recently Trained" personality section
    const recentlyTrained = useMemo(() => {
        return exercises
            .filter(ex => (ex.history?.length || 0) > 0)
            .sort((a, b) => (b.history?.length || 0) - (a.history?.length || 0)) // Just a proxy for now since we don't have dates
            .slice(0, 3)
    }, [exercises])

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <header className="px-5 pt-8 pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <Barbell className="w-5 h-5 text-primary" />
                    <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-60">Bibliothek</p>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Übungen
                </h1>
            </header>

            {/* Recently Trained Personality Section */}
            {!isLoading && search === '' && filter === 'all' && recentlyTrained.length > 0 && (
                <div className="px-5 py-4 space-y-3">
                    <h3 className="text-[10px] font-black tracking-widest text-primary uppercase flex items-center gap-2">
                        <Sparkle weight="fill" className="w-3 h-3" />
                        Zuletzt trainiert
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {recentlyTrained.map(ex => (
                            <ExerciseListItem key={`recent-${ex.id}`} exercise={ex} />
                        ))}
                    </div>
                </div>
            )}

            {/* Search & Filters */}
            <div className="px-5 py-3 space-y-3 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
                <div className="relative">
                    <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Übung suchen…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-secondary/40 border border-white/5 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                    />
                </div>

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
                                "whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-bold transition-all shrink-0",
                                filter === f.id
                                    ? "bg-primary text-primary-foreground shadow-sm glow-primary"
                                    : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List */}
            <div className="px-5 space-y-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    </div>
                ) : (
                    grouped.map(([group, items]) => (
                        <MuscleGroupSection key={group} group={group} count={items.length}>
                            {items.map((ex) => (
                                <ExerciseListItem key={ex.id} exercise={ex} />
                            ))}
                        </MuscleGroupSection>
                    ))
                )}
            </div>
        </div>
    )
}
