import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function RestTimerPill({ endsAt, onDismiss }: { endsAt: number; onDismiss: () => void }) {
    const [remaining, setRemaining] = useState(() => Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)))

    useEffect(() => {
        const interval = setInterval(() => {
            const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
            setRemaining(left)
            if (left <= 0) {
                clearInterval(interval)
                // Try vibrate on supported devices
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate([200, 100, 200])
                }
            }
        }, 250)
        return () => clearInterval(interval)
    }, [endsAt])

    if (remaining <= 0) {
        return (
            <div className="flex items-center justify-center gap-2 py-2 animate-in fade-in">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Pause vorbei!</span>
                <Button size="sm" variant="ghost" onClick={onDismiss} className="h-8 text-[12px] font-bold text-muted-foreground px-4">
                    OK
                </Button>
            </div>
        )
    }

    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60

    return (
        <div className="flex items-center justify-center gap-3 py-2 animate-in fade-in">
            <span className="font-mono font-bold text-primary text-lg tracking-wider">
                {mins}:{secs.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Pause</span>
            <Button size="sm" variant="ghost" onClick={onDismiss} className="h-8 text-xs font-bold text-muted-foreground px-4">
                Skip
            </Button>
        </div>
    )
}
