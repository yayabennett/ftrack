import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { getCurrentUserId } from '@/lib/auth'

import { MuscleGroup, Equipment } from '@prisma/client'

const CreateExerciseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    muscleGroup: z.nativeEnum(MuscleGroup).optional(),
    equipment: z.nativeEnum(Equipment).optional(),
    notes: z.string().optional()
})

export async function GET() {
    try {
        const userId = await getCurrentUserId()
        const exercises = await prisma.exercise.findMany({
            where: {
                OR: [
                    { isCustom: false },
                    { userId },
                ]
            },
            orderBy: { name: 'asc' },
        })
        return NextResponse.json(exercises)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const result = CreateExerciseSchema.safeParse(json)

        if (!result.success) {
            return NextResponse.json({ error: result.error.format() }, { status: 400 })
        }

        const { name, muscleGroup, equipment, notes } = result.data
        const userId = await getCurrentUserId()

        const exercise = await prisma.exercise.create({
            data: {
                name,
                muscleGroup,
                equipment,
                notes,
                isCustom: true,
                userId,
            },
        })

        return NextResponse.json(exercise)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 })
    }
}
