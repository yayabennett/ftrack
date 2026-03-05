"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, BarChart2, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Templates', href: '/templates', icon: List },
        { name: 'Stats', href: '/stats', icon: BarChart2 },
        { name: 'Settings', href: '/settings', icon: Settings },
    ]

    // Don't show bottom nav inside an active workout
    if (pathname.startsWith('/workout/')) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/80 backdrop-blur-md pb-safe">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </Link>
                )
            })}
        </div>
    )
}
