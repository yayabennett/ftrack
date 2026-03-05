import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const json = await request.json()
        const { exerciseId, order } = json

        const workoutExercise = await prisma.workoutExercise.create({
            data: {
                sessionId: id,
                exerciseId,
                order
            }
        })
        return NextResponse.json(workoutExercise)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add exercise to session' }, { status: 500 })
    }
}
