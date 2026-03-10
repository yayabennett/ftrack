import React from 'react'
import {
    Barbell,
    PersonArmsSpread,
    PersonSimpleRun,
    PersonSimpleWalk,
    HandGrabbing,
    Sneaker,
    Cube,
    HardDrives,
    User,
    Lightning
} from '@phosphor-icons/react'

export type MuscleGroupStyle = {
    colorClass: string
    bgClass: string
    borderClass: string
    icon: React.ReactNode
}

export function getMuscleGroupStyle(muscleGroup: string | null | undefined): MuscleGroupStyle {
    const group = muscleGroup?.toLowerCase() || ''

    if (group.includes('brust')) {
        return {
            colorClass: 'text-blue-500',
            bgClass: 'bg-blue-500/10',
            borderClass: 'border-blue-500/20',
            icon: <PersonArmsSpread weight="duotone" className="w-full h-full" />
        }
    }
    if (group.includes('rücken')) {
        return {
            colorClass: 'text-emerald-500',
            bgClass: 'bg-emerald-500/10',
            borderClass: 'border-emerald-500/20',
            icon: <User weight="duotone" className="w-full h-full" />
        }
    }
    if (group.includes('quads') || group.includes('beine (quads)')) {
        return {
            colorClass: 'text-orange-500',
            bgClass: 'bg-orange-500/10',
            borderClass: 'border-orange-500/20',
            icon: <PersonSimpleRun weight="duotone" className="w-full h-full" />
        }
    }
    if (group.includes('hams') || group.includes('beine (hams)')) {
        return {
            colorClass: 'text-amber-500',
            bgClass: 'bg-amber-500/10',
            borderClass: 'border-amber-500/20',
            icon: <PersonSimpleWalk weight="duotone" className="w-full h-full" />
        }
    }
    if (group.includes('schultern')) {
        return {
            colorClass: 'text-purple-500',
            bgClass: 'bg-purple-500/10',
            borderClass: 'border-purple-500/20',
            icon: <Barbell weight="duotone" className="w-full h-full" />
        }
    }
    if (group.includes('bizeps')) {
        return {
            colorClass: 'text-red-500',
            bgClass: 'bg-red-500/10',
            borderClass: 'border-red-500/20',
            icon: <HandGrabbing weight="duotone" className="w-full h-full" />
        }
    }
    if (group.includes('trizeps')) {
        return {
            colorClass: 'text-cyan-500',
            bgClass: 'bg-cyan-500/10',
            borderClass: 'border-cyan-500/20',
            icon: <HandGrabbing weight="duotone" className="w-full h-full" />
        }
    }
    if (group.includes('bauch')) {
        return {
            colorClass: 'text-yellow-500',
            bgClass: 'bg-yellow-500/10',
            borderClass: 'border-yellow-500/20',
            icon: <Lightning weight="duotone" className="w-full h-full" />
        }
    }
    if (group.includes('waden')) {
        return {
            colorClass: 'text-lime-500',
            bgClass: 'bg-lime-500/10',
            borderClass: 'border-lime-500/20',
            icon: <Sneaker weight="duotone" className="w-full h-full" />
        }
    }
    if (group.includes('po') || group.includes('glutes')) {
        return {
            colorClass: 'text-pink-500',
            bgClass: 'bg-pink-500/10',
            borderClass: 'border-pink-500/20',
            icon: <User weight="duotone" className="w-full h-full" />
        }
    }

    // Default / Ganzkörper / Sonstige
    return {
        colorClass: 'text-primary',
        bgClass: 'bg-primary/10',
        borderClass: 'border-primary/20',
        icon: <Barbell weight="duotone" className="w-full h-full" />
    }
}
