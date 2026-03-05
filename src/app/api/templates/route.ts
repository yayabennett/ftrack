import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const CreateTemplateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    exercises: z.array(z.object({
        exerciseId: z.string().uuid(),
        targetSets: z.number().optional().nullable(),
        repRange: z.string().optional().nullable(),
        notes: z.string().optional().nullable()
    })).optional()
})

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
        const result = CreateTemplateSchema.safeParse(json)

        if (!result.success) {
            return NextResponse.json({ error: result.error.format() }, { status: 400 })
        }

        const { name, exercises } = result.data

        const template = await prisma.template.create({
            data: {
                name,
                exercises: {
                    create: exercises?.map((ex, index) => ({
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
