import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const bodyText = await request.text()
        const json = bodyText ? JSON.parse(bodyText) : {}
        const { templateId, notes } = json

        const session = await prisma.workoutSession.create({
            data: {
                templateId: templateId || null,
                notes,
                startedAt: new Date(),
            }
        })

        if (templateId) {
            const templateExercises = await prisma.templateExercise.findMany({
                where: { templateId },
                orderBy: { order: 'asc' }
            })

            if (templateExercises.length > 0) {
                await prisma.workoutExercise.createMany({
                    data: templateExercises.map((te: any) => ({
                        sessionId: session.id,
                        exerciseId: te.exerciseId,
                        order: te.order
                    }))
                })
            }
        }

        return NextResponse.json(session)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
    }
}
