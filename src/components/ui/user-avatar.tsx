"use client"

import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import { initials, micah, notionists, adventurer, bottts } from '@dicebear/collection'
import { parseAvatarConfig } from '@/lib/avatar-utils'

const COLLECTIONS = {
    initials,
    micah,
    notionists,
    adventurer,
    bottts
}

interface UserAvatarProps {
    seed: string          // Either the raw DB string or just the old seed
    style?: string        // Used as raw DB string if provided. (Backwards compat)
    defaultName?: string  // Needed to extract real initials if the style is "initials"
    className?: string
}

export function UserAvatar({ seed, style, defaultName, className = "w-10 h-10" }: UserAvatarProps) {

    // The raw string could be passed as `style` OR `seed` depending on how it was invoked previously
    // E.g. <UserAvatar seed={user.image} /> vs <UserAvatar seed={user.id} style={user.image} />
    const rawConfigString = style && style.includes(':') || style?.includes('|') ? style : (seed.includes(':') || seed.includes('|') || seed.startsWith('http') ? seed : `${style}:${seed}:transparent`)

    // Parse using our new robust utility
    const config = parseAvatarConfig(rawConfigString, seed)

    const avatarSvg = useMemo(() => {
        if (config.isUrl) return null; // Skip SVG generation for raw HTTP URLs

        // 1. Initial Style Override (Don't use random hash, use real initials)
        if (config.style === 'initials') {
            const initialChars = defaultName ? defaultName.trim().substring(0, 2).toUpperCase() : config.seed.substring(0, 2).toUpperCase()
            return createAvatar(initials, {
                seed: initialChars,
                backgroundColor: config.bgColor !== 'transparent' ? [config.bgColor.replace('#', '')] : undefined,
                radius: 50
            }).toDataUri()
        }

        // 2. The New Builder Format
        // We will map 'builder' to the 'micah' collection locally because it has the most human traits
        if (config.style === 'builder') {
            return createAvatar(micah, {
                seed: config.seed,
                backgroundColor: config.bgColor !== 'transparent' ? [config.bgColor.replace('#', '')] : undefined,
                radius: 50,
                facialHairProbability: 100,
                glassesProbability: 100,
                // Pass all dynamic traits parsed from string 
                // e.g. { hair: ['short'], facialHair: ['beard'], ... }
                ...config.traits
            }).toDataUri()
        }

        // 3. Fallback to older presets 
        const selectedCollection = COLLECTIONS[config.style as keyof typeof COLLECTIONS] || COLLECTIONS.initials

        return createAvatar(selectedCollection as any, {
            seed: config.seed,
            backgroundColor: config.bgColor !== 'transparent' ? [config.bgColor.replace('#', '')] : undefined,
            radius: 50,
        }).toDataUri()

    }, [config, defaultName])

    // Render Raw Image
    if (config.isUrl) {
        return (
            <div className={`rounded-full overflow-hidden flex items-center justify-center border border-white/10 ${className}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.seed} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
        )
    }

    // Render DiceBear SVG
    return (
        <div
            className={`rounded-full overflow-hidden flex items-center justify-center border border-white/10 ${config.bgColor === 'transparent' ? 'bg-secondary' : ''} ${className}`}
            style={config.bgColor !== 'transparent' ? { backgroundColor: config.bgColor } : {}}
        >
            <img src={avatarSvg!} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
    )
}
