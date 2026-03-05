"use client"

import { useEffect, useState } from 'react'

export function WorkoutTimer({ startedAt }: { startedAt: string | null }) {
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

    return (
        <span className="font-mono font-bold text-[17px] tracking-widest text-primary">
            {hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
    )
}
