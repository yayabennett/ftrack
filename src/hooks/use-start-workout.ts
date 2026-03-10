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

                        if (hasTemplateTarget) {
                            // Seed from template definition
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
                        } else {
                            // Seed from history
                            const lastSetsRes = await fetch(`/api/exercises/${ex.exerciseId}/last-sets`)
                            if (lastSetsRes.ok) {
                                const { sets: lastSets } = await lastSetsRes.json()
                                if (lastSets && lastSets.length > 0) {
                                    for (const lastSet of lastSets) {
                                        useWorkoutStore.getState().addSet(ex.id)
                                    }

                                    const store = useWorkoutStore.getState()
                                    const currentEx = store.exercises.find(e => e.id === ex.id)
                                    if (currentEx) {
                                        for (let i = 0; i < Math.min(currentEx.sets.length, lastSets.length); i++) {
                                            useWorkoutStore.getState().updateSet(ex.id, currentEx.sets[i].id, {
                                                previousWeight: lastSets[i].weight,
                                                previousReps: lastSets[i].reps
                                            })
                                        }
                                    }
                                }
                            }
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
