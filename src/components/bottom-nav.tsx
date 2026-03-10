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
        <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
            {/* Clean Solid Yazio Dock */}
            <div className="flex h-20 items-center justify-between bg-card border-t border-border px-4 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.2)]">
                {mainNavItems.map((item) => {
                    const isActive = pathname === item.href

                    if (item.isAction) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center justify-center -mt-8 group px-2 action-press"
                            >
                                <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full btn-primary-gradient text-white ring-[6px] ring-card transition-all duration-300 group-hover:scale-105">
                                    <item.icon className="h-8 w-8 stroke-[2.5px] transition-transform duration-300 group-hover:rotate-180" />
                                </div>
                                <span className="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">Start</span>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-1 w-[60px] h-[60px] rounded-2xl transition-all duration-300 action-press",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <motion.div layoutId="activeTab" className="absolute -top-1 w-8 h-1 bg-primary rounded-b-full" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                            )}
                            <item.icon className={cn("relative z-10 h-7 w-7 transition-all duration-300", isActive ? "scale-110 fill-primary/10" : "")} strokeWidth={isActive ? 2.5 : 2} />
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
