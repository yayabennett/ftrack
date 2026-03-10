import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { WeeklyStatsDTO, DayVolumeDTO } from '@/lib/types'
import { getCurrentUserId } from '@/lib/auth'
import { StatsService } from '@/lib/services/stats.service'

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

        const [sessionsCount, streakSessions, totalSessionsEver] = await Promise.all([
            prisma.workoutSession.count({ where: { startedAt: { gte: lastWeek }, ...userFilter } }),
            prisma.workoutSession.findMany({
                where: { startedAt: { gte: twelveWeeksAgo }, ...userFilter },
                select: { startedAt: true },
                orderBy: { startedAt: 'desc' }
            }),
            prisma.workoutSession.count({ where: userFilter })
        ])

        // Delegate volume and daily charting math to the Database via StatsService
        const volumeData = userId
            ? await StatsService.getDailyVolumeForDateRange(userId, validRange)
            : { totalVolume: 0, dailyData: [] }

        // Align the returned dailyData to the existing DayVolumeDTO format required by the frontend
        const days: DayVolumeDTO[] = volumeData.dailyData.map((d: any, i: number) => {
            const dateObj = new Date(d.date)
            // Figure out session count for this day from the streakSessions array
            const sessionCount = streakSessions.filter((s: any) => s.startedAt.toISOString().split('T')[0] === d.date).length
            return {
                date: d.date,
                label: DAY_LABELS[dateObj.getDay()],
                volume: d.volume,
                sessionCount
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

        const response: WeeklyStatsDTO & {
            weeklyStreak: number
            totalSessionsEver: number
        } = {
            sessionsCount,
            totalVolume: volumeData.totalVolume,
            totalSets: 0, // Migrated out of the payload requirements for the UI
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
