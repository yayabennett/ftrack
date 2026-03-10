import prisma from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Barbell, Lightning, Trophy, Target } from '@phosphor-icons/react/dist/ssr'

export async function LastSessionRecap({ userId }: { userId: string }) {
    const recentSessions = await prisma.workoutSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 2,
        include: {
            template: { select: { name: true } },
            exercises: {
                include: {
                    sets: { select: { weight: true, reps: true } }
                }
            }
        }
    })

    const lastSession = recentSessions[0]
    const prevSession = recentSessions[1]

    let highlightText = "Bereit für das nächste Level?"
    let highlightSub = "Starte heute deine erste Einheit."
    let highlightIcon = <Lightning className="w-5 h-5" />

    if (lastSession) {
        const calculateVolume = (s: { exercises: { sets: { weight: number; reps: number }[] }[] }) =>
            s.exercises.reduce((acc, ex) =>
                acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0), 0)

        const lastVol = calculateVolume(lastSession)

        if (prevSession) {
            const prevVol = calculateVolume(prevSession)
            const diff = lastVol - prevVol
            if (diff > 0) {
                highlightText = `Volumen +${(diff / 1000).toFixed(1)}k kg`
                highlightSub = "Du wirst stärker! Letzte Einheit war ein Peak."
                highlightIcon = <Trophy className="w-5 h-5" />
            } else {
                highlightText = "Konsistenz ist King"
                highlightSub = "Du bleibst am Ball. Dranbleiben!"
                highlightIcon = <Target className="w-5 h-5" />
            }
        } else {
            highlightText = "Erster Meilenstein!"
            highlightSub = "Deine letzte Einheit war der Anfang."
            highlightIcon = <Lightning className="w-5 h-5" />
        }
    }

    return (
        <>
            {/* Hub: Last Session Recap */}
            <section className="px-5 space-y-4">
                <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase px-1">Letzte Einheit</h2>
                {lastSession ? (
                    <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                        <CardContent className="p-4 flex gap-4 items-center">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <Barbell className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[16px] truncate">
                                    {lastSession.template ? lastSession.template.name : "Freies Training"}
                                </h3>
                                <p className="text-[13px] text-muted-foreground font-medium">
                                    {new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short' }).format(lastSession.startedAt)}
                                    {" • "}
                                    {lastSession.endedAt ? `${Math.round((lastSession.endedAt.getTime() - lastSession.startedAt.getTime()) / 60000)}m` : 'Laufend'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-2xl text-foreground tracking-tighter">
                                    {(lastSession.exercises.reduce((v: number, ex: { sets: { weight: number; reps: number }[] }) => v + ex.sets.reduce((sv: number, s: { weight: number; reps: number }) => sv + (s.weight * s.reps), 0), 0) / 1000).toFixed(1)}k
                                </p>
                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-extrabold opacity-70">Volumen</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <p className="text-sm text-muted-foreground italic px-1">Fange jetzt an, deine Geschichte zu schreiben.</p>
                )}
            </section>
        </>
    )
}
