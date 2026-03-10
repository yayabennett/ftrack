import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { UserService } from '@/lib/services/user.service'
import { RegisterSchema } from '@/lib/validations/auth'

export async function POST(req: Request) {
    try {
        const json = await req.json()
        const result = RegisterSchema.safeParse(json)

        if (!result.success) {
            return NextResponse.json({ error: 'Ungültige Eingaben', details: result.error.format() }, { status: 400 })
        }

        const data = result.data

        if (await UserService.isEmailTaken(data.email)) {
            return NextResponse.json({ error: 'E-Mail bereits vergeben' }, { status: 400 })
        }

        const cookieStore = await cookies()
        const migrateUserId = cookieStore.get('iTrack-user-id')?.value

        const user = await UserService.registerAndOnboard(data, migrateUserId)

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        })
    } catch (error) {
        console.error('Registration Error:', error)
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
    }
}
