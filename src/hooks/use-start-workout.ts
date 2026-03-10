import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkoutStore } from '@/store/use-workout-store'
import { useHaptics } from '@/hooks/use-haptics'

export function useStartWorkout() {
    const router = useRouter()
    const [isStarting, setIsStarting] = useState(false)
    const { vibrate } = useHaptics()

    const startWorkout = async (templateId?: string | null, dateStr?: string, timeStr?: string) => {
        setIsStarting(true)
        try {
            const payload: Record<string, string> = {}
            if (templateId) payload.templateId = templateId
            if (dateStr && timeStr) {
                payload.startedAt = new Date(`${dateStr}T${timeStr}:00`).toISOString()
            }

            const res = await fetch('/api/sessions/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                const session = await res.json()
                const { startWorkout: initStore, addSet, updateSet, exercises: currentExercises } = useWorkoutStore.getState()

                const mappedExercises = session.exercises
                    ? session.exercises.map((ex: any) => ({
                        id: ex.id,
                        exerciseId: ex.exerciseId,
                        name: ex.exercise?.name || 'Unbekannte Übung',
                        muscleGroup: ex.exercise?.muscleGroup,
                        order: ex.order,
                        sets: [],
                        // pass these along temporarily for initialization
                        _templateProps: {
                            targetSets: ex.targetSets || 3,
                            repRange: ex.repRange || '8-12',
                            targetWeight: ex.targetWeight || null
                        }
                    })) : []

                initStore(session.id, mappedExercises)

                // Smart Weight Suggestions & Template Initialization
                for (const ex of mappedExercises) {
                    try {
                        let hasTemplateTarget = (ex._templateProps.targetWeight != null || (ex._templateProps.targetSets > 0 && ex._templateProps.targetSets !== 3 && ex._templateProps.repRange !== '8-12'))
                        const isOverload = session.isProgressiveOverload === true

                        // Optimization: Always fetch history because progressive overload needs it even if template targets exist.
                        // If Overload is ON, we ideally bump the history numbers. If template targets exist, we override defaults but overload history.
                        const lastSetsRes = await fetch(`/api/exercises/${ex.exerciseId}/last-sets`)
                        let lastSets: any[] = []
                        if (lastSetsRes.ok) {
                            const data = await lastSetsRes.json()
                            lastSets = data.sets || []
                        }

                        if (hasTemplateTarget && (!isOverload || lastSets.length === 0)) {
                            // Seed from template definition (No Overload, or no history to overload from)
                            const targetRepsMatch = ex._templateProps.repRange.match(/\d+/)
                            const targetReps = targetRepsMatch ? parseInt(targetRepsMatch[0]) : 10

                            for (let i = 0; i < ex._templateProps.targetSets; i++) {
                                useWorkoutStore.getState().addSet(ex.id)
                            }

                            const store = useWorkoutStore.getState()
                            const currentEx = store.exercises.find(e => e.id === ex.id)
                            if (currentEx) {
                                currentEx.sets.forEach((set) => {
                                    useWorkoutStore.getState().updateSet(ex.id, set.id, {
                                        previousWeight: ex._templateProps.targetWeight || undefined,
                                        previousReps: targetReps
                                    })
                                })
                            }
                        } else if (lastSets.length > 0) {
                            // Seed from history (With optional Overload)
                            for (const lastSet of lastSets) {
                                useWorkoutStore.getState().addSet(ex.id)
                            }

                            const store = useWorkoutStore.getState()
                            const currentEx = store.exercises.find(e => e.id === ex.id)
                            if (currentEx) {
                                for (let i = 0; i < Math.min(currentEx.sets.length, lastSets.length); i++) {
                                    let pWeight = lastSets[i].weight
                                    let pReps = lastSets[i].reps

                                    if (isOverload) {
                                        if (pWeight > 0) {
                                            pWeight += 2.5 // Generic 2.5kg increase
                                        } else {
                                            pReps += 1 // Bodyweight increase rep
                                        }
                                    }

                                    useWorkoutStore.getState().updateSet(ex.id, currentEx.sets[i].id, {
                                        previousWeight: pWeight,
                                        previousReps: pReps
                                    })
                                }
                            }
                        } else {
                            // Fallback: No history, no template target. Just add one empty set.
                            useWorkoutStore.getState().addSet(ex.id)
                        }
                    } catch {
                        // Non-critical
                    }
                }

                vibrate('heavy')
                router.push('/workout/active')
            }
        } catch (error) {
            console.error("Failed to start workout", error)
        } finally {
            setIsStarting(false)
        }
    }

    return { startWorkout, isStarting }
}
