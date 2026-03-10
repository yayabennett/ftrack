"use client"

import * as React from 'react'
import { Plus, X, Check, DotsSixVertical as GripVertical } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SetRow } from '@/components/workout/set-row'
import { useWorkoutStore } from '@/store/use-workout-store'
import type { WorkoutExercise } from '@/store/use-workout-store'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getMuscleGroupStyle } from '@/lib/exercise-styles'

export interface SortableExerciseCardProps {
    exercise: WorkoutExercise
    onCompleteSet: (exerciseName: string) => void
    onPR: (message: string) => void
}

export function SortableExerciseCard({ exercise, onCompleteSet, onPR }: SortableExerciseCardProps) {
    const { removeExercise, addSet } = useWorkoutStore()
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exercise.id })

    const mStyle = getMuscleGroupStyle(exercise.muscleGroup || 'Allgemein')

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
        position: isDragging ? 'relative' : 'static'
    } as React.CSSProperties

    return (
        <Card ref={setNodeRef} style={style} className={`bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 text-card-foreground ${isDragging ? 'shadow-lg ring-primary/50 ring-2' : ''}`}>
            <CardHeader className="sticky top-14 z-20 bg-secondary/80 backdrop-blur-md p-3 flex flex-row items-center justify-between border-b border-white/5 rounded-t-[15px]">
                <div className="flex items-center gap-2 flex-1">
                    <div {...attributes} {...listeners} className="p-1 -ml-1 text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing touch-none focus:outline-none">
                        <GripVertical className="h-5 w-5" />
                    </div>
                    {exercise.muscleGroup && (
                        <div className={`w-7 h-7 flex items-center justify-center shrink-0 rounded-lg ${mStyle.bgClass} ${mStyle.colorClass}`}>
                            <div className="w-4 h-4">{mStyle.icon}</div>
                        </div>
                    )}
                    <CardTitle className="text-[15px] font-semibold text-foreground">{exercise.name}</CardTitle>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-95"
                    onClick={() => {
                        if (exercise.sets && exercise.sets.length > 0) {
                            if (!window.confirm(`Möchtest du "${exercise.name}" wirklich entfernen? Alle Sets gehen verloren.`)) return
                        }
                        removeExercise(exercise.id)
                    }}
                >
                    <X className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-[3rem_1fr_1fr_4rem] gap-2 p-3 pb-2 text-xs font-bold text-muted-foreground text-center uppercase tracking-wider">
                    <div>Satz</div>
                    <div>kg</div>
                    <div>Wdh</div>
                    <div className="text-right pr-2"><Check className="h-4 w-4 inline-block opacity-50" /></div>
                </div>

                <div className="space-y-1 p-2 pt-0">
                    {exercise.sets && exercise.sets.map((set) => (
                        <SetRow
                            key={set.id}
                            exerciseId={exercise.id}
                            exerciseDbId={exercise.exerciseId}
                            setEntry={set}
                            onComplete={() => onCompleteSet(exercise.name)}
                            onPR={onPR}
                        />
                    ))}

                    <Button onClick={() => addSet(exercise.id)} variant="ghost" className="w-full h-11 text-[13px] font-semibold text-primary hover:bg-primary/5 mt-2 rounded-xl">
                        <Plus className="mr-1 h-4 w-4" /> SATZ HINZUFÜGEN
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
