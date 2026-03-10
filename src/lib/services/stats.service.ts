import prisma from '@/lib/prisma'
import { subDays, startOfDay, endOfDay, format } from 'date-fns'

export const StatsService = {
    /**
     * Calculates the total volume lifted per day over a given number of days.
     * Utilizes database grouping rather than pulling all sets into node memory.
     */
    async getDailyVolumeForDateRange(userId: string, daysBack: number = 7) {
        const today = endOfDay(new Date())
        const startDate = startOfDay(subDays(today, daysBack - 1))

        // Group sets by their creation date using Prisma's groupBy + raw query if necessary
        // Because Prisma's groupBy doesn't magically multiply columns (weight * reps),
        // we use a safe queryRaw for aggregation logic to drop the massive memory footprint.

        const rawAggregations = await prisma.$queryRaw<{ day: Date; dailyVolume: number }[]>`
      SELECT 
        DATE_TRUNC('day', s."createdAt") as "day",
        SUM(s.weight * s.reps) as "dailyVolume" -- Precalculate volume at the DB layer!
      FROM "SetEntry" s
      JOIN "WorkoutExercise" we ON we.id = s."workoutExerciseId"
      JOIN "WorkoutSession" ws ON ws.id = we."sessionId"
      WHERE ws."userId" = ${userId}
        AND s."createdAt" >= ${startDate}
        AND s."createdAt" <= ${today}
      GROUP BY DATE_TRUNC('day', s."createdAt")
      ORDER BY "day" ASC
    `

        // Map raw DB results quickly into the daily structure expected by the frontend UI
        const resultsMap = new Map<string, number>()

        // Fill the map with actual DB results
        for (const row of rawAggregations) {
            if (!row.day) continue;
            const dayKey = format(new Date(row.day), 'yyyy-MM-dd')
            resultsMap.set(dayKey, Number(row.dailyVolume) || 0)
        }

        // Initialize all days in the requested range to 0 (to ensure charts render completely)
        const finalData = []
        let totalWeeklyVolume = 0

        for (let i = daysBack - 1; i >= 0; i--) {
            const currentDay = subDays(today, i)
            const dayKey = format(currentDay, 'yyyy-MM-dd')
            const volume = resultsMap.get(dayKey) || 0

            totalWeeklyVolume += volume
            finalData.push({
                date: dayKey,
                dayName: format(currentDay, 'EEE'), // e.g., "Mon", "Tue"
                volume: volume
            })
        }

        return {
            totalVolume: totalWeeklyVolume,
            dailyData: finalData
        }
    }
}
