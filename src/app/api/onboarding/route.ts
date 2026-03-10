import { NextResponse } from 'next/server'
import { UserService } from '@/lib/services/user.service'
import { OnboardingSchema } from '@/lib/validations/auth'
import { getCurrentUserId } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const result = OnboardingSchema.safeParse(json)

        if (!result.success) {
            return NextResponse.json({ error: 'Ungültige Eingaben', details: result.error.format() }, { status: 400 })
        }

        const data = result.data
        const currentUserId = await getCurrentUserId()

        let user;
        if (currentUserId) {
            // Update existing user (logged in or local-only)
            user = await UserService.updateOnboarding(currentUserId, data)
        } else {
            // Fallback: This shouldn't happen much in the new Onboarding-First flow, 
            // but we keep it for robustness as a "guest-to-local" creation if needed.
            // Note: In the new flow, Account Creation (Register) is the primary path.
            return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
        }

        return NextResponse.json({ success: true, userId: user.id })
    } catch (error) {
        console.error('Onboarding error:', error)
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
    }
}
