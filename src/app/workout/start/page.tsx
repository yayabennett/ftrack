"use client"

import { useState, useEffect } from 'react'
import { ArrowLeft, Play, Dumbbell, Calendar, Clock, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { TemplateDTO } from '@/lib/types'

type Template = Pick<TemplateDTO, 'id' | 'name'> & { exercises: { id: string }[] }

export default function StartWorkoutConfig() {
    const router = useRouter()
    const [templates, setTemplates] = useState<Template[]>([])
    const [isLoading, setIsLoading] = useState(true)

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

    const handleStart = () => {
        try {
            const startDateTime = new Date(`${date}T${time}:00`)

            // Build URL manually
            let url = `/workout/active?startedAt=${startDateTime.toISOString()}`
            if (selectedTemplateId) {
                url += `&templateId=${selectedTemplateId}`
            }

            router.push(url)
        } catch (error) {
            console.error("Failed to start workout", error)
        }
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
                        <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Datum</span>
                                    </div>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="bg-transparent text-[15px] font-semibold text-foreground outline-none w-full"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Uhrzeit</span>
                                    </div>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="bg-transparent text-[15px] font-semibold text-foreground outline-none w-full"
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
                        <div onClick={() => setSelectedTemplateId(null)} className="cursor-pointer">
                            <Card className={`relative bg - card ring - 2 transition - all shadow - sm rounded - 2xl border - 0 overflow - hidden active: scale - [0.98] ${selectedTemplateId === null ? 'ring-primary bg-primary/5' : 'ring-white/5'} `}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`w - 12 h - 12 rounded - xl flex items - center justify - center transition - colors ${selectedTemplateId === null ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'} `}>
                                        <Dumbbell className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-[16px] text-foreground">Freies Training</h3>
                                        <p className="text-[13px] text-muted-foreground font-medium">Leere Einheit starten</p>
                                    </div>
                                    <div className={`w - 6 h - 6 rounded - full border - 2 flex items - center justify - center transition - all ${selectedTemplateId === null ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'} `}>
                                        <Check className={`w - 3.5 h - 3.5 transition - opacity ${selectedTemplateId === null ? 'opacity-100' : 'opacity-0'} `} strokeWidth={3} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Templates */}
                        {isLoading ? (
                            <div className="text-center p-8 text-muted-foreground animate-pulse text-sm">Lade Einheiten...</div>
                        ) : (
                            templates.map(template => (
                                <div key={template.id} onClick={() => setSelectedTemplateId(template.id)} className="cursor-pointer">
                                    <Card className={`relative bg - card ring - 2 transition - all shadow - sm rounded - 2xl border - 0 overflow - hidden active: scale - [0.98] ${selectedTemplateId === template.id ? 'ring-primary bg-primary/5' : 'ring-white/5'} `}>
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className={`w - 12 h - 12 rounded - xl flex items - center justify - center transition - colors ${selectedTemplateId === template.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'} `}>
                                                <Copy className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-[16px] text-foreground">{template.name}</h3>
                                                <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-bold">{template.exercises?.length || 0} Übungen</p>
                                            </div>
                                            <div className={`w - 6 h - 6 rounded - full border - 2 flex items - center justify - center transition - all ${selectedTemplateId === template.id ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'} `}>
                                                <Check className={`w - 3.5 h - 3.5 transition - opacity ${selectedTemplateId === template.id ? 'opacity-100' : 'opacity-0'} `} strokeWidth={3} />
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
                <Button onClick={handleStart} className="w-full h-14 text-[17px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <Play className="w-5 h-5 fill-current" /> Los geht&apos;s
                </Button>
            </div>
        </div>
    )
}
