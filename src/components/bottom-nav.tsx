"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, UserCircle, Plus, ClockCounterClockwise, ChartBar, Barbell, SquaresFour, DotsThree, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

export function BottomNav() {
    const pathname = usePathname()
    const [isMoreOpen, setIsMoreOpen] = useState(false)

    // Don't show bottom nav inside an active workout
    if (pathname.startsWith('/workout/')) return null

    const mainNavItems = [
        { name: 'Home', href: '/', icon: House },
        { name: 'Übungen', href: '/exercises', icon: Barbell },
        { name: 'Start', href: '/workout/start', icon: Plus, isAction: true },
        { name: 'Vorlagen', href: '/templates', icon: SquaresFour },
        { name: 'Mehr', action: () => setIsMoreOpen(!isMoreOpen), icon: isMoreOpen ? X : DotsThree, isMenu: true }
    ]

    const moreMenuLinks = [
        { name: 'Verlauf', href: '/history', icon: ClockCounterClockwise },
        { name: 'Statistik', href: '/stats', icon: ChartBar },
        { name: 'Profil', href: '/settings', icon: UserCircle },
    ]

    // Determine if any of the "more" links are currently active
    const isMoreActive = moreMenuLinks.some(link => pathname === link.href)

    return (
        <>
            {/* Backdrop for the expand menu */}
            <AnimatePresence>
                {isMoreOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
                        onClick={() => setIsMoreOpen(false)}
                    />
                )}
            </AnimatePresence>

            <div className="fixed bottom-6 left-4 right-4 z-50">
                {/* Expanded "More" Menu */}
                <AnimatePresence>
                    {isMoreOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                            className="absolute bottom-full right-0 mb-4 w-48 rounded-3xl bg-background/80 backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-2"
                        >
                            <div className="flex flex-col gap-1">
                                {moreMenuLinks.map((link) => {
                                    const isActive = pathname === link.href
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsMoreOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                                                isActive
                                                    ? "bg-primary/15 text-primary"
                                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground active:scale-95"
                                            )}
                                        >
                                            <link.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                                            <span className={cn("text-sm", isActive ? "font-bold" : "font-medium")}>
                                                {link.name}
                                            </span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Floating Dock */}
                <div className="flex h-[72px] items-center justify-between rounded-[2rem] border border-white/10 bg-background/70 backdrop-blur-[32px] px-2 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                    {mainNavItems.map((item, i) => {
                        const isActive = item.href ? pathname === item.href : (item.isMenu && isMoreActive)

                        if (item.isAction) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href || '#'}
                                    className="relative flex flex-col items-center justify-center -mt-4 group px-2"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-blue-600 text-primary-foreground shadow-[0_4px_16px_rgba(59,130,246,0.2)] ring-[4px] ring-background transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_24px_rgba(59,130,246,0.3)] group-active:scale-95 group-active:shadow-none">
                                        <item.icon className="h-7 w-7 stroke-[2px] transition-transform duration-300 group-hover:rotate-90" />
                                    </div>
                                    <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 group-hover:text-primary transition-colors">Start</span>
                                </Link>
                            )
                        }

                        if (item.isMenu) {
                            return (
                                <button
                                    key="menu"
                                    onClick={item.action}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center gap-1.5 w-[52px] h-[52px] rounded-2xl transition-all duration-300",
                                        isMoreOpen || isMoreActive
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground active:scale-90"
                                    )}
                                >
                                    {isMoreOpen || isMoreActive ? (
                                        <motion.div layoutId="activeTab" className="absolute inset-0 bg-primary/10 rounded-2xl" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                                    ) : null}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={isMoreOpen ? 'close' : 'open'}
                                            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <item.icon className={cn("relative z-10 h-[22px] w-[22px]", isMoreActive && "fill-primary/20")} strokeWidth={isMoreOpen ? 2.5 : 2} />
                                        </motion.div>
                                    </AnimatePresence>
                                    <span className={cn("relative z-10 text-[9px]", (isMoreOpen || isMoreActive) ? "font-bold" : "font-medium")}>
                                        {item.name}
                                    </span>
                                </button>
                            )
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href || '#'}
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
                                <span className={cn("relative z-10 text-[9px]", isActive ? "font-bold" : "font-medium")}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </>
    )
}
