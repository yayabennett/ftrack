import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
        const { name, muscleGroup, equipment, notes } = json

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const exercise = await prisma.exercise.create({
            data: {
                name,
                muscleGroup,
                equipment,
                notes,
                isCustom: true,
            },
        })

        return NextResponse.json(exercise)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 })
    }
}
