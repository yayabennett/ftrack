"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, UserCircle, Plus, ClockCounterClockwise, Barbell } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function BottomNav() {
    const pathname = usePathname()

    // Don't show bottom nav inside an active workout
    if (pathname.startsWith('/workout/')) return null

    const mainNavItems = [
        { name: 'Home', href: '/', icon: House },
        { name: 'Übungen', href: '/exercises', icon: Barbell },
        { name: 'Start', href: '/workout/start', icon: Plus, isAction: true },
        { name: 'Verlauf', href: '/history', icon: ClockCounterClockwise },
        { name: 'Profil', href: '/settings', icon: UserCircle }
    ]

    return (
        <div className="fixed bottom-6 left-4 right-4 z-50">
            {/* Main Floating Dock */}
            <div className="flex h-[72px] items-center justify-between rounded-[2rem] border border-white/10 bg-background/70 backdrop-blur-[32px] px-2 shadow-sm">
                {mainNavItems.map((item) => {
                    const isActive = pathname === item.href

                    if (item.isAction) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center justify-center -mt-4 group px-2"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-blue-600 text-primary-foreground shadow-[0_4px_16px_rgba(59,130,246,0.2)] ring-[4px] ring-background transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_24px_rgba(59,130,246,0.3)] group-active:scale-95 group-active:shadow-none">
                                    <item.icon className="h-7 w-7 stroke-[2px] transition-transform duration-300 group-hover:rotate-90" />
                                </div>
                                <span className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 group-hover:text-primary transition-colors">Start</span>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-1.5 w-[52px] h-[52px] rounded-2xl transition-all duration-300",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground active:scale-90"
                            )}
                        >
                            {isActive && (
                                <motion.div layoutId="activeTab" className="absolute inset-0 bg-primary/10 rounded-2xl" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                            )}
                            <item.icon className={cn("relative z-10 h-[22px] w-[22px] transition-all duration-300", isActive ? "scale-110 fill-primary/20" : "")} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={cn("relative z-10 text-xs", isActive ? "font-bold" : "font-medium")}>
                                {item.name}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
