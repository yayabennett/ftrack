import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

/**
 * Returns the sets from the most recent completed session for a given exercise.
 * Used to pre-fill weight/reps suggestions in an active workout.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const userId = await getCurrentUserId()

        // Find the most recent workout exercise entry for this exercise
        const lastWorkoutExercise = await prisma.workoutExercise.findFirst({
            where: {
                exerciseId: id,
                session: {
                    endedAt: { not: null }, // Only completed sessions
                    ...(userId ? { userId } : {})
                }
            },
            include: {
                sets: {
                    orderBy: { setIndex: 'asc' },
                    select: {
                        setIndex: true,
                        weight: true,
                        reps: true,
                        rpe: true,
                    }
                }
            },
            orderBy: { session: { startedAt: 'desc' } }
        })

        if (!lastWorkoutExercise || lastWorkoutExercise.sets.length === 0) {
            return NextResponse.json({ sets: [], suggestion: null })
        }

        // Calculate a progressive overload suggestion (+2.5kg on the heaviest set)
        const maxWeight = Math.max(...lastWorkoutExercise.sets.map((s: { weight: number }) => s.weight))
        const suggestion = {
            weight: maxWeight + 2.5,
            label: `+2.5 kg`
        }

        return NextResponse.json({
            sets: lastWorkoutExercise.sets,
            suggestion
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ sets: [], suggestion: null })
    }
}
