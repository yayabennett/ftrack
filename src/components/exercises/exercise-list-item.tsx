"use client"

import Link from 'next/link'
import { Barbell, CaretRight, TrendUp, TrendDown, Minus, Trophy, Cube, User, HardDrives } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { MiniSparkline } from '@/components/ui/mini-sparkline'
import type { ExerciseDTO } from '@/lib/types'
import { getMuscleGroupStyle } from '@/lib/exercise-styles'
import { useHaptics } from '@/hooks/use-haptics'

interface ExerciseListItemProps {
    exercise: ExerciseDTO & {
        trend?: 'up' | 'down' | 'flat' | null
        history?: number[]
    }
}

export function ExerciseListItem({ exercise }: ExerciseListItemProps) {
    const { vibrate } = useHaptics()
    const level = exercise.history?.length || 0
    const hasTrend = exercise.history && exercise.history.length > 1

    const mStyle = getMuscleGroupStyle(exercise.muscleGroup)

    return (
        <Link
            href={`/exercises/${exercise.id}`}
            onClick={() => vibrate('light')}
            className={cn(
                "flex items-center justify-between px-4 min-h-[72px] rounded-[20px]",
                "bg-card/60 backdrop-blur-md ring-1 ring-white/5 border-0 shadow-sm",
                "active:scale-95 transition-all duration-300",
                "hover:bg-card hover:ring-white/10 hover:shadow-md",
                "group relative overflow-hidden"
            )}
        >
            <div className="flex items-center gap-3 min-w-0 z-10">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", mStyle.bgClass)}>
                    <div className={cn("opacity-80 group-hover:opacity-100 transition-opacity w-5 h-5", mStyle.colorClass)}>
                        {mStyle.icon}
                    </div>
                </div>
                <div className="min-w-0">
                    <p className="text-[15px] font-bold tracking-tight truncate">{exercise.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        {exercise.equipment && (
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold bg-secondary/60 px-1.5 py-0.5 rounded-md">
                                {exercise.equipment}
                            </span>
                        )}
                        {level > 0 && (
                            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full ring-1 ring-primary/20">
                                <Trophy className="w-2.5 h-2.5" />
                                <span className="text-[10px] font-black uppercase">Lvl {Math.min(level, 10)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-2 z-10">
                {hasTrend && (
                    <div className="hidden sm:block">
                        <MiniSparkline data={exercise.history!} trend={exercise.trend || null} />
                    </div>
                )}
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                        {exercise.trend === 'up' && <TrendUp className="w-4 h-4 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]" />}
                        {exercise.trend === 'down' && <TrendDown className="w-4 h-4 text-red-400 opacity-60" />}
                        {exercise.trend === 'flat' && <Minus className="w-4 h-4 text-muted-foreground/40" />}
                    </div>
                    <CaretRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                </div>
            </div>

            {/* Subtle background glow for high level exercises */}
            {level >= 5 && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] rounded-full -mr-12 -mt-12 pointer-events-none" />
            )}
        </Link>
    )
}
