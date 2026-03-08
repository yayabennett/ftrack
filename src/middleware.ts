import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
    const userId = req.cookies.get('ftrack-user-id')?.value

    if (!userId) {
        const onboardingUrl = new URL('/onboarding', req.url)
        return NextResponse.redirect(onboardingUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!onboarding|api/onboarding|api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|icons).*)',
    ],
}
