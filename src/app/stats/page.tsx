import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Flame, TrendingUp, Dumbbell, Zap } from 'lucide-react'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export const revalidate = 0

export default async function StatsPage() {
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twelveWeeksAgo = new Date(today.getTime() - 12 * 7 * 24 * 60 * 60 * 1000)

    const [setsFromLastWeek, sessionsCount, streakSessions, totalSessionsEver] = await Promise.all([
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
            where: { startedAt: { gte: lastWeek } }
        }),
        prisma.workoutSession.findMany({
            where: { startedAt: { gte: twelveWeeksAgo } },
            select: { startedAt: true },
            orderBy: { startedAt: 'desc' }
        }),
        prisma.workoutSession.count()
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
        if (hasSession) weeklyStreak++
        else break
    }

    let totalVolume = 0
    setsFromLastWeek.forEach((set: any) => {
        totalVolume += (set.weight * set.reps)
    })

    const volumeDisplay = totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}` : `${totalVolume}`
    const volumeUnit = totalVolume > 1000 ? 't' : 'kg'

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between border-b border-white/5">
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Statistiken</h1>
                <Link href="/settings">
                    <div className="h-9 w-9 rounded-full bg-secondary ring-1 ring-white/5 flex items-center justify-center text-muted-foreground hover:bg-secondary/80 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                </Link>
            </header>

            <div className="container mx-auto p-4 space-y-5 animate-in fade-in duration-300">
                {/* Hero Volume Card */}
                <Card className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent ring-1 ring-white/10 border-0 rounded-3xl overflow-hidden glow-primary">
                    <CardContent className="p-6 text-center">
                        <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-2">Wochen-Volumen</p>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-extrabold text-gradient tracking-tighter">{volumeDisplay}</span>
                            <span className="text-lg font-bold text-muted-foreground">{volumeUnit}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{setsFromLastWeek.length} Sätze in {sessionsCount} Einheiten</p>
                    </CardContent>
                </Card>

                {/* Stat Tiles */}
                <div className="grid grid-cols-3 gap-3">
                    <StatTile
                        icon={<Flame className="h-5 w-5" />}
                        value={weeklyStreak}
                        label="Streak"
                        color="text-orange-400"
                        bgColor="bg-orange-400/10"
                    />
                    <StatTile
                        icon={<Activity className="h-5 w-5" />}
                        value={sessionsCount}
                        label="Diese Woche"
                        color="text-primary"
                        bgColor="bg-primary/10"
                    />
                    <StatTile
                        icon={<Dumbbell className="h-5 w-5" />}
                        value={totalSessionsEver}
                        label="Gesamt"
                        color="text-emerald-400"
                        bgColor="bg-emerald-400/10"
                    />
                </div>

                {/* Weekly Bar Chart */}
                <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-foreground">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Wochenübersicht
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="h-44 flex items-end justify-between gap-2">
                            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, i) => {
                                // Check if there was a workout on this day
                                const dayDate = new Date(today)
                                const currentDayIndex = (today.getDay() + 6) % 7
                                dayDate.setDate(today.getDate() - (currentDayIndex - i))
                                dayDate.setHours(0, 0, 0, 0)

                                const hasWorkout = streakSessions.some(s => {
                                    const sDate = new Date(s.startedAt)
                                    sDate.setHours(0, 0, 0, 0)
                                    return sDate.getTime() === dayDate.getTime()
                                })

                                const isToday = i === currentDayIndex
                                const height = hasWorkout ? 70 + Math.random() * 25 : 8

                                return (
                                    <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                        <div
                                            className={`w-full rounded-lg transition-all duration-500 ${hasWorkout
                                                    ? isToday
                                                        ? 'bg-primary glow-primary'
                                                        : 'bg-primary/40 group-hover:bg-primary/60'
                                                    : 'bg-secondary/40'
                                                }`}
                                            style={{ height: `${height}%`, minHeight: '6px' }}
                                        />
                                        <span className={`text-[10px] font-bold ${isToday ? 'text-primary' : 'text-muted-foreground/60'}`}>
                                            {day}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Motivation Card */}
                <div className="bg-secondary/20 rounded-2xl p-4 flex gap-3 items-center border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[13px] font-semibold text-foreground">
                            {weeklyStreak > 0 ? `${weeklyStreak} Wochen am Stück!` : 'Starte deinen Streak!'}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                            {weeklyStreak >= 4 ? 'Unglaubliche Konsistenz. Du bist eine Maschine.' :
                                weeklyStreak >= 2 ? 'Dranbleiben! Die Gewohnheit formt sich.' :
                                    weeklyStreak >= 1 ? 'Guter Start. Nächste Woche wird\'s zum Streak!' :
                                        'Jede Reise beginnt mit dem ersten Schritt.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatTile({ icon, value, label, color, bgColor }: {
    icon: React.ReactNode; value: number; label: string; color: string; bgColor: string
}) {
    return (
        <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 text-card-foreground card-hover">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-1.5">
                <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">{value}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
            </CardContent>
        </Card>
    )
}
