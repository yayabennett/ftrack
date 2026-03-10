import { Suspense } from 'react'
import Link from 'next/link'
import { getCurrentUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { WeeklyConsistency } from '@/components/dashboard/weekly-consistency'
import { TemplateCarousel } from '@/components/dashboard/template-carousel'
import { LastSessionRecap } from '@/components/dashboard/last-session-card'
import { Skeleton } from '@/components/ui/skeleton'
import { redirect } from 'next/navigation'

export default async function Home() {
  const userId = await getCurrentUserId()
  const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { name: true, isOnboarded: true } }) : null
  const userName = user?.name || 'Viper' // Cool default placeholder for athletes

  if (userId && user && !user.isOnboarded) {
    redirect('/onboarding')
  }

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
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1">
            Heute
          </h1>
          <p className="text-sm font-semibold text-muted-foreground">
            Hi {userName}, {greeting}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-secondary ring-1 ring-white/5 flex items-center justify-center overflow-hidden">
          <UserIcon />
        </div>
      </header>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-2">
        <div className="px-5">
          <Link href="/workout/start" className="w-full flex items-center justify-between p-4 rounded-3xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-[0_4px_24px_rgba(0,226,170,0.25)] active:scale-[0.98] transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-white/10 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="text-[15px] relative z-10">Workout Starten</span>
            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center relative z-10 group-hover:rotate-90 transition-transform duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
          </Link>
        </div>
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
