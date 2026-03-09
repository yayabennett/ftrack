"use client"

import { useEffect, useState } from 'react'

interface WorkoutTimerProps {
    startedAt: string | null
    totalSets?: number
    completedSets?: number
}

export function WorkoutTimer({ startedAt, totalSets, completedSets }: WorkoutTimerProps) {
    const [elapsed, setElapsed] = useState<number>(0)

    useEffect(() => {
        if (!startedAt) return

        const start = new Date(startedAt).getTime()

        const tick = () => {
            setElapsed(Math.floor((Date.now() - start) / 1000))
        }

        tick()
        const interval = setInterval(tick, 1000)

        return () => clearInterval(interval)
    }, [startedAt])

    if (!startedAt) return <span>00:00:00</span>

    const hours = Math.floor(elapsed / 3600)
    const minutes = Math.floor((elapsed % 3600) / 60)
    const seconds = elapsed % 60

    // Estimate remaining time based on completed sets
    const estimatedRemaining = (completedSets && completedSets > 0 && totalSets && totalSets > completedSets)
        ? Math.round((elapsed / completedSets) * (totalSets - completedSets))
        : null

    const estMin = estimatedRemaining ? Math.floor(estimatedRemaining / 60) : null

    return (
        <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[17px] tracking-widest text-primary">
                {hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
            {estMin !== null && estMin > 0 && (
                <span className="text-[11px] font-medium text-muted-foreground/70">
                    ~{estMin}min übrig
                </span>
            )}
        </div>
    )
}
