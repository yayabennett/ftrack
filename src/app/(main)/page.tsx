import { Suspense } from 'react'
import Link from 'next/link'
import { getCurrentUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { WeeklyConsistency } from '@/components/dashboard/weekly-consistency'
import { TemplateCarousel } from '@/components/dashboard/template-carousel'
import { LastSessionRecap } from '@/components/dashboard/last-session-card'
import { Skeleton } from '@/components/ui/skeleton'
import { redirect } from 'next/navigation'
import { UserAvatar } from '@/components/ui/user-avatar'

export default async function Home() {
  const userId = await getCurrentUserId()
  const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, isOnboarded: true, image: true } }) : null
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
          <h1 className="text-[42px] leading-tight font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 mb-1">
            Heute
          </h1>
          <p className="text-sm font-bold text-muted-foreground/80 tracking-wide">
            Hi {userName}, {greeting}
          </p>
        </div>
        <Link href="/settings" className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-secondary ring-1 ring-white/10 flex items-center justify-center overflow-hidden active:scale-95 transition-transform cursor-pointer shadow-sm">
            <UserAvatar seed={user?.id || 'default'} style={(user?.image as any) || 'initials'} className="w-10 h-10" />
          </div>
        </Link>
      </header>

      <div className="space-y-8 mt-2 pb-8">
        <div className="px-5 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
          <Link href="/workout/start" className="w-full flex items-center justify-between p-4 rounded-[28px] bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_32px_rgba(0,226,170,0.35)] ring-1 ring-primary/50 active:scale-[0.96] transition-all duration-300 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <span className="text-[16px] relative z-10 drop-shadow-sm ml-2">Workout Starten</span>
            <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center relative z-10 group-hover:rotate-45 transition-transform duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="translate-x-[1px]">
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

