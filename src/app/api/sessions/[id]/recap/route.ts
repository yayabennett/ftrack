import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const userId = await getCurrentUserId()

        const session = await prisma.workoutSession.findUnique({
            where: { id },
            include: {
                template: { select: { name: true, id: true } },
                exercises: {
                    include: {
                        exercise: { select: { name: true, id: true } },
                        sets: { orderBy: { setIndex: 'asc' } }
                    }
                }
            }
        })

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        const duration = session.endedAt
            ? Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 60000)
            : 0

        let totalVolume = 0
        let totalSets = 0

        for (const ex of session.exercises) {
            for (const set of ex.sets) {
                totalVolume += set.weight * set.reps
                totalSets++
            }
        }

        // Compare with previous session (same template or just the one before)
        let previousVolume: number | null = null
        const previousSession = await prisma.workoutSession.findFirst({
            where: {
                id: { not: id },
                endedAt: { not: null },
                ...(userId ? { userId } : {}),
                ...(session.templateId ? { templateId: session.templateId } : {}),
                startedAt: { lt: session.startedAt }
            },
            include: {
                exercises: {
                    include: { sets: true }
                }
            },
            orderBy: { startedAt: 'desc' }
        })

        if (previousSession) {
            previousVolume = 0
            for (const ex of previousSession.exercises) {
                for (const set of ex.sets) {
                    previousVolume += set.weight * set.reps
                }
            }
        }

        // Detect PRs: for each exercise, check if any set beats the previous best volume (weight × reps)
        const prs: { exerciseName: string; weight: number; reps: number }[] = []

        for (const ex of session.exercises) {
            const bestSetVolume = Math.max(...ex.sets.map((s: { weight: number; reps: number }) => s.weight * s.reps), 0)
            const bestSet = ex.sets.find((s: { weight: number; reps: number }) => s.weight * s.reps === bestSetVolume)

            if (bestSet && bestSetVolume > 0) {
                // Check previous best for this exercise
                const previousBest = await prisma.setEntry.findFirst({
                    where: {
                        workoutExercise: {
                            exerciseId: ex.exerciseId,
                            session: {
                                id: { not: id },
                                endedAt: { not: null },
                            }
                        }
                    },
                    orderBy: { weight: 'desc' },
                    take: 1
                })

                const prevBestVolume = previousBest ? previousBest.weight * previousBest.reps : 0
                if (bestSetVolume > prevBestVolume) {
                    prs.push({
                        exerciseName: ex.exercise.name,
                        weight: bestSet.weight,
                        reps: bestSet.reps
                    })
                }
            }
        }

        return NextResponse.json({
            templateName: session.template?.name || null,
            duration,
            totalVolume,
            totalSets,
            exerciseCount: session.exercises.length,
            prs,
            previousVolume
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to generate recap' }, { status: 500 })
    }
}
