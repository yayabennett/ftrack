"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lightning } from "@phosphor-icons/react"

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if we've already shown the splash screen in this session to mimic native cold-starts
        const hasSeenSplash = sessionStorage.getItem("itrack-splash-seen")

        if (!hasSeenSplash) {
            setIsVisible(true)
            sessionStorage.setItem("itrack-splash-seen", "true")

            // Auto hide after 2.5 seconds giving enough time for the animation to play
            const timer = setTimeout(() => {
                setIsVisible(false)
            }, 2500)

            return () => clearTimeout(timer)
        }
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }} // Smooth ease-out
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#090E1A]"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.2
                        }}
                        className="flex flex-col items-center justify-center gap-6"
                    >
                        {/* Hero Icon (Yazio uses a monster, we use an energetic Lightning proxy) */}
                        <motion.div
                            animate={{
                                y: [-6, 6, -6],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 3,
                                ease: "easeInOut"
                            }}
                            className="relative flex items-center justify-center"
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-primary opacity-30 blur-[40px] rounded-full scale-150" />
                            <Lightning weight="duotone" className="w-24 h-24 text-primary relative z-10" />
                        </motion.div>

                        {/* Wordmark */}
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                            className="text-5xl font-black text-white tracking-tighter"
                        >
                            iTrack
                        </motion.h1>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
