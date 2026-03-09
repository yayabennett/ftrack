"use client"

import { useState, useEffect, Suspense, useCallback } from 'react'
import { Plus, X, Check, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { WorkoutTimer } from '@/components/workout/workout-timer'
import { SetRow } from '@/components/workout/set-row'
import { useWorkoutStore } from '@/store/use-workout-store'
import type { WorkoutExercise } from '@/store/use-workout-store'
import { useRouter, useSearchParams } from 'next/navigation'
import { ExercisePickerDialog } from '@/components/workout/exercise-picker'
import { RestTimerPill } from '@/components/workout/rest-timer'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableExerciseCardProps {
    exercise: WorkoutExercise
    onCompleteSet: () => void
    onPR: (message: string) => void
}

function SortableExerciseCard({ exercise, onCompleteSet, onPR }: SortableExerciseCardProps) {
    const { removeExercise, addSet } = useWorkoutStore()
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exercise.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
        position: isDragging ? 'relative' : 'static'
    } as React.CSSProperties

    return (
        <Card ref={setNodeRef} style={style} className={`bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground ${isDragging ? 'shadow-lg ring-primary/50 ring-2' : ''}`}>
            <CardHeader className="bg-secondary/50 p-3 flex flex-row items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2 flex-1">
                    <div {...attributes} {...listeners} className="p-1 -ml-1 text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing touch-none focus:outline-none">
                        <GripVertical className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-[15px] font-semibold text-foreground">{exercise.name}</CardTitle>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-95"
                    onClick={() => {
                        if (exercise.sets && exercise.sets.length > 0) {
                            if (!window.confirm(`Möchtest du "${exercise.name}" wirklich entfernen? Alle Sets gehen verloren.`)) return
                        }
                        removeExercise(exercise.id)
                    }}
                >
                    <X className="h-5 w-5" />
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
                            onComplete={onCompleteSet}
                            onPR={onPR}
                        />
                    ))}

                    <Button onClick={() => addSet(exercise.id)} variant="ghost" className="w-full h-11 text-[13px] font-semibold text-primary hover:bg-primary/5 mt-2 rounded-xl">
                        <Plus className="mr-1 h-4 w-4" /> SATZ HINZUFÜGEN
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function WorkoutContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const templateId = searchParams.get('templateId')
    const startedAtQuery = searchParams.get('startedAt')
    const { isActive, sessionId, startedAt, exercises, startWorkout, endWorkout, addExercise, removeExercise, addSet, reorderExercises } = useWorkoutStore()
    const [isLoading, setIsLoading] = useState(!isActive)
    const [showPicker, setShowPicker] = useState(false)
    const [restTimerEnd, setRestTimerEnd] = useState<number | null>(null)
    const [prAlert, setPrAlert] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIndex = exercises.findIndex(ex => ex.id === active.id)
            const newIndex = exercises.findIndex(ex => ex.id === over.id)
            reorderExercises(oldIndex, newIndex)
        }
    }

    const handlePR = useCallback((message: string) => {
        setPrAlert(message)
        setTimeout(() => setPrAlert(null), 4000)
    }, [])

    useEffect(() => {
        if (!isActive) {
            const initSession = async () => {
                try {
                    const payload: Record<string, string> = {}
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
            <div className="sticky top-0 z-40 bg-background/60 backdrop-blur-[32px] border-b border-white/5 h-14 px-4 flex items-center justify-between">
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
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={exercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-6">
                            {exercises.map((exercise) => (
                                <SortableExerciseCard
                                    key={exercise.id}
                                    exercise={exercise}
                                    onCompleteSet={handleSetCompleted}
                                    onPR={handlePR}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

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
