import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const templates = await prisma.template.findMany({
            include: {
                exercises: {
                    include: {
                        exercise: true
                    },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(templates)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const { name, exercises } = json

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const template = await prisma.template.create({
            data: {
                name,
                // Assuming exercises is an array of { exerciseId, targetSets, repRange, notes }
                exercises: {
                    create: exercises?.map((ex: any, index: number) => ({
                        exerciseId: ex.exerciseId,
                        order: index,
                        targetSets: ex.targetSets,
                        repRange: ex.repRange,
                        notes: ex.notes
                    })) || []
                }
            },
            include: {
                exercises: true
            }
        })

        return NextResponse.json(template)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }
}
