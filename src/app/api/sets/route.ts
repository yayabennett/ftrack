import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const sets = Array.isArray(json) ? json : json.sets

        if (!sets || !sets.length) {
            return NextResponse.json({ error: 'No sets provided' }, { status: 400 })
        }

        const created = await prisma.setEntry.createMany({
            data: sets.map((s: any) => ({
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
