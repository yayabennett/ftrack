"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, UserCircle, Plus, ClockCounterClockwise, Barbell } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function BottomNav() {
    const pathname = usePathname()

    // Don't show bottom nav inside an active workout or auth pages
    if (
        pathname.startsWith('/workout/') ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/onboarding'
    ) return null

    const mainNavItems = [
        { name: 'Home', href: '/', icon: House },
        { name: 'Übungen', href: '/exercises', icon: Barbell },
        { name: 'Start', href: '/workout/start', icon: Plus, isAction: true },
        { name: 'Verlauf', href: '/history', icon: ClockCounterClockwise },
        { name: 'Profil', href: '/settings', icon: UserCircle }
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#161618] border-t border-border/40 pb-safe">
            <div className="flex h-20 items-center justify-around px-2 max-w-md mx-auto">
                {mainNavItems.map((item) => {
                    const isActive = pathname === item.href

                    if (item.isAction) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center justify-center -mt-10 group px-2 action-press"
                            >
                                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full btn-primary-gradient text-white ring-[8px] ring-card shadow-lg transition-all duration-300 group-hover:scale-105">
                                    <item.icon weight="bold" className="h-9 w-9 transition-transform duration-500 group-hover:rotate-180" />
                                </div>
                                <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-primary transition-colors">START</span>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-all duration-300 action-press",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className="relative flex flex-col items-center">
                                {isActive && (
                                    <motion.div
                                        layoutId="pill-highlight"
                                        className="absolute inset-0 -m-2 bg-primary/10 rounded-2xl"
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    />
                                )}
                                <item.icon
                                    weight={isActive ? "fill" : "regular"}
                                    className={cn("relative z-10 h-6 w-6 transition-all duration-300", isActive ? "scale-110" : "")}
                                />
                                <span className={cn("relative z-10 text-[10px] mt-1 tracking-tight transition-all duration-300", isActive ? "font-bold" : "font-medium")}>
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
