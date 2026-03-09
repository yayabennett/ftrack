import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Barbell, CopySimple, Trophy, Target, Lightning, CaretRight, Info, Brain } from '@phosphor-icons/react/dist/ssr'
import prisma from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { getCurrentUserId } from '@/lib/auth'

export const revalidate = 0 // Ensure fresh data on every visit

export default async function Home() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const userId = await getCurrentUserId()

  // Fetch data for the Progress Hub — optimized with lean selects
  const [templates, recentSessions, weekSessions, user, recentMuscleGroups] = await Promise.all([
    prisma.template.findMany({
      include: { exercises: { select: { id: true } } },
      orderBy: { order: 'asc' },
    }),
    prisma.workoutSession.findMany({
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
    }),
    prisma.workoutSession.findMany({
      where: { startedAt: { gte: sevenDaysAgo } },
      select: { startedAt: true }
    }),
    userId ? prisma.user.findUnique({ where: { id: userId }, select: { name: true, experienceLevel: true, goal: true } }) : null,
    // Find recently trained muscle groups
    prisma.workoutExercise.findMany({
      where: { session: { startedAt: { gte: sevenDaysAgo } } },
      select: { exercise: { select: { muscleGroup: true } } },
      take: 50
    })
  ])

  const userName = user?.name || 'Champion'
  const trainedMuscles = [...new Set(recentMuscleGroups.map((e: { exercise: { muscleGroup: string | null } }) => e.exercise.muscleGroup).filter(Boolean))] as string[]
  const allMuscles = ['Brust', 'Rücken', 'Schultern', 'Beine', 'Arme', 'Core']
  const neglectedMuscles = allMuscles.filter(m => !trainedMuscles.some((t: string) => t.toLowerCase().includes(m.toLowerCase())))

  // 1. Weekly Consistency Logic
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const currentDayIndex = (now.getDay() + 6) % 7 // Adjust to start at Monday

  const weekActivity = days.map((day, index) => {
    // Check if there was a session on this specific day of the last 7
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

  // 2. Highlight Logic (e.g., Last Volume or PR)
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

  // Greetings logic
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'

  // Experience-based tip
  const tips: Record<string, string[]> = {
    beginner: [
      'Fokussiere dich auf saubere Technik – Gewicht kommt von alleine.',
      'Jede Trainingseinheit macht dich stärker. Konsistenz schlägt Perfektion.',
      'Vergiss nicht: Aufwärmsätze schützen dich vor Verletzungen.'
    ],
    intermediate: [
      'Versuche progressive Überladung: Jede Woche ein bisschen mehr.',
      'Schlaf und Ernährung sind genauso wichtig wie das Training selbst.',
      'Variiere dein Training alle 6-8 Wochen für neue Reize.'
    ],
    advanced: [
      'Periodisiere dein Training: Deload-Wochen sind kein Rückschritt.',
      'RPE-basiertes Training kann helfen, Plateaus zu durchbrechen.',
      'Die exzentrische Phase kontrolliert ausführen = mehr Muskelspannung.'
    ]
  }
  const userTips = tips[user?.experienceLevel ?? 'beginner'] ?? tips.beginner
  const todayTip = userTips[now.getDate() % userTips.length]

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header / Brand */}
      <header className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-60 mb-1">{greeting}</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Hi, {userName}<span className="text-primary">.</span>
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-secondary ring-1 ring-white/5 flex items-center justify-center overflow-hidden">
          <UserIcon />
        </div>
      </header>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Hub: Consistency Section */}
        <section className="px-5">
          <div className="bg-card/40 ring-1 ring-white/5 rounded-3xl p-5 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[13px] font-bold tracking-widest text-muted-foreground uppercase">Wochen-Aktivität</h2>
              <span className="text-[11px] font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                Streak: {weekSessions.length} Einheiten
              </span>
            </div>
            <div className="flex justify-between items-end gap-1 px-1">
              {weekActivity.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
                    d.hasWorkout ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-secondary/50 text-muted-foreground",
                    d.isToday && !d.hasWorkout && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
                  )}>
                    {d.hasWorkout ? <Lightning className="w-4 h-4 fill-current" /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold tracking-tighter uppercase",
                    d.isToday ? "text-primary" : "text-muted-foreground/60"
                  )}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hub: Highlight – subtle inline */}
        <section className="px-5">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {highlightIcon}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{highlightText}</p>
              <p className="text-[11px] text-muted-foreground/70 truncate">{highlightSub}</p>
            </div>
          </div>
        </section>

        {/* Hub: Quick Start Carousel */}
        <section className="space-y-4">
          <div className="px-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CopySimple className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Einheiten</h2>
            </div>
            <Link href="/templates" className="text-[11px] font-bold text-primary hover:underline underline-offset-4">ALLE ANSEHEN</Link>
          </div>

          <div className="flex gap-4 overflow-x-auto px-5 pb-2 no-scrollbar scroll-smooth">
            {templates.length === 0 ? (
              <Card className="min-w-[240px] glass-panel rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2">
                <Plus className="w-6 h-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium">Noch keine Einheiten</p>
              </Card>
            ) : templates.map((template: { id: string; name: string; exercises: { id: string }[] }) => (
              <Link key={template.id} href={`/workout/active?templateId=${template.id}`} className="min-w-[170px] active:scale-95 transition-transform">
                <Card className="bg-card ring-1 ring-white/5 shadow-sm border-0 rounded-2xl overflow-hidden h-full card-hover">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="font-bold text-[15px] mb-1 truncate">{template.name}</h3>
                      <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">{template.exercises.length} Übungen</p>
                    </div>
                    <div className="mt-4 flex items-center text-[11px] font-bold text-primary gap-1">
                      START <CaretRight className="w-3 h-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Hub: Last Session Recap */}
        <section className="px-5 space-y-4">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase px-1">Letzte Einheit</h2>
          {lastSession ? (
            <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground card-hover">
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

        {/* Daily Tip / Fact */}
        {/* Smart Workout Suggestion */}
        {neglectedMuscles.length > 0 && (
          <section className="px-5">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-4 flex gap-3 items-center border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground">Trainingsvorschlag</p>
                <p className="text-[12px] text-muted-foreground">
                  <span className="font-bold text-primary">{neglectedMuscles.slice(0, 2).join(' & ')}</span> {neglectedMuscles.length > 2 ? `(+${neglectedMuscles.length - 2})` : ''} wurde diese Woche noch nicht trainiert.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Personalized Daily Tip */}
        <section className="px-5">
          <div className="bg-secondary/20 rounded-2xl p-4 flex gap-3 items-start border border-white/5">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-[13px] text-muted-foreground leading-relaxed italic">
              {todayTip}
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  )
}

function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"></path>
      <path d="M12 5v14"></path>
    </svg>
  )
}
