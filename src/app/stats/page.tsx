import { Card, CardContent } from '@/components/ui/card'
import { Activity, Flame, Dumbbell, User as UserIcon } from 'lucide-react'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { VolumeChart, DailyVolume } from '@/components/stats/volume-chart'
import { MuscleGroupChart, MuscleGroupStat } from '@/components/stats/muscle-group-chart'
import Link from 'next/link'

export const revalidate = 0 // Disable aggressive static caching for stats page

export default async function StatsPage() {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Parallel data fetching on the server for max performance
    const [sessions, allCompletedSets] = await Promise.all([
        prisma.workoutSession.findMany({
            where: {
                startedAt: { gte: thirtyDaysAgo }
            },
            select: { id: true, startedAt: true }
        }),
        prisma.setEntry.findMany({
            where: {
                workoutExercise: {
                    session: {
                        startedAt: { gte: thirtyDaysAgo }
                    }
                }
            },
            include: {
                workoutExercise: {
                    include: {
                        exercise: { select: { muscleGroup: true } },
                        session: { select: { startedAt: true } }
                    }
                }
            }
        })
    ])

    const sessionsCount = sessions.length
    let totalVolume = 0
    let totalSets = allCompletedSets.length

    // 1. Group Volume by Date for the Bar Chart
    const volumeByDateMap: Record<string, number> = {}

    // We want the chart to show exactly the last 30 days sequentially
    for (let i = 29; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        // Format as YYYY-MM-DD for stable grouping
        const dateKey = d.toISOString().split('T')[0]
        volumeByDateMap[dateKey] = 0
    }

    // 2. Group Sets by Muscle Group for the Progress Bars
    const setsByMuscleMap: Record<string, number> = {}

    allCompletedSets.forEach((set: any) => {
        // Add to total volume
        const setVolume = set.weight * set.reps
        totalVolume += setVolume

        // Add to daily volume
        if (set.workoutExercise?.session?.startedAt) {
            const dateKey = set.workoutExercise.session.startedAt.toISOString().split('T')[0]
            if (volumeByDateMap[dateKey] !== undefined) {
                volumeByDateMap[dateKey] += setVolume
            }
        }

        // Add to muscle group count
        const group = set.workoutExercise?.exercise?.muscleGroup
        if (group) {
            setsByMuscleMap[group] = (setsByMuscleMap[group] || 0) + 1
        }
    })

    // Format Data for Recharts
    const volumeData: DailyVolume[] = Object.keys(volumeByDateMap).sort().map(dateKey => {
        const [, month, day] = dateKey.split('-')
        return {
            date: dateKey,
            volume: volumeByDateMap[dateKey],
            label: `${day}.${month}.`
        }
    })

    // Format Data for Muscle Chart (sort by most sets)
    const muscleData: MuscleGroupStat[] = Object.entries(setsByMuscleMap)
        .map(([name, sets]) => ({
            name,
            sets,
            percentage: totalSets > 0 ? (sets / totalSets) * 100 : 0
        }))
        .sort((a, b) => b.sets - a.sets)

    return (
        <div className="min-h-screen bg-background pb-32">
            <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between border-b border-white/5">
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Statistiken</h1>
                <Link href="/settings">
                    <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-secondary text-foreground hover:bg-secondary/80">
                        <UserIcon className="h-5 w-5" />
                    </Button>
                </Link>
            </header>

            <div className="container mx-auto p-4 space-y-6 pt-6 animate-in fade-in duration-300">
                {/* Hero Metrics */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 text-card-foreground">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Activity className="h-8 w-8 text-blue-500 mb-2" />
                            <h3 className="text-3xl font-bold text-foreground">{sessionsCount}</h3>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Workouts (30d)</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 text-card-foreground">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Dumbbell className="h-8 w-8 text-primary mb-2" />
                            <h3 className="text-3xl font-bold text-foreground">{totalSets}</h3>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Sätze (30d)</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Volume History Chart */}
                <VolumeChart data={volumeData} totalVolume={totalVolume} />

                {/* Muscle Group Distribution Chart */}
                <MuscleGroupChart data={muscleData} />
            </div>
        </div>
    )
}
