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

        // Extract all unique workoutExerciseIds from the incoming payload
        const wExIds = [...new Set(sets.map((s: any) => s.workoutExerciseId))]

        // IDOR PREVENTION: 
        // We MUST verify that *every single* workoutExerciseId requested belongs to an active session
        // owned by the currently authenticated user.
        const validExercises = await prisma.workoutExercise.findMany({
            where: {
                id: { in: wExIds },
                session: { userId }
            },
            select: { id: true }
        })

        if (validExercises.length !== wExIds.length) {
            return new NextResponse('Forbidden: One or more exercises do not belong to you.', { status: 403 })
        }

        // OFFLINE IDEMPOTENCY:
        // Use an upsert loop based on the client-provided ID so retries don't duplicate sets.
        // Fallback to random UUID if the client doesn't provide one (unlikely but safe).
        const crypto = require('crypto')

        const upsertPromises = sets.map((s: any) => {
            const setId = s.id || crypto.randomUUID()
            return prisma.setEntry.upsert({
                where: { id: setId },
                update: {
                    setIndex: s.setIndex,
                    weight: s.weight,
                    reps: s.reps,
                    rpe: s.rpe,
                    isWarmup: s.isWarmup || false,
                    note: s.note
                },
                create: {
                    id: setId,
                    workoutExerciseId: s.workoutExerciseId,
                    setIndex: s.setIndex,
                    weight: s.weight,
                    reps: s.reps,
                    rpe: s.rpe,
                    isWarmup: s.isWarmup || false,
                    note: s.note
                }
            })
        })

        await Promise.all(upsertPromises)

        return NextResponse.json({ success: true, count: sets.length })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to save sets' }, { status: 500 })
    }
}
