import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET() {
    try {
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const sessions = await prisma.workoutSession.findMany({
            where: {
                userId,
                endedAt: { not: null }
            },
            orderBy: { startedAt: 'desc' },
            include: {
                template: { select: { name: true } },
                exercises: {
                    include: { sets: true }
                }
            }
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = sessions.map((session: any) => {
            let volume = 0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            session.exercises.forEach((ex: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ex.sets.forEach((set: any) => {
                    volume += set.weight * set.reps
                })
            })

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
        })

        return NextResponse.json(mapped)
    } catch (e) {
        console.error('Failed to fetch sessions history:', e)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
