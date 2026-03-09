"use client"

import { Sparkle, Sword, Shield, Footprints, Lightning, Heartbeat } from '@phosphor-icons/react'
import { ReactNode } from 'react'

interface MuscleGroupSectionProps {
    group: string
    count: number
    children: ReactNode
}

export function MuscleGroupSection({ group, count, children }: MuscleGroupSectionProps) {
    // Muscle group icon & color mapper
    const GroupConfig = (name: string) => {
        const lower = name.toLowerCase()
        if (lower.includes('brust') || lower.includes('chest')) return { icon: <Shield weight="fill" />, color: 'text-orange-400' }
        if (lower.includes('beine') || lower.includes('legs') || lower.includes('quads')) return { icon: <Footprints weight="fill" />, color: 'text-cyan-400' }
        if (lower.includes('rücken') || lower.includes('back')) return { icon: <Sword weight="fill" />, color: 'text-emerald-400' }
        if (lower.includes('schulter') || lower.includes('shoulders')) return { icon: <Lightning weight="fill" />, color: 'text-amber-400' }
        if (lower.includes('bauch') || lower.includes('abs')) return { icon: <Heartbeat weight="fill" />, color: 'text-rose-400' }
        return { icon: <Sparkle weight="fill" />, color: 'text-primary/60' }
    }

    const config = GroupConfig(group)

    return (
        <section className="space-y-3">
            <div className="sticky top-14 z-30 -mx-5 px-5 py-2.5 bg-background/80 backdrop-blur-xl border-y border-white/[0.03]">
                <h2 className="text-[11px] font-black tracking-[0.15em] text-muted-foreground uppercase flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={config.color}>{config.icon}</span>
                        {group}
                    </div>
                    <span className="text-[10px] text-muted-foreground/30 font-bold bg-secondary/40 px-2 py-0.5 rounded-full">{count}</span>
                </h2>
            </div>
            <div className="space-y-2">
                {children}
            </div>
        </section>
    )
}
