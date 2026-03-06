import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const StartSessionSchema = z.object({
    templateId: z.string().uuid().optional().nullable(),
    startedAt: z.string().datetime({ offset: true }).optional().nullable(),
    notes: z.string().optional().nullable()
})

export async function POST(request: Request) {
    try {
        const bodyText = await request.text()
        const json = bodyText ? JSON.parse(bodyText) : {}
        const result = StartSessionSchema.safeParse(json)

        if (!result.success) {
            return NextResponse.json({ error: result.error.format() }, { status: 400 })
        }

        const { templateId, startedAt, notes } = result.data
        const sessionDate = startedAt ? new Date(startedAt) : new Date()

        if (templateId) {
            // Fetch template exercises first to know what to create
            const templateExercises = await prisma.templateExercise.findMany({
                where: { templateId },
                orderBy: { order: 'asc' }
            })

            // Use nested writes to create session and workout exercises in one transaction
            const session = await prisma.workoutSession.create({
                data: {
                    templateId,
                    notes,
                    startedAt: sessionDate,
                    exercises: {
                        create: templateExercises.map((te: any) => ({
                            exerciseId: te.exerciseId,
                            order: te.order
                        }))
                    }
                },
                include: {
                    exercises: {
                        include: {
                            exercise: true
                        }
                    }
                }
            })

            return NextResponse.json(session)
        }

        // Without template, just create an empty session
        const session = await prisma.workoutSession.create({
            data: {
                notes,
                startedAt: sessionDate,
            }
        })

        return NextResponse.json(session)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
    }
}
