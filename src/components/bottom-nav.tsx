"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, UserCircle, ClockCounterClockwise, Barbell, ChartBar } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function BottomNav() {
    const pathname = usePathname()

    // No need for URL checks thanks to layout route groups `(main)`

    const mainNavItems = [
        { name: 'Home', href: '/', icon: House },
        { name: 'Einheiten', href: '/templates', icon: Barbell },
        { name: 'Verlauf', href: '/history', icon: ClockCounterClockwise },
        { name: 'Statistiken', href: '/stats', icon: ChartBar },
        { name: 'Profil', href: '/settings', icon: UserCircle }
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-background/85 backdrop-blur-xl border-t border-white/[0.05]" />

            <div className="relative flex h-[84px] items-center justify-between px-2 max-w-md mx-auto">
                {mainNavItems.map((item) => {
                    // Check if active (handle exact match for Home, loose for others)
                    const isActive = item.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-1 flex-col items-center justify-center h-full transition-all duration-300 active:scale-95 touch-manipulation group"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            {/* Active Dot Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="navbar-indicator"
                                    className="absolute top-2 w-1.5 h-1.5 rounded-full bg-[#00E2AA] shadow-[0_0_12px_rgba(0,226,170,0.6)]"
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                            )}

                            <div className="relative flex flex-col items-center mt-3">
                                <item.icon
                                    weight={isActive ? "fill" : "regular"}
                                    className={cn(
                                        "h-[26px] w-[26px] transition-all duration-300",
                                        isActive ? "text-[#00E2AA] scale-110" : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />
                                <span
                                    className={cn(
                                        "text-[10px] mt-1 tracking-wide transition-all duration-300",
                                        isActive ? "font-bold text-[#00E2AA]" : "font-medium text-muted-foreground group-hover:text-foreground"
                                    )}
                                >
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
