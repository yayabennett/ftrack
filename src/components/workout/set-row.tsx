"use client"

import { useState } from 'react'
import { Check, Trash as Trash2 } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, useAnimation, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'
import { customFetch } from '@/lib/api-client'
import { useWorkoutStore } from '@/store/use-workout-store'
import type { SetEntry } from '@/store/use-workout-store'
import type { PRResult } from '@/lib/types'
import { toast } from 'sonner'
import { useHaptics } from '@/hooks/use-haptics'

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
    const { vibrate } = useHaptics()

    // Swipe to delete setup
    const x = useMotionValue(0)
    const controls = useAnimation()

    const handleDragEnd = (_event: unknown, info: { offset: { x: number } }) => {
        if (info.offset.x < -60) {
            vibrate('heavy')
            removeSet(exerciseId, setEntry.id)
            toast('Satz gelöscht')
            // Optionally delete from backend here if needed
        } else {
            controls.start({ x: 0 })
        }
    }

    const handleSave = async () => {
        let parsedWeight = weight ? parseFloat(weight) : (setEntry.previousWeight ?? NaN)
        let parsedReps = reps ? parseInt(reps, 10) : (setEntry.previousReps ?? NaN)

        if (isNaN(parsedWeight) || isNaN(parsedReps) || isLoading) return
        setIsLoading(true)

        try {
            if (!setEntry.isCompleted) {
                // Optimistic UI update
                vibrate('success')
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
                    fetch(`/api/exercises/${exerciseDbId}/pr`)
                        .then(res => res.ok ? res.json() : null)
                        .then((pr: PRResult | null) => {
                            const newVolume = parsedWeight * parsedReps
                            if (!pr || newVolume >= pr.volume) {
                                toast.success(`🏆 Neuer PR: ${parsedWeight} kg × ${parsedReps} Wdh!`, {
                                    description: 'Richtig stark! Bleib dran.',
                                    duration: 4000,
                                })
                                onPR?.(`🏆 Neuer PR: ${parsedWeight} kg × ${parsedReps} Wdh!`)
                            }
                        })
                        .catch(() => {
                            // PR check is best-effort — never block the main save
                        })
                }
            } else {
                // Toggle off (uncomplete)
                vibrate('medium')
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
                    "relative grid grid-cols-[2.5rem_1fr_1fr_4.5rem] gap-2.5 items-center rounded-xl p-1.5 transition-colors touch-pan-y shadow-sm",
                    isCompleted ? "bg-[#182433]" : "bg-card border border-white/5"
                )}
            >
                <div className={cn("text-center text-[16px] font-black tracking-tight", isCompleted ? "text-primary drop-shadow-[0_0_8px_rgba(0,226,170,0.4)]" : "text-muted-foreground/60")}>
                    {setEntry.setIndex}
                </div>
                <Input
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder={setEntry.previousWeight ? setEntry.previousWeight.toString() : "0"}
                    disabled={isCompleted}
                    className={cn(
                        "h-14 tabular-nums text-lg text-center font-black border-0 transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary focus:bg-primary/20 shadow-none placeholder:text-muted-foreground/20 rounded-xl",
                        isCompleted ? "bg-transparent text-foreground" : "bg-black/40 text-foreground shadow-inner"
                    )}
                />
                <Input
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    value={reps}
                    onChange={e => setReps(e.target.value)}
                    placeholder={setEntry.previousReps ? setEntry.previousReps.toString() : "0"}
                    disabled={isCompleted}
                    className={cn(
                        "h-14 tabular-nums text-lg text-center font-black border-0 transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary focus:bg-primary/20 shadow-none placeholder:text-muted-foreground/20 rounded-xl",
                        isCompleted ? "bg-transparent text-foreground" : "bg-black/40 text-foreground shadow-inner"
                    )}
                />
                <div className="flex justify-end pr-1 h-full items-center">
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || (!weight && !setEntry.previousWeight) || (!reps && !setEntry.previousReps)}
                        size="icon"
                        variant={isCompleted ? "default" : "outline"}
                        aria-label={isCompleted ? "Satz bearbeiten" : "Satz abspeichern"}
                        className={cn(
                            "h-14 w-full text-xl rounded-xl active:scale-95 transition-all duration-200",
                            isCompleted ? "bg-primary text-primary-foreground border-0 shadow-[0_4px_12px_rgba(0,226,170,0.4)]" : "bg-black/60 text-muted-foreground border-white/5 hover:bg-black/80"
                        )}
                    >
                        <Check className={cn("h-6 w-6", isLoading && "animate-pulse")} weight="bold" />
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
