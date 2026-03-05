import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const today = new Date()
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

        const sessions = await prisma.workoutSession.findMany({
            where: {
                startedAt: { gte: lastWeek }
            },
            include: {
                exercises: {
                    include: {
                        sets: true
                    }
                }
            }
        })

        let totalVolume = 0
        let totalSets = 0

        sessions.forEach(session => {
            session.exercises.forEach(ex => {
                ex.sets.forEach(set => {
                    totalVolume += (set.weight * set.reps)
                    totalSets += 1
                })
            })
        })

        return NextResponse.json({
            sessionsCount: sessions.length,
            totalVolume,
            totalSets
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch weekly stats' }, { status: 500 })
    }
}
