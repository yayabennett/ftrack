"use client"

import { useEffect } from 'react'
import { Plus, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { WorkoutTimer } from '@/components/workout/workout-timer'
import { SetRow } from '@/components/workout/set-row'
import { useWorkoutStore } from '@/store/use-workout-store'
import { useRouter } from 'next/navigation'

export default function ActiveWorkout() {
    const router = useRouter()
    const { isActive, startedAt, exercises, startWorkout, endWorkout, addSet, addExercise } = useWorkoutStore()

    // Debug Mock: Auto-Start Workout for development if not active
    useEffect(() => {
        if (!isActive) {
            startWorkout("mock-session-uuid", [
                {
                    id: "mock-workout-exercise-uuid",
                    exerciseId: "mock-exercise-uuid",
                    name: "Bankdrücken (Langhantel)",
                    order: 0,
                    sets: [{
                        id: "mock-set-id-1",
                        workoutExerciseId: "mock-workout-exercise-uuid",
                        setIndex: 1,
                        weight: 60,
                        reps: 12,
                        isCompleted: true
                    }]
                }
            ])
        }
    }, [isActive, startWorkout])

    const handleEndWorkout = () => {
        // Implement end session API call here
        endWorkout()
        router.push('/')
    }

    if (!isActive) {
        return <div className="min-h-screen bg-background flex justify-center items-center">Lädt Workout...</div>
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 h-14 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <WorkoutTimer startedAt={startedAt} />
                </div>
                <Button onClick={handleEndWorkout} variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 h-8 rounded-full shadow-sm">
                    Einheit beenden
                </Button>
            </div>

            <div className="container mx-auto p-4 space-y-6 animate-in slide-in-from-bottom-8 duration-300">

                {exercises.map((exercise) => (
                    <Card key={exercise.id} className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                        <CardHeader className="bg-secondary/50 p-3 flex flex-row items-center justify-between border-b border-white/5">
                            <CardTitle className="text-[15px] font-semibold text-foreground">{exercise.name}</CardTitle>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-secondary">
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
                                {exercise.sets.map((set) => (
                                    <SetRow key={set.id} exerciseId={exercise.id} setEntry={set} />
                                ))}

                                <Button onClick={() => addSet(exercise.id)} variant="ghost" className="w-full h-11 text-[13px] font-semibold text-primary hover:bg-primary/5 mt-2 rounded-xl">
                                    <Plus className="mr-1 h-4 w-4" /> SATZ HINZUFÜGEN
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Button className="w-full h-14 text-[17px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-2xl shadow-none">
                    <Plus className="mr-2 h-5 w-5" />
                    Übung hinzufügen
                </Button>
            </div>
        </div>
    )
}
