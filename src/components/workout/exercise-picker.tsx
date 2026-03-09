import { useState, useEffect } from 'react'
import { X, Search, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ExerciseDTO } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

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

    const { data: exercises = [], isLoading } = useQuery({
        queryKey: ['exercises'],
        queryFn: async () => {
            const res = await fetch('/api/exercises')
            if (!res.ok) throw new Error('Failed to fetch exercises')
            return res.json() as Promise<ExerciseDTO[]>
        }
    })

    if (!isOpen) return null

    const filtered = exercises.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-lg bg-background rounded-t-3xl border-t border-white/10 max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Übung hinzufügen</h3>
                    <Button size="icon" variant="ghost" onClick={onClose} className="h-10 w-10 shrink-0 rounded-full active:scale-95">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="p-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Übung suchen..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-11 bg-secondary/50 border-0 rounded-xl"
                        />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    {isLoading ? (
                        <div className="space-y-2 p-2">
                            <Skeleton className="h-14 w-full rounded-xl bg-secondary/50" />
                            <Skeleton className="h-14 w-full rounded-xl bg-secondary/50" />
                            <Skeleton className="h-14 w-full rounded-xl bg-secondary/50" />
                            <Skeleton className="h-14 w-full rounded-xl bg-secondary/50" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">Keine Übungen gefunden</p>
                    ) : (
                        filtered.map(ex => (
                            <button
                                key={ex.id}
                                onClick={() => onSelect({ id: ex.id, exerciseId: ex.id, name: ex.name })}
                                className="w-full text-left p-3 rounded-xl hover:bg-secondary/60 active:scale-[0.98] transition-all flex items-center gap-3"
                            >
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Dumbbell className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-semibold text-[14px]">{ex.name}</p>
                                    <p className="text-[11px] text-muted-foreground">{ex.muscleGroup || 'Allgemein'}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
                <div className="h-safe" />
            </div>
        </div>
    )
}
