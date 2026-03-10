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
                        sets: []
                    })) : []

                initStore(session.id, mappedExercises)

                // Smart Weight Suggestions: fetch last session's sets for each exercise
                for (const ex of mappedExercises) {
                    try {
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
