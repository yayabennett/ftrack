import { Card, CardContent } from '@/components/ui/card'
import { User, DownloadSimple, Moon, Info, CaretRight, DeviceMobile, Ruler, Target, Barbell } from '@phosphor-icons/react/dist/ssr'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { getCurrentUserId } from '@/lib/auth'
import { StatTile } from '@/components/ui/stat-tile'
import { UserAvatar } from '@/components/ui/user-avatar'
import { AvatarBuilder } from '@/components/avatar/avatar-builder'
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
                <Card className="bg-card/50 backdrop-blur-2xl ring-1 ring-white/10 border-0 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
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
                    <AvatarBuilder userId={user.id} userName={user.name} currentStyle={user.image || 'initials'} />
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
                            <Card className="bg-card/60 backdrop-blur-md ring-1 ring-white/5 shadow-sm rounded-[24px] border-0">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ziel</p>
                                        <p className="text-[15px] font-bold text-foreground tracking-tight">{GOAL_LABELS[user.goal ?? ''] || '–'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/60 backdrop-blur-md ring-1 ring-white/5 shadow-sm rounded-[24px] border-0">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                                        <Barbell className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Level</p>
                                        <p className="text-[15px] font-bold text-foreground tracking-tight">{EXPERIENCE_LABELS[user.experienceLevel ?? ''] || '–'}</p>
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
                        <Card className="bg-card/60 backdrop-blur-md ring-1 ring-white/10 shadow-sm rounded-[24px] border-0 overflow-hidden hover:bg-card/80 transition-all cursor-pointer active:scale-95 text-card-foreground">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner glow-primary">
                                    <DownloadSimple className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-extrabold text-[17px] tracking-tight text-foreground">Daten exportieren</p>
                                    <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Alle Workouts als JSON herunterladen</p>
                                </div>
                                <CaretRight className="w-5 h-5 text-muted-foreground/40" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* About */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1 mb-3">Über</h3>
                    <Card className="bg-card/40 backdrop-blur-md ring-1 ring-white/5 shadow-sm rounded-[24px] border-0 overflow-hidden">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground shadow-inner">
                                <Info className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <p className="font-extrabold text-[17px] tracking-tight text-foreground">iTrack</p>
                                <p className="text-[13px] font-medium text-muted-foreground mt-0.5">v0.4.0 · Premium Build</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
