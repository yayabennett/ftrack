import { useState, useMemo } from 'react'
import { X, MagnifyingGlass as Search, Barbell as Dumbbell, Globe } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ExerciseDTO } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function ExercisePickerDialog({
    isOpen,
    onClose,
    onSelect
}: {
    isOpen: boolean
    onClose: () => void
    onSelect: (exercise: { id: string; exerciseId: string; name: string }) => void
}) {
    const [search, setSearch] = useState('')
    const [selectedGroup, setSelectedGroup] = useState<string>('Alle')

    // 1. My Active Exercises
    const { data: myExercises = [], isLoading: isLoadingMine } = useQuery({
        queryKey: ['my-exercises-picker'],
        queryFn: async () => {
            const res = await fetch('/api/exercises')
            if (!res.ok) throw new Error('Failed to fetch exercises')
            return res.json() as Promise<ExerciseDTO[]>
        },
        enabled: isOpen
    })

    // 2. Global Exercises (only when searching)
    const { data: globalExercises = [], isLoading: isLoadingGlobal } = useQuery({
        queryKey: ['global-exercises-picker', search],
        queryFn: async () => {
            const res = await fetch(`/api/exercises/global?q=${encodeURIComponent(search)}`)
            if (!res.ok) throw new Error('Failed to fetch global')
            return res.json() as Promise<(ExerciseDTO & { isSaved: boolean })[]>
        },
        enabled: isOpen && search.length > 0,
        staleTime: 60000,
    })

    const muscleGroups = useMemo(() => {
        const groups = [...new Set(myExercises.map(e => e.muscleGroup).filter(Boolean))] as string[]
        return ['Alle', ...groups.sort((a, b) => a.localeCompare(b, 'de'))]
    }, [myExercises])

    const handleSelect = (ex: ExerciseDTO & { isGlobal?: boolean }) => {
        // If it's a new global exercise, save it to their library silently in the background
        if (ex.isGlobal) {
            fetch(`/api/exercises/${ex.id}/save`, { method: 'POST' }).catch(console.error)
        }
        onSelect({ id: ex.id, exerciseId: ex.id, name: ex.name })
    }

    if (!isOpen) return null

    // Filter local exercises
    const filteredMine = myExercises.filter(e => {
        const matchesSearch = search ? (e.name.toLowerCase().includes(search.toLowerCase()) || (e.muscleGroup?.toLowerCase().includes(search.toLowerCase()))) : true
        const matchesGroup = selectedGroup === 'Alle' || e.muscleGroup === selectedGroup
        return matchesSearch && matchesGroup
    })

    // Filter global exercises (deduplicate against mine)
    const filteredGlobal = search ? globalExercises.filter(g => !myExercises.some(m => m.id === g.id)).map(g => ({ ...g, isGlobal: true })) : []

    const combined: (ExerciseDTO & { isGlobal?: boolean })[] = [...filteredMine, ...filteredGlobal]

    return (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-lg mx-auto bg-card rounded-t-3xl border-t border-border/40 min-h-[50vh] max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-card rounded-t-3xl">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">Übung hinzufügen</h3>
                    <Button size="icon" variant="ghost" onClick={onClose} className="h-10 w-10 shrink-0 rounded-full active:scale-95 text-muted-foreground hover:text-foreground hover:bg-secondary">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Search & Filters */}
                <div className="px-5 py-4 space-y-4 bg-card z-10">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Übung suchen (Lokal & Global)..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-11 h-12 bg-secondary/50 border-0 rounded-xl text-[15px] focus-visible:ring-2 focus-visible:ring-primary/40 shadow-inner"
                        />
                    </div>
                    {/* Muscle Group Filter Tabs (Only relevant for local unless searched) */}
                    {!search && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {muscleGroups.map(group => (
                                <button
                                    key={group}
                                    onClick={() => setSelectedGroup(group)}
                                    className={cn(
                                        "whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-bold transition-all shrink-0 border",
                                        selectedGroup === group
                                            ? "bg-primary text-primary-foreground border-transparent shadow-sm"
                                            : "bg-background border-border/40 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* List Content */}
                <div className="overflow-y-auto flex-1 px-5 pb-5 space-y-2">
                    {(isLoadingMine || (search && isLoadingGlobal)) ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl bg-secondary/40" />)}
                        </div>
                    ) : combined.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
                                <Search className="h-6 w-6 text-muted-foreground/60" />
                            </div>
                            <p className="text-[15px] font-medium text-muted-foreground">Keine Ergebnisse gefunden.</p>
                        </div>
                    ) : (
                        combined.map((ex, i) => {
                            const showGlobalHeader = search && ex.isGlobal && (i === 0 || !combined[i - 1].isGlobal)

                            return (
                                <div key={`picker-${ex.id}`}>
                                    {showGlobalHeader && (
                                        <div className="flex items-center gap-2 mt-6 mb-3 px-1">
                                            <Globe className="w-4 h-4 text-primary" />
                                            <p className="text-xs font-bold tracking-widest text-primary uppercase">Aus globaler Datenbank</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleSelect(ex)}
                                        className={cn(
                                            "w-full text-left p-3 rounded-2xl active:scale-[0.98] transition-all flex items-center gap-4 mb-2",
                                            ex.isGlobal
                                                ? "bg-muted/30 border border-border/40 hover:bg-muted"
                                                : "bg-secondary/40 hover:bg-secondary/80"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0",
                                            ex.isGlobal ? "bg-card text-muted-foreground" : "bg-primary/10 text-primary"
                                        )}>
                                            <Dumbbell className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-[15px] truncate text-foreground">{ex.name}</p>
                                            <p className="text-[13px] text-muted-foreground font-medium truncate">
                                                {ex.muscleGroup || 'Allgemein'}{ex.equipment ? ` · ${ex.equipment}` : ''}
                                            </p>
                                        </div>
                                        {ex.isGlobal && (
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider -ml-2 mr-2">
                                                HINZUFÜGEN
                                            </span>
                                        )}
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>
                <div className="h-safe" />
            </div>
        </div>
    )
}
