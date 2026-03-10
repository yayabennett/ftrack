"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOADING_MESSAGES = [
    "Wärme Gewichte auf...",
    "Lade Muskelversagen...",
    "Suche nach Gains...",
    "Mische Pre-Workout...",
    "Verhandle mit der Schwerkraft..."
]

export default function Loading() {
    const [messageIndex, setMessageIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(i => (i + 1) % LOADING_MESSAGES.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header skeleton */}
            <div className="px-5 pt-8 pb-4 flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-3 w-24 bg-secondary/60 rounded-md animate-pulse" />
                    <div className="h-7 w-40 bg-secondary/60 rounded-lg animate-pulse" />
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary/60 animate-pulse" />
            </div>

            <div className="space-y-8 p-5">
                {/* Weekly activity skeleton */}
                <div className="bg-card/40 ring-1 ring-white/5 rounded-3xl p-5">
                    <div className="h-4 w-32 bg-secondary/50 rounded-md animate-pulse mb-5" />
                    <div className="flex justify-between gap-1 px-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-secondary/50 animate-pulse" />
                                <div className="w-4 h-2 bg-secondary/50 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Highlight card skeleton */}
                <div className="bg-card/40 ring-1 ring-white/5 rounded-3xl p-6 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/50 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-48 bg-secondary/50 rounded-md animate-pulse" />
                        <div className="h-3 w-64 bg-secondary/50 rounded-md animate-pulse" />
                    </div>
                </div>

                {/* Template carousel skeleton */}
                <div className="space-y-4">
                    <div className="h-4 w-24 bg-secondary/50 rounded-md animate-pulse" />
                    <div className="flex gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="min-w-[170px] h-[110px] bg-card ring-1 ring-white/5 rounded-2xl p-4 animate-pulse">
                                <div className="h-4 w-24 bg-secondary/50 rounded-md mb-2" />
                                <div className="h-3 w-16 bg-secondary/50 rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-32 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-secondary/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={messageIndex}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm font-bold text-foreground tracking-wide"
                        >
                            {LOADING_MESSAGES[messageIndex]}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
