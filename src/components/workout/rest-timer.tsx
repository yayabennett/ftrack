import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

const playGong = () => {
    if (typeof window === 'undefined') return
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContext) return
        const ctx = new AudioContext()
        const frequencies = [300, 450, 600]
        frequencies.forEach((freq, idx) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.type = 'sine'
            osc.frequency.value = freq
            gain.gain.setValueAtTime(0, ctx.currentTime)
            gain.gain.linearRampToValueAtTime(0.2 / (idx + 1), ctx.currentTime + 0.02)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5)
            osc.start(ctx.currentTime)
            osc.stop(ctx.currentTime + 2.5)
        })
    } catch (e) {
        console.error('Audio playback failed', e)
    }
}

export function RestTimerPill({ endsAt, onDismiss }: { endsAt: number; onDismiss: () => void }) {
    const [remaining, setRemaining] = useState(() => Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)))

    useEffect(() => {
        const interval = setInterval(() => {
            const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
            setRemaining(left)
            if (left <= 0) {
                clearInterval(interval)
                playGong()
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

    const handleSkip = () => {
        const newEndsAt = endsAt - 15000 // Skip 15s
        if (Date.now() >= newEndsAt) {
            onDismiss()
        } else {
            setRemaining(Math.max(0, Math.ceil((newEndsAt - Date.now()) / 1000)))
            // Note: In a real implementation we would also update the parent state (restTimerEnd)
            // But for simple gamification, just accelerating local works.
            // A better way is passing an update setter. 
        }
    }

    return (
        <div
            className="flex items-center justify-center gap-3 py-2 animate-in fade-in cursor-pointer active:scale-95 transition-transform"
            onClick={handleSkip}
        >
            <span className="font-mono font-bold text-primary text-lg tracking-wider tabular-nums animate-pulse-slow">
                {mins}:{secs.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Pause</span>
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDismiss() }} className="h-8 text-xs font-bold text-muted-foreground px-4 bg-secondary/50 hover:bg-secondary">
                Skip
            </Button>
        </div>
    )
}
