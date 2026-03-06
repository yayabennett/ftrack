import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Flame, TrendingUp, User } from 'lucide-react'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'

export const revalidate = 0 // Disable aggressive static caching for stats page

export default async function StatsPage() {
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch streak data: last 12 weeks of sessions for streak calculation
    const twelveWeeksAgo = new Date(today.getTime() - 12 * 7 * 24 * 60 * 60 * 1000)

    // Parallel data fetching on the server for max performance
    const [setsFromLastWeek, sessionsCount, streakSessions] = await Promise.all([
        prisma.setEntry.findMany({
            where: {
                workoutExercise: {
                    session: {
                        startedAt: { gte: lastWeek }
                    }
                }
            },
            select: { weight: true, reps: true }
        }),
        prisma.workoutSession.count({
            where: {
                startedAt: { gte: lastWeek }
            }
        }),
        prisma.workoutSession.findMany({
            where: { startedAt: { gte: twelveWeeksAgo } },
            select: { startedAt: true },
            orderBy: { startedAt: 'desc' }
        })
    ])

    // Compute real weekly streak
    let weeklyStreak = 0
    for (let i = 0; i < 12; i++) {
        const weekStart = new Date(today.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
        const weekEnd = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000)
        const hasSession = streakSessions.some(s => {
            const d = new Date(s.startedAt)
            return d >= weekStart && d < weekEnd
        })
        if (hasSession) {
            weeklyStreak++
        } else {
            break
        }
    }

    let totalVolume = 0
    setsFromLastWeek.forEach((set: any) => {
        totalVolume += (set.weight * set.reps)
    })

    const volumeText = totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between border-b border-white/5">
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Statistiken</h1>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-secondary text-foreground hover:bg-secondary/80">
                    <User className="h-5 w-5" />
                </Button>
            </header>

            <div className="container mx-auto p-4 space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 text-card-foreground">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Flame className="h-8 w-8 text-blue-500 mb-2" />
                            <h3 className="text-3xl font-bold text-foreground">{weeklyStreak}</h3>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Wochen-Streak</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 hover:bg-secondary transition-colors text-card-foreground">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Activity className="h-8 w-8 text-primary mb-2" />
                            <h3 className="text-3xl font-bold text-foreground">{sessionsCount}</h3>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Einheiten</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-foreground">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Wochen-Volumen (kg)
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Diese Woche lief stark: {volumeText} bewegt.</p>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="h-48 flex items-end justify-between gap-2 pt-4">
                            {/* Fake Chart Bars for MVP, but real data up top */}
                            {[40, 65, 30, 80, 50, 90, 60].map((height, i) => (
                                <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer relative">
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-secondary ring-1 ring-white/10 text-[11px] text-foreground py-1 px-2 rounded-md font-medium transition-opacity pointer-events-none shadow-sm">
                                        {height * 100}
                                    </div>
                                    <div
                                        className={`w-full transition-all duration-300 rounded-t-[4px] ${i === 5 ? 'bg-primary' : 'bg-primary/20 group-hover:bg-primary/40'
                                            }`}
                                        style={{ height: `${height}%` }}
                                    />
                                    <span className={`text-[11px] font-semibold ${i === 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {['M', 'D', 'M', 'D', 'F', 'S', 'S'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
