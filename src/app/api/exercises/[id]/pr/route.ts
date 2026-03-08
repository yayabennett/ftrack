import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { PRResult } from '@/lib/types'

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: exerciseId } = await params

        // Find the all-time best set for this exercise by 1RM proxy: weight × reps
        const sets = await prisma.setEntry.findMany({
            where: {
                workoutExercise: { exerciseId },
                isWarmup: false, // exclude warmup sets from PRs
            },
            select: {
                weight: true,
                reps: true,
                createdAt: true,
                workoutExercise: {
                    select: {
                        exercise: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'asc' },
        })

        if (sets.length === 0) {
            return NextResponse.json(null)
        }

        // Best volume set (weight × reps) — simple, intuitive PR metric
        let bestSet = sets[0]
        for (const s of sets) {
            if (s.weight * s.reps > bestSet.weight * bestSet.reps) {
                bestSet = s
            }
        }

        const result: PRResult = {
            exerciseId,
            exerciseName: bestSet.workoutExercise.exercise.name,
            weight: bestSet.weight,
            reps: bestSet.reps,
            volume: bestSet.weight * bestSet.reps,
            achievedAt: bestSet.createdAt.toISOString(),
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch PR' }, { status: 500 })
    }
}
