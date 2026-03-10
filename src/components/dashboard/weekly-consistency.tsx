import prisma from '@/lib/prisma'
import { Lightning } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'

export async function WeeklyConsistency({ userId }: { userId: string }) {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const weekSessions = await prisma.workoutSession.findMany({
        where: { userId, startedAt: { gte: sevenDaysAgo } },
        select: { startedAt: true }
    })

    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    const currentDayIndex = (now.getDay() + 6) % 7 // Adjust to start at Monday

    const weekActivity = days.map((day, index) => {
        const dayDate = new Date(now)
        dayDate.setDate(now.getDate() - (currentDayIndex - index))
        dayDate.setHours(0, 0, 0, 0)

        const hasWorkout = weekSessions.some((s: { startedAt: Date }) => {
            const sDate = new Date(s.startedAt)
            sDate.setHours(0, 0, 0, 0)
            return sDate.getTime() === dayDate.getTime()
        })

        return { day, hasWorkout, isToday: index === currentDayIndex }
    })

    return (
        <section className="px-5">
            <div className="bg-card border border-border/40 rounded-[1.25rem] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Aktivität</h2>
                    <span className="text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded-full">
                        Streak: {weekSessions.length}
                    </span>
                </div>
                <div className="flex justify-between items-end gap-1 px-1">
                    {weekActivity.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                d.hasWorkout ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground",
                                d.isToday && !d.hasWorkout && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
                            )}>
                                {d.hasWorkout ? <Lightning className="w-4 h-4 fill-current" /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />}
                            </div>
                            <span className={cn(
                                "text-xs font-bold tracking-tighter uppercase",
                                d.isToday ? "text-primary" : "text-muted-foreground/60"
                            )}>{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
