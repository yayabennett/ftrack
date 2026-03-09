"use client"

import { useSyncQueue } from '@/hooks/use-sync'
import { WifiSlash as WifiOff, ArrowsClockwise as RefreshCw } from '@phosphor-icons/react'

export function OfflineBanner() {
    const { queueCount, isOnline } = useSyncQueue()

    if (isOnline && queueCount === 0) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0A0B10]/95 backdrop-blur-md border-b border-orange-500/20 px-4 py-2 flex items-center justify-center text-xs font-medium text-orange-500 transition-transform">
            <div className="flex items-center gap-2">
                {!isOnline ? <WifiOff className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin opacity-50" />}
                <span>
                    {!isOnline ? "Offline Modus aktiv. " : "Synchronisiere... "}
                    {queueCount > 0 ? `${queueCount} Aktion(en) warten.` : ""}
                </span>
            </div>
        </div>
    )
}
