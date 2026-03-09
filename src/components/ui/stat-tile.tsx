import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'

export interface StatTileProps {
    icon: React.ReactNode
    label: string
    value: string | number
    color?: string
    bg?: string
}

export function StatTile({ icon, label, value, color = 'text-primary', bg = 'bg-primary/10' }: StatTileProps) {
    return (
        <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-1">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <span className="text-lg font-extrabold text-foreground">{value}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
            </CardContent>
        </Card>
    )
}
