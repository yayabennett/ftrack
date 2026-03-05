import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dumbbell, Plus } from 'lucide-react'

export default function Home() {
  return (
    <div className="container mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between pt-4">
        <h1 className="text-3xl font-extrabold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(132,204,22,0.4)]">
          <span className="text-primary">Track</span>er.
        </h1>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <UserIcon />
        </div>
      </header>

      <section>
        <Link href="/workout/active" className="block w-full">
          <Button size="lg" className="w-full py-8 text-lg font-bold action-glow rounded-2xl shadow-xl transition-transform active:scale-95">
            <Plus className="mr-2 h-6 w-6" /> Start Empty Workout
          </Button>
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Quick Templates</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/60 transition-colors">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Push Day</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground font-medium">Chest, Shoulders</p>
            </CardContent>
          </Card>
          <Card className="bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/60 transition-colors">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Pull Day</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground font-medium">Back, Biceps</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Workouts</h2>
        <div className="space-y-3">
          <Card className="bg-card/30 backdrop-blur-sm border-border/40">
            <CardContent className="p-4 flex gap-4 items-center">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Leg Day</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Yesterday • 1h 15m</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">8.5k</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vol (kg)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border-border/40">
            <CardContent className="p-4 flex gap-4 items-center">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Upper Body</h3>
                <p className="text-xs text-muted-foreground mt-0.5">3 days ago • 55m</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">5.2k</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vol (kg)</p>
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  )
}
