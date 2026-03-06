"use client"

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { customFetch } from '@/lib/api-client'
import { SetEntry, useWorkoutStore } from '@/store/use-workout-store'

interface SetRowProps {
    exerciseId: string;
    setEntry: SetEntry;
    onComplete?: () => void;
}

export function SetRow({ exerciseId, setEntry, onComplete }: SetRowProps) {
    const { updateSet, toggleSetComplete } = useWorkoutStore()
    const [weight, setWeight] = useState(setEntry.weight ? setEntry.weight.toString() : "")
    const [reps, setReps] = useState(setEntry.reps ? setEntry.reps.toString() : "")
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        if (!weight || !reps || isLoading) return
        setIsLoading(true)
        try {
            if (!setEntry.isCompleted) {
                // Optimistically update
                updateSet(exerciseId, setEntry.id, {
                    weight: parseFloat(weight),
                    reps: parseInt(reps, 10)
                })
                toggleSetComplete(exerciseId, setEntry.id)
                onComplete?.()

                // Sync with backend / IndexedDB Queue
                await customFetch('/api/sets', {
                    method: 'POST',
                    body: [{
                        id: setEntry.id,
                        workoutExerciseId: setEntry.workoutExerciseId,
                        setIndex: setEntry.setIndex,
                        weight: parseFloat(weight),
                        reps: parseInt(reps, 10),
                    }]
                })
            } else {
                // Just toggle off
                toggleSetComplete(exerciseId, setEntry.id)
            }
        } catch (e) {
            console.error(e)
            // Rollback optimistic off
            toggleSetComplete(exerciseId, setEntry.id)
        } finally {
            setIsLoading(false)
        }
    }

    const isCompleted = setEntry.isCompleted

    return (
        <div className={cn(
            "grid grid-cols-[3rem_1fr_1fr_4rem] gap-2 items-center rounded-xl p-2 transition-colors",
            isCompleted ? "bg-primary/10" : "bg-secondary/40"
        )}>
            <div className={cn("text-center text-[15px] font-bold", isCompleted ? "text-primary" : "text-muted-foreground")}>
                {setEntry.setIndex}
            </div>
            <Input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="0"
                disabled={isCompleted}
                className={cn(
                    "h-11 text-[16px] text-center font-semibold border-0 focus-visible:ring-1 focus-visible:ring-primary shadow-none",
                    isCompleted ? "bg-transparent text-foreground" : "bg-secondary/80 text-foreground"
                )}
            />
            <Input
                type="number"
                value={reps}
                onChange={e => setReps(e.target.value)}
                placeholder="0"
                disabled={isCompleted}
                className={cn(
                    "h-11 text-[16px] text-center font-semibold border-0 focus-visible:ring-1 focus-visible:ring-primary shadow-none",
                    isCompleted ? "bg-transparent text-foreground" : "bg-secondary/80 text-foreground"
                )}
            />
            <div className="flex justify-end pr-1">
                <Button
                    onClick={handleSave}
                    disabled={isLoading || !weight || !reps}
                    size="icon"
                    variant={isCompleted ? "default" : "outline"}
                    className={cn(
                        "h-9 w-9 rounded-[10px]",
                        isCompleted ? "bg-primary text-primary-foreground border-0" : "bg-secondary/80 text-muted-foreground border-white/10"
                    )}
                >
                    <Check className={cn("h-5 w-5", isLoading && "animate-pulse")} />
                </Button>
            </div>
        </div>
    )
}
