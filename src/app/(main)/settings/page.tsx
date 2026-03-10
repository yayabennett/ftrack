import { Card, CardContent } from '@/components/ui/card'
import { User, DownloadSimple, Moon, Info, CaretRight, DeviceMobile, Ruler, Target, Barbell } from '@phosphor-icons/react/dist/ssr'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { getCurrentUserId } from '@/lib/auth'
import { StatTile } from '@/components/ui/stat-tile'
import { UserAvatar } from '@/components/ui/user-avatar'
import { AvatarSelector } from '@/components/ui/avatar-selector'
import { SettingsToggle } from './settings-toggle'

export const revalidate = 0

const GOAL_LABELS: Record<string, string> = {
    muscle_gain: '💪 Muskelaufbau',
    fat_loss: '🔥 Fettabbau',
    strength: '🏋️ Kraft steigern',
    general_fitness: '⚡ Allgemeine Fitness',
}

const EXPERIENCE_LABELS: Record<string, string> = {
    beginner: '🌱 Anfänger',
    intermediate: '💎 Fortgeschritten',
    advanced: '👑 Profi',
}

export default async function SettingsPage() {
    const userId = await getCurrentUserId()

    const [user, totalSessions, totalExercises] = await Promise.all([
        userId ? prisma.user.findUnique({ where: { id: userId } }) : null,
        prisma.workoutSession.count(userId ? { where: { userId } } : undefined),
        prisma.exercise.count({ where: { isCustom: true, ...(userId ? { userId } : {}) } })
    ])

    const userName = user?.name || 'Athlet'

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-40 h-14 bg-background/60 backdrop-blur-[32px] px-4 flex items-center border-b border-white/5">
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Profil</h1>
            </header>

            <div className="container mx-auto p-4 space-y-6 animate-in fade-in duration-300 mt-2">
                {/* Profile Card */}
                <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent ring-1 ring-white/10 border-0 rounded-3xl overflow-hidden">
                    <CardContent className="p-5 flex items-center gap-4">
                        <UserAvatar
                            seed={user?.id || 'default'}
                            style={(user?.image as any) || 'initials'}
                            className="w-16 h-16"
                        />
                        <div className="flex-1">
                            <h2 className="font-extrabold text-xl text-foreground tracking-tight">{userName}</h2>
                            <p className="text-sm text-muted-foreground">
                                {totalSessions} Einheiten · {totalExercises} eigene Übungen
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Avatar Settings */}
                {user && (
                    <AvatarSelector userId={user.id} currentStyle={user.image || 'initials'} />
                )}

                {/* Profile Details */}
                {user && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1 mb-3">Dein Profil</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <StatTile
                                icon={<Ruler className="w-4 h-4" />}
                                label="Größe"
                                value={user.height ? `${user.height} cm` : '–'}
                                color="text-blue-400"
                                bg="bg-blue-400/10"
                            />
                            <StatTile
                                icon={<Barbell className="w-4 h-4" />}
                                label="Gewicht"
                                value={user.weight ? `${user.weight} kg` : '–'}
                                color="text-emerald-400"
                                bg="bg-emerald-400/10"
                            />
                            <StatTile
                                icon={<User className="w-4 h-4" />}
                                label="Alter"
                                value={user.age ? `${user.age} J.` : '–'}
                                color="text-violet-400"
                                bg="bg-violet-400/10"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0">
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ziel</p>
                                        <p className="text-[13px] font-semibold text-foreground">{GOAL_LABELS[user.goal ?? ''] || '–'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0">
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                                        <Barbell className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Level</p>
                                        <p className="text-[13px] font-semibold text-foreground">{EXPERIENCE_LABELS[user.experienceLevel ?? ''] || '–'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Settings List */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1 mb-3">Einstellungen</h3>
                    <SettingsToggle icon={<Moon className="w-5 h-5" />} label="Dark Mode erzwingen" defaultOn={true} />
                    <SettingsToggle icon={<DeviceMobile className="w-5 h-5" />} label="Haptisches Feedback" defaultOn={true} />
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1 mb-3">Daten</h3>
                    <Link href="/api/export" target="_blank">
                        <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden hover:bg-secondary/60 transition-colors cursor-pointer active:scale-[0.98]">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <DownloadSimple className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-[15px] text-foreground">Daten exportieren</p>
                                    <p className="text-[12px] text-muted-foreground">Alle Workouts als JSON herunterladen</p>
                                </div>
                                <CaretRight className="w-4 h-4 text-muted-foreground/40" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* About */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1 mb-3">Über</h3>
                    <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                                <Info className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-[15px] text-foreground">iTrack</p>
                                <p className="text-[12px] text-muted-foreground">v0.3.0 · Made in Germany</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
