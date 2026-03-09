"use client"

import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, useAnimation, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'
import { customFetch } from '@/lib/api-client'
import { useWorkoutStore } from '@/store/use-workout-store'
import type { SetEntry } from '@/store/use-workout-store'
import type { PRResult } from '@/lib/types'
import { toast } from 'sonner'

interface SetRowProps {
    exerciseId: string      // The Zustand workout-exercise ID (client UUID)
    exerciseDbId: string    // The actual DB exercise ID (for PR lookups)
    setEntry: SetEntry
    onComplete?: () => void
    onPR?: (message: string) => void
}

export function SetRow({ exerciseId, exerciseDbId, setEntry, onComplete, onPR }: SetRowProps) {
    const { updateSet, toggleSetComplete, removeSet } = useWorkoutStore()
    const [weight, setWeight] = useState(setEntry.weight ? setEntry.weight.toString() : "")
    const [reps, setReps] = useState(setEntry.reps ? setEntry.reps.toString() : "")
    const [isLoading, setIsLoading] = useState(false)

    // Swipe to delete setup
    const x = useMotionValue(0)
    const controls = useAnimation()

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.x < -60) {
            removeSet(exerciseId, setEntry.id)
            toast('Satz gelöscht')
            // Optionally delete from backend here if needed
        } else {
            controls.start({ x: 0 })
        }
    }

    const handleSave = async () => {
        if (!weight || !reps || isLoading) return
        setIsLoading(true)

        const parsedWeight = parseFloat(weight)
        const parsedReps = parseInt(reps, 10)

        try {
            if (!setEntry.isCompleted) {
                // Optimistic UI update
                updateSet(exerciseId, setEntry.id, { weight: parsedWeight, reps: parsedReps })
                toggleSetComplete(exerciseId, setEntry.id)
                onComplete?.()

                // Sync with backend / offline queue
                await customFetch('/api/sets', {
                    method: 'POST',
                    body: [{
                        id: setEntry.id,
                        workoutExerciseId: setEntry.workoutExerciseId,
                        setIndex: setEntry.setIndex,
                        weight: parsedWeight,
                        reps: parsedReps,
                    }]
                })

                // ── PR Detection ─────────────────────────────────────────────
                // Only check PR when online (GET can't be queued offline)
                if (exerciseDbId && typeof window !== 'undefined' && navigator.onLine) {
                    try {
                        const prRes = await fetch(`/api/exercises/${exerciseDbId}/pr`)
                        if (prRes.ok) {
                            const pr: PRResult | null = await prRes.json()
                            const newVolume = parsedWeight * parsedReps
                            // It's a PR if there's no previous record, or the new set exceeds it
                            if (!pr || newVolume >= pr.volume) {
                                toast.success(`🏆 Neuer PR: ${parsedWeight} kg × ${parsedReps} Wdh!`, {
                                    description: 'Richtig stark! Bleib dran.',
                                    duration: 4000,
                                })
                                onPR?.(`🏆 Neuer PR: ${parsedWeight} kg × ${parsedReps} Wdh!`)
                            }
                        }
                    } catch {
                        // PR check is best-effort — never block the main save
                    }
                }
            } else {
                // Toggle off (uncomplete)
                toggleSetComplete(exerciseId, setEntry.id)
            }
        } catch (e) {
            console.error(e)
            toast.error('Fehler beim Speichern', {
                description: 'Dein Satz konnte nicht gesichert werden.'
            })
            // Rollback optimistic update
            toggleSetComplete(exerciseId, setEntry.id)
        } finally {
            setIsLoading(false)
        }
    }

    const isCompleted = setEntry.isCompleted

    return (
        <div className="relative overflow-hidden rounded-xl bg-destructive">
            {/* Background Trash Icon */}
            <div className="absolute inset-0 flex items-center justify-end px-4">
                <Trash2 className="text-white w-5 h-5" />
            </div>

            {/* Foreground Draggable Row */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                className={cn(
                    "relative grid grid-cols-[3rem_1fr_1fr_4rem] gap-2 items-center rounded-xl p-1 transition-colors touch-pan-y shadow-sm",
                    isCompleted ? "bg-[#182433]" : "bg-card border border-white/5"
                )}
            >
                <div className={cn("text-center text-[15px] font-bold tracking-tight", isCompleted ? "text-primary" : "text-muted-foreground")}>
                    {setEntry.setIndex}
                </div>
                <Input
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
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
                    inputMode="decimal"
                    pattern="[0-9]*"
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
                        aria-label={isCompleted ? "Satz bearbeiten" : "Satz abspeichern"}
                        className={cn(
                            "h-10 w-10 text-[16px] rounded-[10px] active:scale-95 transition-transform",
                            isCompleted ? "bg-primary text-primary-foreground border-0" : "bg-secondary/80 text-muted-foreground border-white/10"
                        )}
                    >
                        <Check className={cn("h-5 w-5", isLoading && "animate-pulse")} />
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
