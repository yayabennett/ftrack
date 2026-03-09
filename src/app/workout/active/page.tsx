"use client"

import { useState, useEffect, Suspense, useCallback } from 'react'
import { Plus, X, Check, DotsSixVertical as GripVertical } from '@phosphor-icons/react'
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

import { SortableExerciseCard } from '@/components/workout/sortable-exercise-card'
function WorkoutContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const templateId = searchParams.get('templateId')
    const startedAtQuery = searchParams.get('startedAt')
    const { isActive, sessionId, startedAt, exercises, startWorkout, endWorkout, addExercise, removeExercise, addSet, updateSet, reorderExercises } = useWorkoutStore()
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
            router.replace('/workout/start')
        } else {
            setIsLoading(false)
        }
    }, [isActive, router])

    const handleEndWorkout = async () => {
        const currentSessionId = sessionId
        if (currentSessionId) {
            try {
                await fetch(`/api/sessions/${currentSessionId}/finish`, { method: 'POST' })
            } catch (e) {
                console.error('Failed to finish session:', e)
            }
        }
        endWorkout()
        // Redirect to recap page instead of home
        router.push(currentSessionId ? `/workout/recap?sessionId=${currentSessionId}` : '/')
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

    const handleSetCompleted = (exerciseName?: string) => {
        // Adaptive rest timer based on exercise type
        const compoundPatterns = ['squat', 'bench', 'deadlift', 'press', 'row', 'kniebeuge', 'bankdrücken', 'kreuzheben', 'drücken', 'rudern']
        const isCompound = exerciseName && compoundPatterns.some(p => exerciseName.toLowerCase().includes(p))
        const restDuration = isCompound ? 150 : 75 // 2:30 for compounds, 1:15 for isolation
        setRestTimerEnd(Date.now() + restDuration * 1000)
    }

    if (isLoading) {
        return <div className="min-h-screen bg-background flex flex-col justify-center items-center text-muted-foreground gap-4">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="font-bold tracking-widest uppercase text-xs">Einheit wird vorbereitet...</p>
        </div>
    }

    const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0)
    const completedSets = exercises.reduce((sum, ex) => sum + (ex.sets?.filter(s => s.isCompleted).length || 0), 0)

    return (
        <div className="min-h-screen bg-background pb-32">
            <div className="sticky top-0 z-40 bg-background/60 backdrop-blur-[32px] border-b border-white/5 h-14 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <WorkoutTimer startedAt={startedAt} totalSets={totalSets} completedSets={completedSets} />
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
