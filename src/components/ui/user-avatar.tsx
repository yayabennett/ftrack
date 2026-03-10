"use client"

import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import { adventurer, bottts, initials, avataaars } from '@dicebear/collection'

interface UserAvatarProps {
    seed: string
    style?: 'adventurer' | 'bottts' | 'initials' | 'avataaars'
    className?: string
}

export function UserAvatar({ seed, style = 'initials', className = "w-10 h-10" }: UserAvatarProps) {
    const avatar = useMemo(() => {
        const collections: Record<string, any> = {
            adventurer,
            bottts,
            initials,
            avataaars
        }

        return createAvatar(collections[style] || collections.initials, {
            seed,
        }).toDataUri()
    }, [seed, style])

    return (
        <div className={`rounded-full overflow-hidden bg-secondary flex items-center justify-center border border-white/10 ${className}`}>
            <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
    )
}
