import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth-options'

/**
 * Returns the current user's ID.
 * Prioritizes NextAuth session. Falls back to ftrack-user-id cookie for migration.
 */
export async function getCurrentUserId(): Promise<string | null> {
    const session = await getServerSession(authOptions)
    if (session?.user && (session.user as { id?: string }).id) {
        return (session.user as { id?: string }).id as string
    }

    const cookieStore = await cookies()
    return cookieStore.get('ftrack-user-id')?.value ?? null
}
