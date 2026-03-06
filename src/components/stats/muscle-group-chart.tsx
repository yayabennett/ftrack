"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

export interface MuscleGroupStat {
    name: string
    sets: number
    percentage: number // 0 to 100
}

interface MuscleGroupChartProps {
    data: MuscleGroupStat[]
}

export function MuscleGroupChart({ data }: MuscleGroupChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-foreground">
                        <Activity className="h-4 w-4 text-primary" />
                        Muskelgruppen-Fokus
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-4 text-center text-sm text-muted-foreground">
                    Noch keine Daten vorhanden. Absolviere ein Training!
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-foreground">
                    <Activity className="h-4 w-4 text-primary" />
                    Muskelgruppen-Fokus (30 Tage)
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                    Verteilung deiner Trainingssätze nach Muskelgruppe.
                </p>
            </CardHeader>
            <CardContent className="p-4 pt-4">
                <div className="space-y-4">
                    {data.map((group, i) => (
                        <div key={group.name} className="flex flex-col gap-1.5 group cursor-pointer">
                            <div className="flex justify-between items-center text-[12px] font-bold">
                                <span className="text-foreground">{group.name}</span>
                                <span className="text-muted-foreground">{group.sets} Sätze <span className="opacity-50">({Math.round(group.percentage)}%)</span></span>
                            </div>
                            <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${group.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
