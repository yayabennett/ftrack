"use client"

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Barbell, MagnifyingGlass, Sparkle, Plus, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { ExerciseDTO } from '@/lib/types'
import { ExerciseListItem } from '@/components/exercises/exercise-list-item'
import { MuscleGroupSection } from '@/components/exercises/muscle-group-section'
import { motion } from 'framer-motion'

type ExerciseWithTrend = ExerciseDTO & {
    trend?: 'up' | 'down' | 'flat' | null
    history?: number[]
}

type GlobalExercise = ExerciseDTO & {
    isSaved: boolean
}

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
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'frequent' | 'focus'>('all')
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    // 1. Fetch My Active Exercises
    const { data: exercises = [], isLoading: isLoadingMine } = useQuery<ExerciseWithTrend[]>({
        queryKey: ['my-exercises'],
        queryFn: async () => {
            const res = await fetch('/api/exercises')
            if (!res.ok) throw new Error('Failed to fetch')
            const list: ExerciseDTO[] = await res.json()

            try {
                const trendsRes = await fetch('/api/exercises/trends')
                if (trendsRes.ok) {
                    const trendsData = await trendsRes.json()
                    return list.map(ex => {
                        const t = trendsData[ex.id]
                        return { ...ex, trend: t?.trend || null, history: t?.history || [] }
                    })
                }
            } catch (err) {
                console.error("Failed to fetch trends batch", err)
            }
            return list.map(ex => ({ ...ex, trend: null, history: [] }))
        },
    })

    // 2. Fetch Global Exercises if searching
    const { data: globalExercises = [], isLoading: isLoadingGlobal } = useQuery<GlobalExercise[]>({
        queryKey: ['global-exercises', search],
        queryFn: async () => {
            const res = await fetch(`/api/exercises/global?q=${encodeURIComponent(search)}`)
            if (!res.ok) throw new Error('Failed to fetch global')
            return res.json()
        },
        enabled: search.length > 0, // Only fetch globals when searching
        staleTime: 60000,
    })

    // 3. Save Exercise Mutation
    const saveMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/exercises/${id}/save`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to save')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-exercises'] })
            queryClient.invalidateQueries({ queryKey: ['global-exercises'] })
        }
    })

    // Filter Logic for My Exercises
    const filteredMine = useMemo(() => {
        let result = exercises.filter(ex =>
            ex.name.toLowerCase().includes(search.toLowerCase()) ||
            (ex.muscleGroup?.toLowerCase().includes(search.toLowerCase()))
        )
        if (filter === 'frequent') {
            result = result.filter(ex => (ex.history?.length || 0) >= 3)
        } else if (filter === 'focus') {
            result = result.filter(ex => ex.trend === 'down' || ex.trend === 'flat')
        }
        return result
    }, [exercises, search, filter])

    const groupedMine = useMemo(() => groupByMuscle(filteredMine), [filteredMine])

    // Recently Trained for Dashboard-vibe
    const recentlyTrained = useMemo(() => {
        return exercises
            .filter(ex => (ex.history?.length || 0) > 0)
            .sort((a, b) => (b.history?.length || 0) - (a.history?.length || 0))
            .slice(0, 3)
    }, [exercises])

    // Global Results (filter out ones the user already has saved to avoid duplicates in the UI)
    const globalResults = useMemo(() => {
        const myIds = new Set(exercises.map(e => e.id))
        return globalExercises.filter(ex => !myIds.has(ex.id))
    }, [globalExercises, exercises])


    return (
        <div className="min-h-screen bg-background pb-32">
            <header className="px-5 pt-8 pb-2">
                <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1">
                    Übungen
                </h1>
            </header>

            {!isLoadingMine && search === '' && filter === 'all' && recentlyTrained.length > 0 && (
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

            <div className="px-5 py-3 space-y-3 sticky top-safe z-40 bg-background/80 backdrop-blur-md outline outline-8 outline-background/80">
                <div className="relative">
                    <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Übung suchen (Lokal & Global)…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 rounded-[20px] bg-card/60 backdrop-blur-md ring-1 ring-white/10 text-[16px] font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-sm"
                    />
                </div>

                {!search && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {[
                            { id: 'all', label: 'Meine Übungen' },
                            { id: 'frequent', label: 'Im Fokus' },
                            { id: 'focus', label: 'Brauchen Liebe' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id as 'all' | 'frequent' | 'focus')}
                                className={cn(
                                    "whitespace-nowrap px-5 py-2 rounded-full text-[13px] font-bold transition-all shrink-0 active:scale-95",
                                    filter === f.id
                                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                                        : "bg-card/60 backdrop-blur-md ring-1 ring-white/5 text-muted-foreground hover:text-foreground hover:bg-card/80"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-5 space-y-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {(isLoadingMine || !mounted) ? (
                    <motion.div
                        className="space-y-4"
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                    >
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, scale: 0.95 },
                                    show: { opacity: 1, scale: 1 }
                                }}
                                className="min-h-[72px] rounded-[20px] bg-card/40 backdrop-blur-md ring-1 ring-white/5 animate-pulse"
                            />
                        ))}
                    </motion.div>
                ) : (
                    <>
                        {/* MY EXERCISES */}
                        {filteredMine.length > 0 && (
                            <div className="space-y-6">
                                {search && <h2 className="text-xl font-bold tracking-tight text-foreground">Meine Bibliothek</h2>}
                                {groupedMine.map(([group, items]) => (
                                    <MuscleGroupSection key={group} group={group} count={items.length}>
                                        {items.map((ex) => (
                                            <ExerciseListItem key={ex.id} exercise={ex} />
                                        ))}
                                    </MuscleGroupSection>
                                ))}
                            </div>
                        )}

                        {/* GLOBAL SEARCH RESULTS (Only shown when searching) */}
                        {search.length > 0 && (
                            <div className="space-y-4 mt-8 pt-6 border-t border-border/40">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                        <MagnifyingGlass className="w-5 h-5 text-primary" />
                                        Globale Suche
                                    </h2>
                                    {isLoadingGlobal && <span className="text-xs text-muted-foreground font-bold animate-pulse">SUCHE...</span>}
                                </div>
                                <p className="text-sm text-muted-foreground font-medium -mt-2 mb-4">
                                    Füge neue Übungen aus der globalen Datenbank zu deiner Bibliothek hinzu.
                                </p>

                                {globalResults.length === 0 && !isLoadingGlobal ? (
                                    <div className="py-10 text-center">
                                        <p className="text-muted-foreground font-medium text-sm">Keine weiteren globalen Übungen gefunden.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {globalResults.map(ex => (
                                            <div key={`global-${ex.id}`} className="flex items-center justify-between px-4 min-h-[72px] bg-card/60 backdrop-blur-md ring-1 ring-white/5 rounded-[20px] shadow-sm">
                                                <div className="min-w-0 pr-4">
                                                    <p className="font-bold text-[15px] text-foreground truncate">{ex.name}</p>
                                                    <div className="flex gap-2 mt-0.5">
                                                        {ex.muscleGroup && <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{ex.muscleGroup}</span>}
                                                        {ex.equipment && <span className="text-[10px] text-primary/80 font-bold uppercase tracking-wider">{ex.equipment}</span>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => saveMutation.mutate(ex.id)}
                                                    disabled={saveMutation.isPending || ex.isSaved}
                                                    className={cn(
                                                        "shrink-0 h-9 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                                        ex.isSaved
                                                            ? "bg-secondary text-muted-foreground"
                                                            : "bg-primary/10 text-primary hover:bg-primary/20"
                                                    )}
                                                >
                                                    {ex.isSaved ? <><Check className="w-4 h-4" /> Gespeichert</> : <><Plus className="w-4 h-4" /> Hinzufügen</>}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {filteredMine.length === 0 && search === '' && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                                    <Barbell className="w-7 h-7 text-muted-foreground/40" />
                                </div>
                                <h3 className="font-bold text-foreground mb-1">Deine Bibliothek ist leer</h3>
                                <p className="text-sm font-medium text-muted-foreground/80 px-8">Nutze die Suche oben, um aus hunderten globalen Übungen auszuwählen.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
