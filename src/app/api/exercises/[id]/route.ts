import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const { id } = await params

        const exercise = await prisma.exercise.findUnique({
            where: { id },
            select: { id: true, name: true, muscleGroup: true, equipment: true }
        })

        if (!exercise) {
            return new NextResponse('Not Found', { status: 404 })
        }

        // Fetch all sets for this exercise by this user, grouped by session somehow.
        // Easiest is to fetch all WorkoutExercises for this exercise + user
        const workoutExercises = await prisma.workoutExercise.findMany({
            where: {
                exerciseId: id,
                session: { userId, endedAt: { not: null } }
            },
            include: {
                session: { select: { id: true, startedAt: true } },
                sets: { orderBy: { setIndex: 'asc' } }
            },
            orderBy: {
                session: { startedAt: 'desc' }
            }
        })

        const history = workoutExercises.map(we => {
            // Calculate best e1RM from this session's sets
            // e1RM = weight * (1 + reps/30) (Brzycki formula)
            let maxE1RM = 0
            we.sets.forEach((set: any) => {
                const e1rm = set.weight * (1 + set.reps / 30)
                if (e1rm > maxE1RM) maxE1RM = e1rm
            })

            return {
                sessionId: (we as any).session.id,
                date: (we as any).session.startedAt.toISOString(),
                sets: (we as any).sets.map((s: any) => ({
                    id: s.id,
                    workoutExerciseId: s.workoutExerciseId,
                    setIndex: s.setIndex,
                    weight: s.weight,
                    reps: s.reps,
                    rpe: s.rpe,
                    isWarmup: s.isWarmup,
                    note: s.note,
                    createdAt: s.createdAt.toISOString()
                })),
                e1RM: Math.round(maxE1RM * 10) / 10 // rounded to 1 decimal place
            }
        })

        return NextResponse.json({ ...exercise, history })
    } catch (e) {
        console.error('Failed to fetch exercise history:', e)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
