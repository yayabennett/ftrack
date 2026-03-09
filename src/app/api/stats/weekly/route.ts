import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { WeeklyStatsDTO, DayVolumeDTO } from '@/lib/types'
import { getCurrentUserId } from '@/lib/auth'

const DAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] // Maps JS getDay() (0=Sun)

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const rangeDays = parseInt(searchParams.get('range') ?? '7', 10)
        const validRange = [7, 30, 90].includes(rangeDays) ? rangeDays : 7

        const today = new Date()
        const lastWeek = new Date(today.getTime() - validRange * 24 * 60 * 60 * 1000)
        const twelveWeeksAgo = new Date(today.getTime() - 12 * 7 * 24 * 60 * 60 * 1000)
        const userId = await getCurrentUserId()
        const userFilter = userId ? { userId } : {}

        const [setsFromLastWeek, sessionsCount, streakSessions, totalSessionsEver] = await Promise.all([
            // All sets from the last 7 days, with their session's startedAt for day grouping
            prisma.setEntry.findMany({
                where: {
                    workoutExercise: {
                        session: { startedAt: { gte: lastWeek }, ...userFilter }
                    }
                },
                select: {
                    weight: true,
                    reps: true,
                    workoutExercise: {
                        select: {
                            session: { select: { startedAt: true } }
                        }
                    }
                }
            }),
            prisma.workoutSession.count({ where: { startedAt: { gte: lastWeek }, ...userFilter } }),
            prisma.workoutSession.findMany({
                where: { startedAt: { gte: twelveWeeksAgo }, ...userFilter },
                select: { startedAt: true },
                orderBy: { startedAt: 'desc' }
            }),
            prisma.workoutSession.count({ where: userFilter })
        ])

        // ─── Per-day volume (current Mon→Sun week) ───────────────────────────
        // Build a map: "YYYY-MM-DD" → { volume, sessionCount }
        const dayMap = new Map<string, { volume: number; sessionCount: number }>()

        for (const set of setsFromLastWeek) {
            const sessionDate = set.workoutExercise.session.startedAt
            const key = sessionDate.toISOString().split('T')[0]
            const entry = dayMap.get(key) ?? { volume: 0, sessionCount: 0 }
            entry.volume += set.weight * set.reps
            dayMap.set(key, entry)
        }

        // Mark session counts per day (from the streakSessions which span 12 weeks)
        for (const s of streakSessions) {
            const d = new Date(s.startedAt)
            const key = d.toISOString().split('T')[0]
            const existing = dayMap.get(key)
            if (existing) {
                existing.sessionCount = (existing.sessionCount ?? 0) + 1
            }
        }

        // Build Monday-anchored 7-day window for current week
        const currentDayOfWeek = today.getDay() // 0=Sun, 1=Mon ... 6=Sat
        const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek
        const monday = new Date(today)
        monday.setDate(today.getDate() + mondayOffset)
        monday.setHours(0, 0, 0, 0)

        const days: DayVolumeDTO[] = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(monday)
            day.setDate(monday.getDate() + i)
            const key = day.toISOString().split('T')[0]
            const data = dayMap.get(key)
            return {
                date: key,
                label: DAY_LABELS[day.getDay()],
                volume: data?.volume ?? 0,
                sessionCount: data?.sessionCount ?? 0,
            }
        })

        // ─── Weekly streak (consecutive weeks with at least 1 session) ───────
        let weeklyStreak = 0
        for (let i = 0; i < 12; i++) {
            const weekStart = new Date(today.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
            const weekEnd = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000)
            const hasSession = streakSessions.some((s: { startedAt: Date }) => {
                const d = new Date(s.startedAt)
                return d >= weekStart && d < weekEnd
            })
            if (hasSession) weeklyStreak++
            else break
        }

        let totalVolume = 0
        setsFromLastWeek.forEach((set: { weight: number; reps: number; workoutExercise: { session: { startedAt: Date } } }) => { totalVolume += set.weight * set.reps })

        const response: WeeklyStatsDTO & {
            weeklyStreak: number
            totalSessionsEver: number
        } = {
            sessionsCount,
            totalVolume,
            totalSets: setsFromLastWeek.length,
            days,
            weeklyStreak,
            totalSessionsEver,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch weekly stats' }, { status: 500 })
    }
}
