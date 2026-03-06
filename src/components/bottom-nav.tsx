"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Copy, BarChart2, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Einheiten', href: '/templates', icon: Copy },
        { name: 'Start', href: '/workout/start', icon: Plus, isAction: true },
        { name: 'Statistiken', href: '/stats', icon: BarChart2 },
        { name: 'Profil', href: '/settings', icon: User },
    ]

    // Don't show bottom nav inside an active workout
    if (pathname.startsWith('/workout/')) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[76px] items-center justify-around border-t border-white/5 bg-[#0A0B10]/90 backdrop-blur-xl pb-safe px-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href

                if (item.isAction) {
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center -mt-8 relative group"
                        >
                            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] transition-transform group-active:scale-90 ring-4 ring-[#0A0B10]">
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
