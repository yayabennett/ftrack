"use client"

import { useState, useEffect, Suspense, useCallback } from 'react'
import { Plus, X, Check, Search, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { WorkoutTimer } from '@/components/workout/workout-timer'
import { SetRow } from '@/components/workout/set-row'
import { useWorkoutStore } from '@/store/use-workout-store'
import type { WorkoutExercise } from '@/store/use-workout-store'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ExerciseDTO } from '@/lib/types'
import { cachedGet } from '@/lib/api-client'

function ExercisePickerDialog({
    isOpen,
    onClose,
    onSelect
}: {
    isOpen: boolean
    onClose: () => void
    onSelect: (exercise: { id: string; exerciseId: string; name: string }) => void
}) {
    const [exercises, setExercises] = useState<ExerciseDTO[]>([])
    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!isOpen) return
        cachedGet<ExerciseDTO[]>('/api/exercises', 'cache-exercises')
            .then(data => { if (data) { setExercises(data); setIsLoading(false) } else { setIsLoading(false) } })
            .catch(() => setIsLoading(false))
    }, [isOpen])

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
                    <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
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
                        <p className="text-center text-sm text-muted-foreground py-8 animate-pulse">Lade Übungen...</p>
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

function RestTimerPill({ endsAt, onDismiss }: { endsAt: number; onDismiss: () => void }) {
    const [remaining, setRemaining] = useState(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)))

    useEffect(() => {
        const interval = setInterval(() => {
            const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
            setRemaining(left)
            if (left <= 0) {
                clearInterval(interval)
                // Try vibrate
                if (navigator.vibrate) navigator.vibrate([200, 100, 200])
            }
        }, 250)
        return () => clearInterval(interval)
    }, [endsAt])

    if (remaining <= 0) {
        return (
            <div className="flex items-center justify-center gap-2 py-2 animate-in fade-in">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Pause vorbei!</span>
                <Button size="sm" variant="ghost" onClick={onDismiss} className="h-6 text-[11px] text-muted-foreground">
                    OK
                </Button>
            </div>
        )
    }

    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60

    return (
        <div className="flex items-center justify-center gap-3 py-2 animate-in fade-in">
            <span className="font-mono font-bold text-primary text-lg tracking-wider">
                {mins}:{secs.toString().padStart(2, '0')}
            </span>
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Pause</span>
            <Button size="sm" variant="ghost" onClick={onDismiss} className="h-6 text-[11px] text-muted-foreground">
                Skip
            </Button>
        </div>
    )
}

function WorkoutContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const templateId = searchParams.get('templateId')
    const startedAtQuery = searchParams.get('startedAt')
    const { isActive, sessionId, startedAt, exercises, startWorkout, endWorkout, addExercise, removeExercise, addSet } = useWorkoutStore()
    const [isLoading, setIsLoading] = useState(!isActive)
    const [showPicker, setShowPicker] = useState(false)
    const [restTimerEnd, setRestTimerEnd] = useState<number | null>(null)
    const [prAlert, setPrAlert] = useState<string | null>(null)

    const handlePR = useCallback((message: string) => {
        setPrAlert(message)
        setTimeout(() => setPrAlert(null), 4000)
    }, [])

    useEffect(() => {
        if (!isActive) {
            const initSession = async () => {
                try {
                    const payload: any = {}
                    if (templateId) payload.templateId = templateId
                    if (startedAtQuery) payload.startedAt = startedAtQuery

                    const res = await fetch('/api/sessions/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    })

                    if (res.ok) {
                        const session = await res.json()
                        const mappedExercises: WorkoutExercise[] = session.exercises
                            ? session.exercises.map((ex: { id: string; exerciseId: string; exercise?: { name: string }; order: number }) => ({
                                id: ex.id,
                                exerciseId: ex.exerciseId,
                                name: ex.exercise?.name || 'Unbekannte Übung',
                                order: ex.order,
                                sets: []
                            })) : []

                        startWorkout(session.id, mappedExercises)
                    }
                } catch (error) {
                    console.error("Failed to start session:", error)
                } finally {
                    setIsLoading(false)
                }
            }

            initSession()
        } else {
            setIsLoading(false)
        }
    }, [isActive, startWorkout, templateId, startedAtQuery])

    const handleEndWorkout = async () => {
        if (sessionId) {
            try {
                await fetch(`/api/sessions/${sessionId}/finish`, { method: 'POST' })
            } catch (e) {
                console.error('Failed to finish session:', e)
            }
        }
        endWorkout()
        router.push('/')
    }

    const handleAddExercise = async (picked: { id: string; exerciseId: string; name: string }) => {
        const order = exercises.length
        // Add to backend session
        if (sessionId) {
            try {
                const res = await fetch(`/api/sessions/${sessionId}/exercise`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ exerciseId: picked.exerciseId, order })
                })
                if (res.ok) {
                    const workoutExercise = await res.json()
                    addExercise({
                        id: workoutExercise.id,
                        exerciseId: picked.exerciseId,
                        name: picked.name,
                        order,
                        sets: []
                    })
                }
            } catch (e) {
                console.error('Failed to add exercise:', e)
            }
        }
        setShowPicker(false)
    }

    const handleSetCompleted = () => {
        // Start 90s rest timer
        setRestTimerEnd(Date.now() + 90 * 1000)
    }

    if (isLoading) {
        return <div className="min-h-screen bg-background flex flex-col justify-center items-center text-muted-foreground gap-4">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="font-bold tracking-widest uppercase text-xs">Einheit wird vorbereitet...</p>
        </div>
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 h-14 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <WorkoutTimer startedAt={startedAt} />
                </div>
                <Button onClick={handleEndWorkout} variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 h-8 rounded-full shadow-sm">
                    Beenden
                </Button>
            </div>

            {/* Rest Timer */}
            {restTimerEnd && (
                <div className="sticky top-14 z-30 bg-background/90 backdrop-blur-md border-b border-white/5">
                    <RestTimerPill endsAt={restTimerEnd} onDismiss={() => setRestTimerEnd(null)} />
                </div>
            )}

            {/* PR Alert */}
            {prAlert && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-lg animate-in zoom-in duration-300 font-bold flex items-center gap-2">
                    🎉 {prAlert}
                </div>
            )}

            <div className="container mx-auto p-4 space-y-6 animate-in slide-in-from-bottom-8 duration-300">
                {exercises.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground italic mt-10">
                        Keine Übungen in dieser Einheit. Füge unten eine hinzu.
                    </div>
                )}
                {exercises.map((exercise) => (
                    <Card key={exercise.id} className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                        <CardHeader className="bg-secondary/50 p-3 flex flex-row items-center justify-between border-b border-white/5">
                            <CardTitle className="text-[15px] font-semibold text-foreground">{exercise.name}</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => removeExercise(exercise.id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-[3rem_1fr_1fr_4rem] gap-2 p-3 pb-2 text-[11px] font-bold text-muted-foreground text-center uppercase tracking-wider">
                                <div>Satz</div>
                                <div>kg</div>
                                <div>Wdh</div>
                                <div className="text-right pr-2"><Check className="h-4 w-4 inline-block opacity-50" /></div>
                            </div>

                            <div className="space-y-1 p-2 pt-0">
                                {exercise.sets && exercise.sets.map((set) => (
                                    <SetRow
                                        key={set.id}
                                        exerciseId={exercise.id}
                                        exerciseDbId={exercise.exerciseId}
                                        setEntry={set}
                                        onComplete={handleSetCompleted}
                                        onPR={handlePR}
                                    />
                                ))}

                                <Button onClick={() => addSet(exercise.id)} variant="ghost" className="w-full h-11 text-[13px] font-semibold text-primary hover:bg-primary/5 mt-2 rounded-xl">
                                    <Plus className="mr-1 h-4 w-4" /> SATZ HINZUFÜGEN
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Button onClick={() => setShowPicker(true)} className="w-full h-14 text-[17px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-2xl shadow-none">
                    <Plus className="mr-2 h-5 w-5" />
                    Übung hinzufügen
                </Button>
            </div>

            <ExercisePickerDialog
                isOpen={showPicker}
                onClose={() => setShowPicker(false)}
                onSelect={handleAddExercise}
            />
        </div>
    )
}

export default function ActiveWorkout() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex flex-col justify-center items-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>}>
            <WorkoutContent />
        </Suspense>
    )
}
