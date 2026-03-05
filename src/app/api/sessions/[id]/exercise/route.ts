import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const AddExerciseSchema = z.object({
    exerciseId: z.string().uuid(),
    order: z.number().int().min(0)
})

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const json = await request.json()
        const result = AddExerciseSchema.safeParse(json)

        if (!result.success) {
            return NextResponse.json({ error: result.error.format() }, { status: 400 })
        }

        const { exerciseId, order } = result.data

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
