import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { WorkoutService } from '@/lib/services/workout.service'

export async function GET() {
    try {
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        // No need to include exercises; WorkoutService calculates volume natively.
        const sessions = await prisma.workoutSession.findMany({
            where: {
                userId,
                endedAt: { not: null }
            },
            orderBy: { startedAt: 'desc' },
            include: {
                template: { select: { name: true } }
            }
        })

        const mapped = await Promise.all(sessions.map(async (session) => {
            // Get volume efficiently via SQL rather than bringing thousands of rows into JS
            const volume = await WorkoutService.getSessionVolume(session.id)

            const durationMinutes = session.endedAt
                ? Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 60000)
                : 0

            return {
                id: session.id,
                startedAt: session.startedAt.toISOString(),
                endedAt: session.endedAt?.toISOString() || null,
                template: session.template,
                volume,
                durationMinutes
            }
        }))

        return NextResponse.json(mapped)
    } catch (e) {
        console.error('Failed to fetch sessions history:', e)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
