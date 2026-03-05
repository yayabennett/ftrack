import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const history = await prisma.workoutExercise.findMany({
            where: { exerciseId: id },
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
