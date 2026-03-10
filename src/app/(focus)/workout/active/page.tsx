"use client"

import { useState, useEffect, Suspense, useCallback } from 'react'
import { Plus, X, Check, DotsSixVertical as GripVertical } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { WorkoutTimer } from '@/components/workout/workout-timer'
import { SetRow } from '@/components/workout/set-row'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { useWorkoutStore } from '@/store/use-workout-store'
import type { WorkoutExercise } from '@/store/use-workout-store'
import { useRouter, useSearchParams } from 'next/navigation'
import { ExercisePickerDialog } from '@/components/workout/exercise-picker'
import { RestTimerPill } from '@/components/workout/rest-timer'
import { SwipeToFinish } from '@/components/workout/swipe-to-finish'
import { useHaptics } from '@/hooks/use-haptics'
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
    const { vibrate } = useHaptics()
    const { width, height } = useWindowSize()

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

    // WakeLock to keep screen alive during workout
    useEffect(() => {
        let wakeLock: any = null
        const requestWakeLock = async () => {
            if (isActive && 'wakeLock' in navigator) {
                try {
                    wakeLock = await (navigator as any).wakeLock.request('screen')
                } catch (err) {
                    console.error('WakeLock failed:', err)
                }
            }
        }

        requestWakeLock()

        const handleVisibilityChange = () => {
            if (wakeLock !== null && document.visibilityState === 'visible') {
                requestWakeLock()
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            if (wakeLock !== null) wakeLock.release()
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [isActive])

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
        vibrate('success')
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

    const handleAddExercise = async (picked: { id: string; exerciseId: string; name: string; muscleGroup?: string }) => {
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
                        muscleGroup: picked.muscleGroup,
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
    const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

    return (
        <div className="min-h-screen bg-background pb-32">
            <div className="sticky top-safe z-40 bg-background/60 backdrop-blur-[32px] border-b border-white/5 h-14 px-4 flex items-center justify-between">
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent">
                    <motion.div
                        className="h-[2px] bg-primary shadow-[0_0_12px_rgba(43,111,255,1)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ ease: "easeInOut", duration: 0.4 }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <WorkoutTimer startedAt={startedAt} totalSets={totalSets} completedSets={completedSets} />
                </div>
            </div>

            {/* Rest Timer */}
            {restTimerEnd && (
                <div className="sticky top-[calc(env(safe-area-inset-top,0px)+3.5rem)] z-30 bg-background/90 backdrop-blur-md border-b border-white/5">
                    <RestTimerPill endsAt={restTimerEnd} onDismiss={() => setRestTimerEnd(null)} />
                </div>
            )}

            {/* PR Alert */}
            {prAlert && (
                <>
                    <div className="fixed inset-0 z-[100] pointer-events-none">
                        <Confetti
                            width={width}
                            height={height}
                            recycle={false}
                            numberOfPieces={300}
                            gravity={0.3}
                            initialVelocityY={20}
                            colors={['#2b6fff', '#00E2AA', '#ffffff']}
                        />
                    </div>
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[101] bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(43,111,255,0.4)] animate-in zoom-in duration-300 font-bold flex items-center gap-2">
                        🎉 {prAlert}
                    </div>
                </>
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

                <div className="h-16" /> {/* Spacer for fixed lower CTA */}
            </div>

            {/* Slide to Finish CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-background via-background/90 to-transparent z-40 pointer-events-none">
                <div className="pointer-events-auto">
                    <SwipeToFinish onFinish={handleEndWorkout} />
                </div>
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
