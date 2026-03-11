"use client"

import { useSyncQueue } from '@/hooks/use-sync'
import { WifiSlash as WifiOff, ArrowsClockwise as RefreshCw } from '@phosphor-icons/react'

export function OfflineBanner() {
    const { queueCount, isOnline } = useSyncQueue()

    if (isOnline && queueCount === 0) return null

    return (
        <div className="fixed top-safe left-1/2 -translate-x-1/2 z-50 mt-3 pointer-events-none">
            <div className={`bg-card/70 backdrop-blur-2xl ring-1 ring-white/15 px-5 py-3 rounded-[24px] flex items-center justify-center text-[14px] font-extrabold tracking-tight text-foreground transition-all duration-500 animate-in slide-in-from-top-6 fade-in ${isOnline ? 'shadow-[0_0_20px_rgba(0,226,170,0.2)]' : 'shadow-[0_12px_40px_rgba(0,0,0,0.7)]'}`}>
                <div className="flex items-center gap-2.5">
                    {!isOnline ? (
                        <WifiOff className="w-5 h-5 text-destructive drop-shadow-[0_0_8px_rgba(255,69,58,0.5)]" />
                    ) : (
                        <RefreshCw className="w-5 h-5 text-primary animate-spin drop-shadow-[0_0_10px_rgba(0,226,170,0.6)]" />
                    )}
                    <span>
                        {!isOnline ? "Offline Modus" : "Synchronisiere..."}
                        {queueCount > 0 && <span className="opacity-50 ml-1.5 font-medium">({queueCount})</span>}
                    </span>
                </div>
            </div>
        </div>
    )
}
