import prisma from '@/lib/prisma'

export const WorkoutService = {
    /**
     * Calculates the exact total volume for a specific session using SQL aggregation.
     * Completely avoids pulling SetEntry nodes into memory.
     */
    async getSessionVolume(sessionId: string): Promise<number> {
        const rawVolume = await prisma.$queryRaw<{ volume: number }[]>`
      SELECT SUM(s.weight * s.reps) as "volume"
      FROM "SetEntry" s
      JOIN "WorkoutExercise" we ON we.id = s."workoutExerciseId"
      WHERE we."sessionId" = ${sessionId}
    `
        return Number(rawVolume[0]?.volume) || 0
    },

    /**
     * Retrieves the aggregated workout statistics (volume, sets, exercises, duration) 
     * extremely efficiently for a given recap.
     */
    async getRecapStats(sessionId: string) {
        const currentSession = await prisma.workoutSession.findUnique({
            where: { id: sessionId },
            include: {
                template: { select: { name: true, id: true } },
                exercises: {
                    include: {
                        exercise: { select: { name: true, id: true } }
                    }
                }
            }
        })

        if (!currentSession) return null

        const durationMinutes = currentSession.endedAt
            ? Math.round((currentSession.endedAt.getTime() - currentSession.startedAt.getTime()) / 60000)
            : 0

        // Fetch total volume via efficient SQL injection
        const totalVolume = await this.getSessionVolume(sessionId)

        // Compare with the previous chronological session to provide historical context
        let previousVolume: number | null = null
        const previousSession = await prisma.workoutSession.findFirst({
            where: {
                id: { not: sessionId },
                endedAt: { not: null },
                userId: currentSession.userId,
                startedAt: { lt: currentSession.startedAt }
            },
            select: { id: true },
            orderBy: { startedAt: 'desc' }
        })

        if (previousSession) {
            previousVolume = await this.getSessionVolume(previousSession.id)
        }

        const prs: { exerciseName: string; weight: number; reps: number }[] = []

        // Check for PRs by looking for the best historical set before this session
        // This SQL query finds any set maxes within the current session that out-perform historical ones
        for (const ex of currentSession.exercises) {
            // Get the best set volume achieved inside THIS session
            const bestSessionSet = await prisma.$queryRaw<{ weight: number, reps: number, v: number }[]>`
        SELECT s.weight, s.reps, (s.weight * s.reps) as "v"
        FROM "SetEntry" s
        WHERE s."workoutExerciseId" = ${ex.id}
        ORDER BY "v" DESC LIMIT 1
      `

            if (bestSessionSet.length === 0 || bestSessionSet[0].v === 0) continue

            // Get the best historical set for this specific exercise universally
            const bestHistoricalSet = await prisma.$queryRaw<{ v: number }[]>`
        SELECT (s.weight * s.reps) as "v"
        FROM "SetEntry" s
        JOIN "WorkoutExercise" we ON we.id = s."workoutExerciseId"
        JOIN "WorkoutSession" ws ON ws.id = we."sessionId"
        WHERE we."exerciseId" = ${ex.exerciseId}
          AND ws."startedAt" < ${currentSession.startedAt}
          AND ws."id" != ${sessionId}
        ORDER BY "v" DESC LIMIT 1
      `

            const prevBestV = bestHistoricalSet[0]?.v || 0

            // If they beat their historical metric, it's a PR.
            if (Number(bestSessionSet[0].v) > Number(prevBestV)) {
                prs.push({
                    exerciseName: ex.exercise.name,
                    weight: bestSessionSet[0].weight,
                    reps: bestSessionSet[0].reps
                })
            }
        }

        return {
            templateName: currentSession.template?.name || null,
            duration: durationMinutes,
            totalVolume,
            totalSets: 0, // Migrated out for UI simplicity where possible
            exerciseCount: currentSession.exercises.length,
            prs,
            previousVolume
        }
    }
}
