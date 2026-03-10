"use client"

import { Plus, Copy, Play, Trash as Trash2 } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { TemplateDTO } from '@/lib/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface TemplateExercise {
    id: string
    exercise: Pick<TemplateDTO['exercises'][number]['exercise'], 'name'>
}

interface Template {
    id: string
    name: string
    exercises: TemplateExercise[]
}

export default function EinheitenPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['templates'],
        queryFn: async () => {
            const res = await fetch('/api/templates')
            if (!res.ok) throw new Error('Network response was not ok')
            return res.json() as Promise<Template[]>
        }
    })

    const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm(`"${name}" wirklich löschen?`)) return
        setDeletingId(id)
        try {
            const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success('Einheit gelöscht')
                queryClient.invalidateQueries({ queryKey: ['templates'] })
            } else {
                toast.error('Fehler beim Löschen')
            }
        } catch (e) {
            console.error('Failed to delete template:', e)
            toast.error('Fehler beim Löschen')
        } finally {
            setDeletingId(null)
        }
    }

    const handleDuplicate = async (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        setDuplicatingId(id)
        try {
            const res = await fetch(`/api/templates/${id}/duplicate`, { method: 'POST' })
            if (res.ok) {
                toast.success('Einheit dupliziert')
                queryClient.invalidateQueries({ queryKey: ['templates'] })
            } else {
                toast.error('Fehler beim Duplizieren')
            }
        } catch (e) {
            console.error('Failed to duplicate template:', e)
            toast.error('Fehler beim Duplizieren')
        } finally {
            setDuplicatingId(null)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pb-24">
                <header className="sticky top-0 z-40 h-14 bg-background/60 backdrop-blur-[32px] px-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Copy className="h-5 w-5 text-primary" />
                        <h1 className="text-[22px] font-bold tracking-tight text-foreground">Einheiten</h1>
                    </div>
                    <Skeleton className="h-9 w-9 rounded-full bg-secondary" />
                </header>
                <div className="container mx-auto p-4 space-y-4 mt-2">
                    <Skeleton className="h-[120px] w-full rounded-2xl bg-card border border-white/5" />
                    <Skeleton className="h-[120px] w-full rounded-2xl bg-card border border-white/5" />
                    <Skeleton className="h-[60px] w-full rounded-2xl bg-card border border-dashed border-white/5" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-40 h-14 bg-background/60 backdrop-blur-[32px] px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Copy className="h-5 w-5 text-primary" />
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground">Einheiten</h1>
                </div>
            </header>

            <div className="container mx-auto p-4 space-y-4 animate-in fade-in duration-300 mt-2">
                {templates.length === 0 ? (
                    <div className="text-center mt-12 mb-12 space-y-4 p-8 glass-panel rounded-3xl mx-2 shadow-soft">
                        <div className="w-20 h-20 bg-primary/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 inner-highlight shadow-sm shadow-primary/20">
                            <Copy className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="font-bold text-[20px] text-foreground">Keine Einheiten</h3>
                        <p className="text-muted-foreground text-[14px] max-w-[280px] mx-auto leading-relaxed">
                            Erstelle eigene Workouts, um dein Training schneller und strukturierter zu starten.
                        </p>
                        <div className="pt-4">
                            <Link href="/templates/create">
                                <Button className="font-bold h-12 px-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] active:scale-95 transition-transform flex items-center gap-2 mx-auto">
                                    <Plus className="w-5 h-5 stroke-[3px]" />
                                    <span>Erste Einheit erstellen</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {templates.map(template => (
                            <div
                                key={template.id}
                                onClick={() => router.push(`/templates/${template.id}`)}
                                className="block cursor-pointer active:scale-[0.99] transition-all"
                            >
                                <Card className={`bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground transition-opacity hover:bg-secondary/20 ${deletingId === template.id ? 'opacity-50' : ''}`}>
                                    <CardContent className="p-0">
                                        <div className="p-4 flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-[18px] mb-1">{template.name}</h3>
                                                    <p className="text-[13px] text-muted-foreground leading-snug truncate">
                                                        {template.exercises.map(e => e.exercise.name).join(', ')}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-1 shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-muted-foreground hover:bg-secondary/80 hover:text-foreground rounded-lg transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDuplicate(template.id, e);
                                                        }}
                                                        disabled={duplicatingId === template.id || deletingId === template.id}
                                                    >
                                                        {duplicatingId === template.id ? (
                                                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(template.id, template.name, e);
                                                        }}
                                                        disabled={deletingId === template.id || duplicatingId === template.id}
                                                    >
                                                        {deletingId === template.id ? (
                                                            <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                                                <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                                                    {template.exercises.length} Übungen
                                                </span>
                                                <Button
                                                    size="sm"
                                                    className="h-9 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex gap-1.5 px-4 shadow-sm shadow-primary/20"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/workout/active?templateId=${template.id}`);
                                                    }}
                                                >
                                                    <Play className="w-4 h-4 fill-current" /> Starten
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}

                        <div className="fixed bottom-24 right-6 z-40">
                            <Link href="/templates/create">
                                <Button className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 flex items-center justify-center action-press">
                                    <Plus className="h-7 w-7 stroke-[3px]" />
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
