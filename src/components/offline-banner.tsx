"use client"

import { useSyncQueue } from '@/hooks/use-sync'
import { WifiSlash as WifiOff, ArrowsClockwise as RefreshCw } from '@phosphor-icons/react'

export function OfflineBanner() {
    const { queueCount, isOnline } = useSyncQueue()

    if (isOnline && queueCount === 0) return null

    return (
        <div className="fixed top-safe left-1/2 -translate-x-1/2 z-50 mt-2 pointer-events-none">
            <div className="bg-background/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] px-4 py-2.5 rounded-full flex items-center justify-center text-[13px] font-bold text-foreground transition-all duration-300 animate-in slide-in-from-top-4 fade-in">
                <div className="flex items-center gap-2">
                    {!isOnline ? (
                        <WifiOff className="w-4 h-4 text-orange-500" />
                    ) : (
                        <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                    )}
                    <span>
                        {!isOnline ? "Offline Modus " : "Synchronisiere... "}
                        {queueCount > 0 && <span className="opacity-60 ml-1">({queueCount})</span>}
                    </span>
                </div>
            </div>
        </div>
    )
}
