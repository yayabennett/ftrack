import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { getCurrentUserId } from '@/lib/auth'

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
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const sessionDate = startedAt ? new Date(startedAt) : new Date()

        let session; // Declare session here to be accessible outside if/else

        if (templateId) {
            // Fetch template exercises first to know what to create
            const templateExercises = await prisma.templateExercise.findMany({
                where: { templateId },
                orderBy: { order: 'asc' }
            })

            // Use nested writes to create session and workout exercises in one transaction
            session = await prisma.workoutSession.create({
                data: {
                    templateId,
                    notes,
                    userId,
                    startedAt: sessionDate,
                    exercises: {
                        create: templateExercises.map((te: { exerciseId: string; order: number }) => ({
                            exerciseId: te.exerciseId,
                            order: te.order,
                            // we pass these through for the client to parse, even if they aren't saved on WorkoutExercise schema
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

            // Inject template data back into the session response for the client
            const sessionWithTargets = {
                ...session,
                exercises: session.exercises.map((ex) => {
                    const te = templateExercises.find((t: any) => t.exerciseId === ex.exerciseId) as any
                    return {
                        ...ex,
                        targetSets: te?.targetSets,
                        repRange: te?.repRange,
                        targetWeight: te?.targetWeight,
                    }
                })
            }

            return NextResponse.json(sessionWithTargets)
        }

        // Without template, just create an empty session
        session = await prisma.workoutSession.create({
            data: {
                notes,
                userId,
                startedAt: sessionDate,
            }
        })

        return NextResponse.json(session)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
    }
}
