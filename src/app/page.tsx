import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dumbbell, Plus } from 'lucide-react'

export default function Home() {
  return (
    <div className="container mx-auto p-4 space-y-8 animate-in fade-in duration-300">
      <header className="flex items-center justify-between pt-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Tracker<span className="text-primary">.</span>
        </h1>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
          <UserIcon />
        </div>
      </header>

      <section>
        <Link href="/workout/active" className="block w-full">
          <Button size="lg" className="w-full h-14 text-[17px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm transition-transform active:scale-95">
            <Plus className="mr-2 h-5 w-5" /> Training starten
          </Button>
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Vorlagen</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-surface border-border hover:bg-surface-2 transition-colors cursor-pointer rounded-xl">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-[15px] font-semibold">Push Day</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-muted-foreground font-medium">5 Übungen</p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-border hover:bg-surface-2 transition-colors cursor-pointer rounded-xl">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-[15px] font-semibold">Pull Day</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-muted-foreground font-medium">4 Übungen</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Letzte Einheiten</h2>
        <div className="space-y-3">
          <Card className="bg-surface border-border rounded-xl">
            <CardContent className="p-4 flex gap-4 items-center">
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[15px]">Leg Day</h3>
                <p className="text-[13px] text-muted-foreground mt-0.5">Gestern • 1h 15m</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[15px] text-foreground">8.5k</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Vol (kg)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border rounded-xl">
            <CardContent className="p-4 flex gap-4 items-center">
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[15px]">Oberkörper</h3>
                <p className="text-[13px] text-muted-foreground mt-0.5">Vorgestern • 55m</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[15px] text-foreground">5.2k</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Vol (kg)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  )
}
