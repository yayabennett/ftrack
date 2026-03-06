"use client"

import { Plus, Copy, Play, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface TemplateExercise {
    id: string
    exercise: { name: string }
}

interface Template {
    id: string
    name: string
    exercises: TemplateExercise[]
}

export default function EinheitenPage() {
    const router = useRouter()
    const [templates, setTemplates] = useState<Template[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/templates')
            if (res.ok) {
                const data = await res.json()
                setTemplates(data)
            }
        } catch (e) {
            console.error('Failed to fetch templates:', e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" wirklich löschen?`)) return
        setDeletingId(id)
        try {
            const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setTemplates(prev => prev.filter(t => t.id !== id))
            }
        } catch (e) {
            console.error('Failed to delete template:', e)
        } finally {
            setDeletingId(null)
        }
    }

    if (isLoading) return null // loading.tsx handles this

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Copy className="h-5 w-5 text-primary" />
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground">Einheiten</h1>
                </div>
                <Link href="/templates/create">
                    <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-secondary text-foreground hover:bg-secondary/80">
                        <Plus className="h-5 w-5" />
                    </Button>
                </Link>
            </header>

            <div className="container mx-auto p-4 space-y-4 animate-in fade-in duration-300 mt-2">
                {templates.length === 0 ? (
                    <div className="text-center mt-12 space-y-3">
                        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Copy className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-lg">Keine Einheiten</h3>
                        <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                            Erstelle deine erste Einheit, um deine Lieblings-Workouts schnell zu starten.
                        </p>
                    </div>
                ) : (
                    templates.map(template => (
                        <Card key={template.id} className={`bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground transition-opacity ${deletingId === template.id ? 'opacity-50' : ''}`}>
                            <CardContent className="p-0">
                                <div className="p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-[18px] mb-1">{template.name}</h3>
                                            <p className="text-[13px] text-muted-foreground leading-snug truncate">
                                                {template.exercises.map(e => e.exercise.name).join(', ')}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                            onClick={() => handleDelete(template.id, template.name)}
                                            disabled={deletingId === template.id}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                                        <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
                                            {template.exercises.length} Übungen
                                        </span>
                                        <Link href={`/workout/active?templateId=${template.id}`}>
                                            <Button size="sm" className="h-9 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex gap-1.5 px-4 shadow-sm shadow-primary/20">
                                                <Play className="w-4 h-4 fill-current" /> Starten
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}

                <Link href="/templates/create" className="block mt-6">
                    <Card className="bg-card ring-1 ring-white/5 shadow-sm hover:bg-secondary transition-colors cursor-pointer border border-dashed border-white/10 rounded-2xl overflow-hidden text-card-foreground active:scale-[0.98]">
                        <CardContent className="p-5 flex gap-3 items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                            <Plus className="h-5 w-5 opacity-60" />
                            <p className="text-[14px] font-bold">Neue Einheit erstellen</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
