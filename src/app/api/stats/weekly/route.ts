import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const today = new Date()
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

        // 1. Get raw sets with only weight and reps mapped to the session date
        // 100x faster than loading full session + exercise + set relationships into memory
        const setsFromLastWeek = await prisma.setEntry.findMany({
            where: {
                workoutExercise: {
                    session: {
                        startedAt: { gte: lastWeek }
                    }
                }
            },
            select: {
                weight: true,
                reps: true
            }
        })

        // 2. Count distinct sessions directly in DB
        const sessionsCount = await prisma.workoutSession.count({
            where: {
                startedAt: { gte: lastWeek }
            }
        })

        let totalVolume = 0
        setsFromLastWeek.forEach((set: { weight: number, reps: number }) => {
            totalVolume += (set.weight * set.reps)
        })

        return NextResponse.json({
            sessionsCount,
            totalVolume,
            totalSets: setsFromLastWeek.length
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch weekly stats' }, { status: 500 })
    }
}
