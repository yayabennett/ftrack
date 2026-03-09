import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const history = await prisma.workoutExercise.findMany({
            where: {
                exerciseId: id,
                session: { userId }
            },
            include: {
                session: {
                    select: { startedAt: true, endedAt: true }
                },
                sets: {
                    orderBy: { setIndex: 'asc' }
                }
            },
            orderBy: { session: { startedAt: 'desc' } },
            take: 10
        })

        return NextResponse.json(history)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }
}
