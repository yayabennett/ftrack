"use client"

import Link from 'next/link'
import { Barbell, CaretRight, TrendUp, TrendDown, Minus, Trophy, Cube, User, HardDrives } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { MiniSparkline } from '@/components/ui/mini-sparkline'
import type { ExerciseDTO } from '@/lib/types'

interface ExerciseListItemProps {
    exercise: ExerciseDTO & {
        trend?: 'up' | 'down' | 'flat' | null
        history?: number[]
    }
}

export function ExerciseListItem({ exercise }: ExerciseListItemProps) {
    const level = exercise.history?.length || 0
    const hasTrend = exercise.history && exercise.history.length > 1

    // Equipment icon mapper
    const EquipmentIcon = (eq: string | null) => {
        const lower = eq?.toLowerCase() || ""
        if (lower.includes('hantel') || lower.includes('dumbbell')) return <Cube className="w-4 h-4" />
        if (lower.includes('langhantel') || lower.includes('barbell')) return <Barbell className="w-4 h-4" />
        if (lower.includes('kettlebell')) return <HardDrives className="w-4 h-4" /> // Or similar icon
        if (lower.includes('bodyweight') || lower.includes('körpergewicht')) return <User className="w-4 h-4" />
        return <Barbell className="w-4 h-4" />
    }

    return (
        <Link
            href={`/exercises/${exercise.id}`}
            className={cn(
                "flex items-center justify-between px-4 py-3.5 rounded-2xl",
                "bg-card/40 ring-1 ring-white/[0.04] border-0",
                "active:scale-[0.98] transition-all duration-150",
                "hover:bg-card/70 hover:ring-white/[0.08]",
                "group relative overflow-hidden"
            )}
        >
            <div className="flex items-center gap-3 min-w-0 z-10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                    <div className="text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                        {EquipmentIcon(exercise.equipment)}
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
