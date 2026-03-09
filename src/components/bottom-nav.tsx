"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Copy, User, Plus, History } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Einheiten', href: '/templates', icon: Copy },
        { name: 'Start', href: '/workout/start', icon: Plus, isAction: true },
        { name: 'Verlauf', href: '/history', icon: History },
        { name: 'Profil', href: '/settings', icon: User },
    ]

    // Don't show bottom nav inside an active workout
    if (pathname.startsWith('/workout/')) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[76px] items-center justify-around border-t border-white-[0.03] bg-background/60 backdrop-blur-[32px] pb-safe px-2 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
            {navItems.map((item) => {
                const isActive = pathname === item.href

                if (item.isAction) {
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center -mt-8 relative group"
                        >
                            <div className="w-14 h-14 rounded-full btn-primary-gradient flex items-center justify-center text-primary-foreground transition-[transform,box-shadow] group-active:scale-90 ring-[6px] ring-background">
                                <item.icon className="h-7 w-7 stroke-[3px]" />
                            </div>
                            <span className="text-[10px] mt-1.5 font-bold text-primary">Start</span>
                        </Link>
                    )
                }

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1.5 w-16 h-12 rounded-xl transition-all duration-200",
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", isActive && "fill-primary/10")} />
                        <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{item.name}</span>
                    </Link>
                )
            })}
        </div>
    )
}
