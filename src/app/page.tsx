import { Suspense } from 'react'
import { getCurrentUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { WeeklyConsistency } from '@/components/dashboard/weekly-consistency'
import { TemplateCarousel } from '@/components/dashboard/template-carousel'
import { LastSessionRecap } from '@/components/dashboard/last-session-card'
import { Skeleton } from '@/components/ui/skeleton'

export default async function Home() {
  const userId = await getCurrentUserId()
  const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { name: true } }) : null
  const userName = user?.name || 'Viper' // Cool default placeholder for athletes

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-muted-foreground gap-4">
        <p className="font-bold tracking-widest uppercase text-xs">Bitte einloggen</p>
      </div>
    )
  }

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

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-2">
        <Suspense fallback={<DashboardSkeleton />}>
          <WeeklyConsistency userId={userId} />
        </Suspense>

        <Suspense fallback={<DashboardSkeleton height="h-32" />}>
          <TemplateCarousel userId={userId} />
        </Suspense>

        <Suspense fallback={<DashboardSkeleton height="h-24" />}>
          <LastSessionRecap userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}

function DashboardSkeleton({ height = "h-40" }: { height?: string }) {
  return (
    <div className="px-5">
      <Skeleton className={`w-full ${height} rounded-3xl bg-secondary/50`} />
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
