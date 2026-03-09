"use client"

import { CaretRight } from '@phosphor-icons/react'
import { useStartWorkout } from '@/hooks/use-start-workout'

export function QuickStartButton({ templateId }: { templateId: string }) {
    const { startWorkout, isStarting } = useStartWorkout()

    const handleStart = (e: React.MouseEvent) => {
        e.preventDefault()
        startWorkout(templateId)
    }

    return (
        <button onClick={handleStart} disabled={isStarting} className="mt-4 flex items-center text-xs font-bold text-primary gap-1 active:scale-95 transition-transform disabled:opacity-50">
            {isStarting ? 'LÄDT...' : 'START'} {!isStarting && <CaretRight className="w-3 h-3" />}
        </button>
    )
}
