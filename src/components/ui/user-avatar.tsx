"use client"

import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import * as collections from '@dicebear/collection'

interface UserAvatarProps {
    seed: string
    style?: string // Format can be just "initials" or detailed "collection:seed:backgroundColor"
    className?: string
}

export function UserAvatar({ seed, style = 'initials', className = "w-10 h-10" }: UserAvatarProps) {
    const avatar = useMemo(() => {
        // Parse the payload if it's the new complex format
        const parts = style.split(':')
        const collectionName = parts[0] || 'initials'
        const customSeed = parts[1] || seed
        const bgColor = parts[2] || 'transparent'

        // Map collection name to actual collection object
        // @ts-ignore
        const selectedCollection = collections[collectionName as keyof typeof collections] || collections.initials

        return createAvatar(selectedCollection as any, {
            seed: customSeed,
            backgroundColor: bgColor !== 'transparent' ? [bgColor.replace('#', '')] : undefined,
            radius: 50, // ensures transparent avatars fit nicely natively
        }).toDataUri()
    }, [seed, style])

    // Extract background color to apply to container if needed
    const containerBg = style.includes(':') && style.split(':')[2] !== 'transparent' ? style.split(':')[2] : undefined

    return (
        <div
            className={`rounded-full overflow-hidden flex items-center justify-center border border-white/10 ${!containerBg ? 'bg-secondary' : ''} ${className}`}
            style={containerBg ? { backgroundColor: containerBg } : {}}
        >
            <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
    )
}
