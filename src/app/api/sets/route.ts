import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { z } from 'zod'

const SetEntrySchema = z.object({
    id: z.string().uuid().optional(),
    workoutExerciseId: z.string().uuid(),
    setIndex: z.number().int(),
    weight: z.number(),
    reps: z.number().int(),
    rpe: z.number().optional().nullable(),
    isWarmup: z.boolean().optional(),
    note: z.string().optional().nullable()
})

const BulkSetsSchema = z.array(SetEntrySchema).or(z.object({
    sets: z.array(SetEntrySchema)
}))

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const result = BulkSetsSchema.safeParse(json)

        if (!result.success) {
            return NextResponse.json({ error: result.error.format() }, { status: 400 })
        }

        const parsedData = result.data
        const sets = Array.isArray(parsedData) ? parsedData : parsedData.sets

        if (!sets || !sets.length) {
            return NextResponse.json({ error: 'No sets provided' }, { status: 400 })
        }

        const userId = await getCurrentUserId()
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Verify ownership (IDOR prevention): 
        // We only check the first set's workoutExerciseId assuming batch sets belong to the same workoutExercise
        const sampleWorkoutExerciseId = sets[0].workoutExerciseId
        const workoutExercise = await prisma.workoutExercise.findUnique({
            where: { id: sampleWorkoutExerciseId },
            include: { session: { select: { userId: true } } }
        })

        if (!workoutExercise || workoutExercise.session.userId !== userId) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        const created = await prisma.setEntry.createMany({
            data: sets.map((s) => ({
                id: s.id, // optional uuid from client for offline sync matching
                workoutExerciseId: s.workoutExerciseId,
                setIndex: s.setIndex,
                weight: s.weight,
                reps: s.reps,
                rpe: s.rpe,
                isWarmup: s.isWarmup || false,
                note: s.note
            }))
        })

        return NextResponse.json({ success: true, count: created.count })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to save sets' }, { status: 500 })
    }
}
