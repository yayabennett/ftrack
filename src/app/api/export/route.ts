import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET() {
    try {
        const userId = await getCurrentUserId()
        const sessions = await prisma.workoutSession.findMany({
            where: userId ? { userId } : {},
            include: {
                template: { select: { name: true } },
                exercises: {
                    include: {
                        exercise: { select: { name: true, muscleGroup: true } },
                        sets: true
                    }
                }
            },
            orderBy: { startedAt: 'desc' }
        })

        const exportData = {
            exportedAt: new Date().toISOString(),
            totalSessions: sessions.length,
            sessions: sessions.map((s: { id: string; startedAt: Date; endedAt: Date | null; template: { name: string } | null; notes: string | null; exercises: { exercise: { name: string; muscleGroup: string | null }; sets: { setIndex: number; weight: number; reps: number; rpe: number | null; isWarmup: boolean }[] }[] }) => ({
                id: s.id,
                startedAt: s.startedAt,
                endedAt: s.endedAt,
                template: s.template?.name || null,
                notes: s.notes,
                exercises: s.exercises.map((ex) => ({
                    name: ex.exercise.name,
                    muscleGroup: ex.exercise.muscleGroup,
                    sets: ex.sets.map((set) => ({
                        setIndex: set.setIndex,
                        weight: set.weight,
                        reps: set.reps,
                        rpe: set.rpe,
                        isWarmup: set.isWarmup
                    }))
                }))
            }))
        }

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="ftrack-export-${new Date().toISOString().split('T')[0]}.json"`
            }
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
    }
}
