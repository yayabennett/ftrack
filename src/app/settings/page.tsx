"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Info, Share, Trash2, User as UserIcon, LogOut, ChevronRight, Moon } from 'lucide-react'

export default function SettingsPage() {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const res = await fetch('/api/export')
            if (!res.ok) throw new Error("Export fehlgeschlagen")

            // trigger download
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `workout-backup-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            alert('Fehler beim Exportieren der Daten. Bitte versuche es noch einmal.')
        } finally {
            setIsExporting(false)
        }
    }

    const handleDeleteAll = () => {
        if (confirm('Möchtest du wirklich ALLE deine Trainingsdaten unwiderruflich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.')) {
            alert('Diese Funktion ist aktuell in der Beta noch deaktiviert, um versehentlichen Datenverlust zu vermeiden.')
        }
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between border-b border-white/5">
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Profil</h1>
            </header>

            <div className="container mx-auto p-4 space-y-6 pt-6 animate-in fade-in duration-300">

                {/* User Header */}
                <div className="flex flex-col items-center justify-center pt-4 pb-6">
                    <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center ring-4 ring-white/5 shadow-xl mb-4 relative overflow-hidden">
                        <UserIcon className="w-10 h-10 text-muted-foreground" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Athlet</h2>
                    <p className="text-sm font-medium text-primary mt-1 px-3 py-1 rounded-full bg-primary/10">Lokal gespeichert</p>
                </div>

                {/* Settings Actions List */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-2">Daten & Backup</h3>
                    <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                        <CardContent className="p-0">
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="w-full flex items-center justify-between p-4 active:bg-secondary/50 transition-colors border-b border-white/5 disabled:opacity-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Download className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className="font-semibold text-[15px]">Trainingsdaten exportieren</span>
                                </div>
                                {isExporting ? (
                                    <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                )}
                            </button>

                            <button
                                onClick={handleDeleteAll}
                                className="w-full flex items-center justify-between p-4 active:bg-secondary/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </div>
                                    <span className="font-semibold text-[15px] text-destructive">Alle Daten löschen</span>
                                </div>
                            </button>
                        </CardContent>
                    </Card>

                    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-2 pt-2">Erscheinungsbild</h3>
                    <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                        <CardContent className="p-0">
                            <div className="w-full flex items-center justify-between p-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                        <Moon className="w-4 h-4 text-foreground" />
                                    </div>
                                    <span className="font-semibold text-[15px]">Dark Mode</span>
                                </div>
                                {/* Fake Locked Toggle Switch */}
                                <div className="w-12 h-7 bg-primary rounded-full relative opacity-50 cursor-not-allowed">
                                    <div className="absolute right-1 top-1 w-5 h-5 bg-primary-foreground rounded-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-2 pt-2">Über</h3>
                    <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                        <CardContent className="p-0">
                            <button className="w-full flex items-center justify-between p-4 active:bg-secondary/50 transition-colors border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                        <Share className="w-4 h-4 text-foreground" />
                                    </div>
                                    <span className="font-semibold text-[15px]">App weiterempfehlen</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </button>
                            <div className="w-full flex items-center justify-between p-4 text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center">
                                        <Info className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-[15px]">Version</span>
                                </div>
                                <span className="text-sm font-medium pr-2">1.0.0</span>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
