import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SetEntry = {
    id: string; // client-generated UUID for offline sync
    workoutExerciseId: string;
    setIndex: number;
    weight: number;
    reps: number;
    rpe?: number | null;
    isWarmup?: boolean;
    isCompleted: boolean;
}

export type WorkoutExercise = {
    id: string; // client-generated UUID
    exerciseId: string;
    name: string;
    order: number;
    sets: SetEntry[];
}

interface WorkoutState {
    isActive: boolean;
    sessionId: string | null;
    startedAt: string | null;
    exercises: WorkoutExercise[];

    // Actions
    startWorkout: (sessionId: string, exercises?: WorkoutExercise[]) => void;
    endWorkout: () => void;
    addExercise: (exercise: WorkoutExercise) => void;
    removeExercise: (exerciseId: string) => void;
    addSet: (exerciseId: string) => void;
    removeSet: (exerciseId: string, setId: string) => void;
    updateSet: (exerciseId: string, setId: string, updates: Partial<SetEntry>) => void;
    toggleSetComplete: (exerciseId: string, setId: string) => void;
}

const generateId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            isActive: false,
            sessionId: null,
            startedAt: null,
            exercises: [],

            startWorkout: (sessionId, initExercises = []) => {
                set({
                    isActive: true,
                    sessionId,
                    startedAt: new Date().toISOString(),
                    exercises: initExercises
                })
            },

            endWorkout: () => {
                set({ isActive: false, sessionId: null, startedAt: null, exercises: [] })
            },

            addExercise: (exercise) => {
                set((state) => ({ exercises: [...state.exercises, exercise] }))
            },

            removeExercise: (exerciseId) => {
                set((state) => ({
                    exercises: state.exercises.filter(ex => ex.id !== exerciseId)
                }))
            },

            addSet: (exerciseId) => {
                set((state) => ({
                    exercises: state.exercises.map(ex => {
                        if (ex.id === exerciseId) {
                            const lastSet = ex.sets[ex.sets.length - 1];
                            const newSet: SetEntry = {
                                id: generateId(),
                                workoutExerciseId: ex.id,
                                setIndex: ex.sets.length + 1,
                                weight: lastSet ? lastSet.weight : 0,
                                reps: lastSet ? lastSet.reps : 0,
                                isCompleted: false
                            };
                            return { ...ex, sets: [...ex.sets, newSet] };
                        }
                        return ex;
                    })
                }))
            },

            removeSet: (exerciseId, setId) => {
                set((state) => ({
                    exercises: state.exercises.map(ex => {
                        if (ex.id === exerciseId) {
                            const filtered = ex.sets.filter(s => s.id !== setId)
                            // Re-index setIndex
                            const reindexed = filtered.map((s, i) => ({ ...s, setIndex: i + 1 }))
                            return { ...ex, sets: reindexed }
                        }
                        return ex
                    })
                }))
            },

            updateSet: (exerciseId, setId, updates) => {
                set((state) => ({
                    exercises: state.exercises.map(ex => {
                        if (ex.id === exerciseId) {
                            return {
                                ...ex,
                                sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
                            };
                        }
                        return ex;
                    })
                }))
            },

            toggleSetComplete: (exerciseId, setId) => {
                set((state) => ({
                    exercises: state.exercises.map(ex => {
                        if (ex.id === exerciseId) {
                            return {
                                ...ex,
                                sets: ex.sets.map(s => s.id === setId ? { ...s, isCompleted: !s.isCompleted } : s)
                            };
                        }
                        return ex;
                    })
                }))
            }
        }),
        {
            name: 'workout-storage', // saves to localStorage so the workout survives page reloads
        }
    )
)
