"use client"

import { useState, useMemo } from 'react'
import { Plus, Copy, Play, Trash as Trash2, MagnifyingGlass, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { TemplateDTO } from '@/lib/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface TemplateExercise {
    id: string
    exercise: Pick<TemplateDTO['exercises'][number]['exercise'], 'name'>
}

interface Template {
    id: string
    name: string
    color: string
    exercises: TemplateExercise[]
    usageCount?: number
    lastUsed?: string | null
}

export default function EinheitenPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'frequent' | 'recent'>('all')

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
        e.stopPropagation()
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

    // Filter Logic
    const filteredTemplates = useMemo(() => {
        let result = templates.filter(t =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.exercises.some(ex => ex.exercise.name.toLowerCase().includes(search.toLowerCase()))
        )

        if (filter === 'frequent') {
            // Sort by usage count descending
            result = [...result].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        } else if (filter === 'recent') {
            // Sort by last used date descending
            result = [...result].sort((a, b) => {
                const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0
                const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0
                return dateB - dateA
            })
        }

        return result
    }, [templates, search, filter])

    const recentlyTrained = useMemo(() => {
        return [...templates]
            .filter(t => t.lastUsed != null)
            .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
            .slice(0, 2)
    }, [templates])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pb-24">
                <header className="px-5 pt-8 pb-2 border-b border-white/5">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1">
                        Einheiten
                    </h1>
                </header>
                <div className="container mx-auto p-4 space-y-4 mt-2">
                    <Skeleton className="h-12 w-full rounded-[28px] bg-card/40 backdrop-blur-md ring-1 ring-white/5" />
                    <Skeleton className="h-[140px] w-full rounded-[28px] bg-card/40 backdrop-blur-md ring-1 ring-white/5 mt-8" />
                    <Skeleton className="h-[140px] w-full rounded-[28px] bg-card/40 backdrop-blur-md ring-1 ring-white/5" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            <header className="px-5 pt-8 pb-2">
                <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1">
                    Einheiten
                </h1>
            </header>

            {!search && filter === 'all' && recentlyTrained.length > 0 && (
                <div className="px-5 py-4 space-y-3">
                    <h3 className="text-[10px] font-black tracking-widest text-primary uppercase flex items-center gap-2">
                        <Sparkle weight="fill" className="w-3 h-3" />
                        Zuletzt trainiert
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {recentlyTrained.map(template => (
                            <Card
                                key={`recent-${template.id}`}
                                onClick={() => router.push(`/templates/${template.id}`)}
                                className="cursor-pointer transition-all active:scale-[0.98] block group card-hover relative overflow-hidden"
                            >
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
                                                size="sm"
                                                className="h-9 rounded-xl font-bold text-white hover:brightness-110 flex gap-1.5 px-4 shadow-sm shrink-0 ml-3"
                                                style={{ backgroundColor: template.color === 'primary' ? 'hsl(var(--primary))' : (template.color || 'hsl(var(--primary))') }}
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
                        ))}
                    </div>
                </div>
            )}

            <div className="px-5 py-3 space-y-3 sticky top-safe z-40 bg-background/80 backdrop-blur-md outline outline-8 outline-background/80 mt-2">
                <div className="relative">
                    <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Einheiten suchen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl bg-card border border-border/40 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-sm"
                    />
                </div>

                {!search && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {[
                            { id: 'all', label: 'Alle' },
                            { id: 'recent', label: 'Kürzlich' },
                            { id: 'frequent', label: 'Häufig' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id as typeof filter)}
                                className={cn(
                                    "whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-bold transition-all shrink-0 border",
                                    filter === f.id
                                        ? "bg-primary text-primary-foreground border-transparent shadow-sm glow-primary"
                                        : "bg-card border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-5 space-y-4 mt-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
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
                ) : filteredTemplates.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground font-medium">
                        Keine Ergebnisse für "{search}" gefunden.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTemplates.map(template => (
                            <div
                                key={template.id}
                                onClick={() => router.push(`/templates/${template.id}`)}
                                className="block cursor-pointer active:scale-[0.99] transition-all group card-hover"
                            >
                                <Card className={`transition-all relative overflow-hidden ${deletingId === template.id ? 'opacity-50' : ''}`}>
                                    <CardContent className="p-0">
                                        <div className="p-4 flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0 pr-2">
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
                                                        onClick={(e) => handleDuplicate(template.id, e)}
                                                        disabled={duplicatingId === template.id || deletingId === template.id}
                                                    >
                                                        {duplicatingId === template.id ? (
                                                            <div className={`h-4 w-4 border-2 border-t-transparent rounded-full animate-spin`} style={{ borderColor: template.color === 'primary' ? 'hsl(var(--primary))' : (template.color || 'hsl(var(--primary))'), borderTopColor: 'transparent' }} />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                                                        onClick={(e) => handleDelete(template.id, template.name, e)}
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
                                                    className="h-9 rounded-xl font-bold text-white hover:brightness-110 flex gap-1.5 px-4 shadow-sm"
                                                    style={{ backgroundColor: template.color === 'primary' ? 'hsl(var(--primary))' : (template.color || 'hsl(var(--primary))') }}
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
                    </div>
                )}

                {templates.length > 0 && (
                    <div className="fixed bottom-24 right-6 z-40">
                        <Link href="/templates/create">
                            <Button className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 flex items-center justify-center active:scale-95 transition-transform hover:bg-primary/90">
                                <Plus className="h-7 w-7 stroke-[3px]" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
