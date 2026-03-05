"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, BarChart2, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Vorlagen', href: '/templates', icon: List },
        { name: 'Statistiken', href: '/stats', icon: BarChart2 },
        { name: 'Profil', href: '/settings', icon: User },
    ]

    // Don't show bottom nav inside an active workout
    if (pathname.startsWith('/workout/')) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[72px] items-center justify-around border-t border-white/5 bg-[#0A0B10]/90 backdrop-blur-xl pb-safe px-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all duration-200",
                            isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                        <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{item.name}</span>
                    </Link>
                )
            })}
        </div>
    )
}
