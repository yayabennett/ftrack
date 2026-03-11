"use client"

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Play, Barbell as Dumbbell, Calendar, Clock, Copy, Check } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { TemplateDTO } from '@/lib/types'
import { useStartWorkout } from '@/hooks/use-start-workout'
import { useHaptics } from '@/hooks/use-haptics'

type Template = Pick<TemplateDTO, 'id' | 'name'> & { exercises: { id: string }[] }

export default function StartWorkoutConfig() {
    const { vibrate } = useHaptics()
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlTemplateId = searchParams.get('templateId')

    const [templates, setTemplates] = useState<Template[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const hasAutoStarted = useRef(false)

    // State for configuration
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
    const [date, setDate] = useState(() => {
        const d = new Date()
        return d.toISOString().split('T')[0]
    })
    const [time, setTime] = useState(() => {
        const d = new Date()
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    })

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch('/api/templates')
                if (res.ok) {
                    const data = await res.json()
                    setTemplates(data)
                    if (data.length > 0) {
                        const first = data.sort((a: { order?: number }, b: { order?: number }) => (a.order || 0) - (b.order || 0))[0]
                        setSelectedTemplateId(first.id)
                    }
                }
            } catch (error) {
                console.error("Failed to load templates", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchTemplates()
    }, [])

    const { startWorkout, isStarting } = useStartWorkout()

    useEffect(() => {
        if (urlTemplateId && templates.length > 0 && !hasAutoStarted.current) {
            hasAutoStarted.current = true
            startWorkout(urlTemplateId, date, time)
        }
    }, [urlTemplateId, templates, date, time, startWorkout])

    const handleStart = () => {
        startWorkout(selectedTemplateId, date, time)
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            <header className="sticky top-0 z-40 h-14 bg-background/60 backdrop-blur-[32px] px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full -ml-2 text-foreground hover:bg-secondary/80">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-[18px] font-bold tracking-tight text-foreground">Training starten</h1>
                </div>
            </header>

            <div className="container mx-auto p-4 pt-6 space-y-8 animate-in fade-in duration-300">

                {/* Date / Time Configuration */}
                <section className="space-y-4">
                    <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">Startzeitpunkt</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-card/60 backdrop-blur-md ring-1 ring-white/10 shadow-sm rounded-[24px] border-0 overflow-hidden transition-all focus-within:ring-primary focus-within:bg-primary/5">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Datum</span>
                                    </div>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="bg-transparent text-[18px] font-extrabold text-foreground tracking-tight outline-none w-full mt-1.5"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/60 backdrop-blur-md ring-1 ring-white/10 shadow-sm rounded-[24px] border-0 overflow-hidden transition-all focus-within:ring-primary focus-within:bg-primary/5">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Uhrzeit</span>
                                    </div>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="bg-transparent text-[18px] font-extrabold text-foreground tabular-nums tracking-tight outline-none w-full mt-1.5"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Template Selection */}
                <section className="space-y-4">
                    <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">Einheit auswählen</h2>

                    <div className="space-y-3">
                        {/* Empty Workout / Free Training */}
                        <div onClick={() => { vibrate('medium'); setSelectedTemplateId(null) }} className="cursor-pointer">
                            <Card className={`relative transition-all shadow-sm rounded-[24px] border-0 overflow-hidden active:scale-95 duration-200 ${selectedTemplateId === null ? 'ring-2 ring-primary bg-primary/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]' : 'ring-1 ring-white/5 bg-card/60 backdrop-blur-md hover:bg-card/80'}`}>
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${selectedTemplateId === null ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                                        <Dumbbell className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-extrabold text-[17px] text-foreground tracking-tight">Freies Training</h3>
                                        <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Leere Einheit starten</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedTemplateId === null ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,226,170,0.4)]' : 'border-muted-foreground/30'}`}>
                                        <Check className={`w-3.5 h-3.5 transition-opacity ${selectedTemplateId === null ? 'opacity-100' : 'opacity-0'}`} strokeWidth={4} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Templates */}
                        {isLoading ? (
                            <div className="text-center p-8 text-muted-foreground animate-pulse text-sm">Lade Einheiten...</div>
                        ) : (
                            templates.map(template => (
                                <div key={template.id} onClick={() => { vibrate('medium'); setSelectedTemplateId(template.id) }} className="cursor-pointer">
                                    <Card className={`relative transition-all shadow-sm rounded-[24px] border-0 overflow-hidden active:scale-95 duration-200 ${selectedTemplateId === template.id ? 'ring-2 ring-primary bg-primary/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]' : 'ring-1 ring-white/5 bg-card/60 backdrop-blur-md hover:bg-card/80'}`}>
                                        <CardContent className="p-5 flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${selectedTemplateId === template.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                                                <Copy className="w-7 h-7" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-extrabold text-[17px] text-foreground tracking-tight">{template.name}</h3>
                                                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mt-1">{template.exercises?.length || 0} Übungen</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedTemplateId === template.id ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,226,170,0.4)]' : 'border-muted-foreground/30'}`}>
                                                <Check className={`w-3.5 h-3.5 transition-opacity ${selectedTemplateId === template.id ? 'opacity-100' : 'opacity-0'}`} strokeWidth={4} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Floating Start Button */}
            <div className="fixed bottom-24 left-0 right-0 px-4 z-40">
                <Button onClick={() => { vibrate('heavy'); handleStart() }} disabled={isStarting} className="w-full h-[60px] text-[18px] font-extrabold bg-primary text-primary-foreground hover:bg-primary/90 rounded-[20px] shadow-[0_0_25px_rgba(0,226,170,0.5)] glow-primary transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100 group">
                    {isStarting ? (
                        <div className="w-6 h-6 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    ) : (
                        <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                    )}
                    {isStarting ? 'Wird vorbereitet...' : "Los geht's"}
                </Button>
            </div>
        </div>
    )
}
