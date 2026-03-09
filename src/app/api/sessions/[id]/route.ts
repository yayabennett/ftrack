import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Verify session exists
        const session = await prisma.workoutSession.findUnique({ where: { id } })
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Cascade delete: WorkoutExercises → SetEntries all deleted by onDelete: Cascade
        await prisma.workoutSession.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
    }
}

import { getCurrentUserId } from '@/lib/auth'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const { id } = await params

        const session = await prisma.workoutSession.findUnique({
            where: {
                id,
                userId
            },
            include: {
                template: { select: { id: true, name: true } },
                exercises: {
                    orderBy: { order: 'asc' },
                    include: {
                        exercise: { select: { id: true, name: true, muscleGroup: true } },
                        sets: { orderBy: { setIndex: 'asc' } }
                    }
                }
            }
        })

        if (!session) {
            return new NextResponse('Not Found', { status: 404 })
        }

        return NextResponse.json(session)
    } catch (e) {
        console.error('Failed to fetch session detail:', e)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
