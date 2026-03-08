import { cookies } from 'next/headers'

/**
 * Returns the current user's ID from the ftrack-user-id cookie.
 * Returns null if no cookie is set (user hasn't onboarded).
 */
export async function getCurrentUserId(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get('ftrack-user-id')?.value ?? null
}
