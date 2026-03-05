import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dumbbell, Plus, Copy } from 'lucide-react'
import prisma from '@/lib/prisma'

// This is now a React Server Component (RSC)
// It fetches data natively on the server, avoiding client-side loading spinners.
export default async function Home() {
  const templates = await prisma.template.findMany({
    include: { exercises: true },
    orderBy: { order: 'asc' },
    take: 2
  })

  const recentSessions = await prisma.workoutSession.findMany({
    orderBy: { startedAt: 'desc' },
    take: 2,
    include: {
      template: true,
      exercises: {
        include: { sets: true }
      }
    }
  })

  // Calculate volume for recent sessions on the server
  const formattedSessions = recentSessions.map((session: any) => {
    let volume = 0
    session.exercises.forEach((ex: any) => {
      ex.sets.forEach((set: any) => { volume += (set.weight * set.reps) })
    })

    // Quick duration calculation
    const durationMin = session.endedAt
      ? Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 60000)
      : null

    return { ...session, volume, durationMin }
  })

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between border-b border-white/5">
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">
          Tracker<span className="text-primary">.</span>
        </h1>
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors cursor-pointer text-foreground">
          <UserIcon />
        </div>
      </header>

      <div className="container mx-auto p-4 pt-6 space-y-8 animate-in fade-in duration-300">
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Copy className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Vorlagen</h2>
          </div>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground px-1">Keine Vorlagen gefunden.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template: any) => (
                <Card key={template.id} className="bg-card ring-1 ring-white/5 shadow-sm hover:scale-[0.98] hover:bg-secondary transition-all cursor-pointer rounded-2xl border-0 overflow-hidden text-card-foreground">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-[15px] font-semibold">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground font-medium truncate">{template.exercises.length} Übungen</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase px-1">Letzte Einheiten</h2>
          <div className="space-y-3">
            {formattedSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground px-1">Noch keine Einheiten absolviert.</p>
            ) : formattedSessions.map((session: any) => (
              <Card key={session.id} className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden active:scale-[0.99] transition-transform cursor-pointer text-card-foreground">
                <CardContent className="p-4 flex gap-4 items-center">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[15px] truncate">
                      {session.template ? session.template.name : "Freies Training"}
                    </h3>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      {new Intl.DateTimeFormat('de-DE', { dateStyle: 'short' }).format(session.startedAt)}
                      {session.durationMin ? ` • ${session.durationMin}m` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-foreground tracking-tight">{(session.volume / 1000).toFixed(1)}k</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Volumen (kg)</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  )
}
