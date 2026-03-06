import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Download, Moon, Info, ChevronRight, Smartphone } from 'lucide-react'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export const revalidate = 0

export default async function SettingsPage() {
    // Fetch some stats for profile header
    const [totalSessions, totalExercises] = await Promise.all([
        prisma.workoutSession.count(),
        prisma.exercise.count({ where: { isCustom: true } })
    ])

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-xl px-4 flex items-center border-b border-white/5">
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Profil</h1>
            </header>

            <div className="container mx-auto p-4 space-y-6 animate-in fade-in duration-300 mt-2">
                {/* Profile Card */}
                <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-lg text-foreground">Athlet</h2>
                            <p className="text-sm text-muted-foreground">
                                {totalSessions} Einheiten · {totalExercises} eigene Übungen
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings List */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1 mb-3">Einstellungen</h3>

                    <SettingsItem icon={Moon} label="Dark Mode" detail="Aktiv" />
                    <SettingsItem icon={Smartphone} label="Benachrichtigungen" detail="Bald verfügbar" />
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1 mb-3">Daten</h3>

                    <Link href="/api/export" target="_blank">
                        <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden hover:bg-secondary/60 transition-colors cursor-pointer active:scale-[0.98]">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-[15px] text-foreground">Daten exportieren</p>
                                    <p className="text-[12px] text-muted-foreground">Alle Workouts als JSON herunterladen</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
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
                                <p className="font-semibold text-[15px] text-foreground">ftrack</p>
                                <p className="text-[12px] text-muted-foreground">v0.1.0 · Made in Germany</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function SettingsItem({ icon: Icon, label, detail }: { icon: any; label: string; detail: string }) {
    return (
        <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-[15px] text-foreground">{label}</p>
                </div>
                <span className="text-[12px] text-muted-foreground font-medium">{detail}</span>
            </CardContent>
        </Card>
    )
}
