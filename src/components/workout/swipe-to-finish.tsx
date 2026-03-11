"use client"

import { useState } from 'react'
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'
import { ArrowRight, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useHaptics } from '@/hooks/use-haptics'

export function SwipeToFinish({ onFinish }: { onFinish: () => void }) {
    const [isFinished, setIsFinished] = useState(false)
    const { vibrate } = useHaptics()

    const x = useMotionValue(0)
    const controls = useAnimation()
    const containerWidth = 320
    const knobWidth = 56
    const maxDrag = containerWidth - knobWidth - 8 // 8px total padding

    const opacity = useTransform(x, [0, maxDrag * 0.8], [1, 0])
    const bgColor = useTransform(
        x,
        [0, maxDrag],
        ['rgba(43, 111, 255, 0.1)', 'rgba(0, 226, 170, 0.2)'] // From primary/10 to success/20
    )

    const handleDragEnd = () => {
        if (x.get() > maxDrag * 0.8) {
            // Success! Trigger finish
            vibrate('heavy')
            setIsFinished(true)
            controls.start({ x: maxDrag })
            setTimeout(() => {
                onFinish()
            }, 300)
        } else {
            // Snap back
            controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } })
            vibrate('light')
        }
    }

    return (
        <motion.div
            style={{ backgroundColor: bgColor }}
            className="relative h-16 w-full max-w-[320px] mx-auto rounded-full ring-1 ring-white/10 border-0 flex items-center p-1 overflow-hidden backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
            {/* Background Text */}
            <motion.div style={{ opacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[15px] font-black tracking-widest uppercase text-muted-foreground/60 drop-shadow-md pl-8">
                    Workout beenden
                </span>
            </motion.div>

            {/* Draggable Knob */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: maxDrag }}
                dragElastic={0.05}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_4px_16px_rgba(0,0,0,0.3)] relative z-10 transition-colors duration-300",
                    isFinished ? "bg-[#00E2AA] text-black shadow-[0_0_24px_rgba(0,226,170,0.6)]" : "bg-primary text-primary-foreground shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]"
                )}
            >
                {isFinished ? (
                    <Check weight="bold" className="w-6 h-6" />
                ) : (
                    <ArrowRight weight="bold" className="w-6 h-6" />
                )}
            </motion.div>
        </motion.div>
    )
}
