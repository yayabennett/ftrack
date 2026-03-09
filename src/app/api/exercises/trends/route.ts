import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET() {
    try {
        const userId = await getCurrentUserId()

        // Fetch all exercises the user has access to
        const exercises = await prisma.exercise.findMany({
            where: {
                OR: [
                    { isCustom: false },
                    { userId },
                ]
            },
            select: { id: true }
        })

        const exerciseIds = exercises.map((e: { id: string }) => e.id)

        // Fetch recent history for ALL these exercises in one go
        const recentSessions = await prisma.workoutSession.findMany({
            where: {
                userId: userId || undefined, // Only their sessions if logged in
                endedAt: { not: null },
                exercises: {
                    some: {
                        exerciseId: { in: exerciseIds }
                    }
                }
            },
            orderBy: { startedAt: 'desc' },
            take: 50, // Limit to recent sessions for performance, this should cover the last 4 times an exercise was done for most users
            include: {
                exercises: {
                    where: { exerciseId: { in: exerciseIds } },
                    include: {
                        sets: true
                    }
                }
            }
        })

        // Group by exerciseId
        const historyByExercise: Record<string, { date: Date, e1RM: number }[]> = {}

        for (const session of recentSessions) {
            for (const wex of session.exercises) {
                if (wex.sets.length === 0) continue

                // Calculate e1RM for this session's exercise
                const maxE1rm = Math.max(
                    ...wex.sets.map((s: { weight: number, reps: number }) => s.weight * (1 + s.reps / 30)),
                    0
                )

                if (!historyByExercise[wex.exerciseId]) {
                    historyByExercise[wex.exerciseId] = []
                }

                historyByExercise[wex.exerciseId].push({
                    date: session.startedAt,
                    e1RM: Math.round(maxE1rm)
                })
            }
        }

        // Calculate trends and sparkline data
        const trends: Record<string, { trend: 'up' | 'down' | 'flat' | null, history: number[] }> = {}

        for (const [exerciseId, history] of Object.entries(historyByExercise)) {
            // we already ordered by startedAt desc in the DB query, so history is newest first
            const recentHistory = history.slice(0, 5) // Last 5 sessions for sparkline
            const e1rms = recentHistory.map(h => h.e1RM)

            let trend: 'up' | 'down' | 'flat' | null = null

            if (e1rms.length >= 2) {
                const latest = e1rms[0]
                const prevAvg = e1rms.slice(1).reduce((a, b) => a + b, 0) / (e1rms.length - 1)
                const diff = ((latest - prevAvg) / prevAvg) * 100

                trend = diff > 2 ? 'up' : diff < -2 ? 'down' : 'flat'
            }

            // Reverse for sparkline so it reads left (oldest) to right (newest)
            trends[exerciseId] = {
                trend,
                history: [...e1rms].reverse()
            }
        }

        return NextResponse.json(trends)
    } catch (error) {
        console.error('Failed to fetch trends:', error)
        return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 })
    }
}
