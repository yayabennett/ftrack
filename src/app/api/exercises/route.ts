import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const CreateExerciseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    muscleGroup: z.string().optional(),
    equipment: z.string().optional(),
    notes: z.string().optional()
})

export async function GET() {
    try {
        const exercises = await prisma.exercise.findMany({
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

        const data = result.data

        const exercise = await prisma.exercise.create({
            data: {
                ...data,
                isCustom: true,
            },
        })

        return NextResponse.json(exercise)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 })
    }
}
