import { NextResponse } from 'next/server'
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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const configString = searchParams.get('config')
        const name = searchParams.get('name')

        if (!configString) {
            return new NextResponse('Missing config', { status: 400 })
        }

        const config = parseAvatarConfig(configString)

        if (config.isUrl) {
            // Technically we shouldn't hit this API for raw URLs, 
            // but we can redirect to the image if it happens.
            return NextResponse.redirect(config.seed)
        }

        let svgString = ''

        if (config.style === 'initials') {
            const initialChars = name ? name.trim().substring(0, 2).toUpperCase() : config.seed.substring(0, 2).toUpperCase()
            svgString = createAvatar(initials, {
                seed: initialChars,
                backgroundColor: config.bgColor !== 'transparent' ? [config.bgColor.replace('#', '')] : undefined,
                radius: 50
            }).toString()
        }
        else if (config.style === 'builder') {
            svgString = createAvatar(micah, {
                seed: config.seed,
                backgroundColor: config.bgColor !== 'transparent' ? [config.bgColor.replace('#', '')] : undefined,
                radius: 50,
                ...config.traits
            }).toString()
        }
        else {
            const selectedCollection = COLLECTIONS[config.style as keyof typeof COLLECTIONS] || COLLECTIONS.initials
            svgString = createAvatar(selectedCollection as any, {
                seed: config.seed,
                backgroundColor: config.bgColor !== 'transparent' ? [config.bgColor.replace('#', '')] : undefined,
                radius: 50,
            }).toString()
        }

        return new NextResponse(svgString, {
            status: 200,
            headers: {
                'Content-Type': 'image/svg+xml',
                // Cache for 1 year publicly (SVGs are tiny and stateless once created)
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        })
    } catch (error) {
        console.error('Error generating avatar:', error)
        return new NextResponse('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#eee"/></svg>', {
            status: 500,
            headers: { 'Content-Type': 'image/svg+xml' }
        })
    }
}
