"use client"

import { useState, useTransition, useEffect } from 'react'
import { ArrowLeft, Check, MagnifyingGlass as Search, Trash, Play, DotsSixVertical as GripVertical } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import type { ExerciseDTO, TemplateDTO } from '@/lib/types'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableExerciseItem } from '@/components/ui/sortable-exercise-item'

const CATEGORY_MAP: Record<string, string[]> = {
    'Push': ['Brust', 'Schultern', 'Trizeps'],
    'Pull': ['Rücken', 'Bizeps'],
    'Beine': ['Beine (Quads)', 'Beine (Hams)', 'Po / Glutes', 'Waden'],
    'Core': ['Bauch']
}

export default function EditTemplatePage() {
    const router = useRouter()
    const { id } = useParams()
    const queryClient = useQueryClient()
    const [isPending, startTransition] = useTransition()

    // UI State
    const [name, setName] = useState('')
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('Alle')

    // 1. Fetch Template Data
    const { data: template, isLoading: isLoadingTemplate } = useQuery({
        queryKey: ['template', id],
        queryFn: async () => {
            const res = await fetch(`/api/templates/${id}`)
            if (!res.ok) throw new Error('Failed to fetch template')
            return res.json() as Promise<TemplateDTO & { exercises: { exerciseId: string }[] }>
        }
    })

    // 2. Fetch My Exercises
    const { data: myExercises = [], isLoading: isLoadingMine } = useQuery({
        queryKey: ['my-exercises-template'],
        queryFn: async () => {
            const res = await fetch('/api/exercises')
            if (!res.ok) throw new Error('Failed to fetch exercises')
            return res.json() as Promise<ExerciseDTO[]>
        }
    })

    // 3. Fetch Global Exercises
    const { data: globalExercises = [], isLoading: isLoadingGlobal } = useQuery({
        queryKey: ['global-exercises-template', searchQuery],
        queryFn: async () => {
            if (!searchQuery) return []
            const res = await fetch(`/api/exercises/global?q=${encodeURIComponent(searchQuery)}`)
            if (!res.ok) throw new Error('Failed to fetch global')
            return res.json() as Promise<(ExerciseDTO & { isSaved: boolean })[]>
        },
        enabled: !!searchQuery,
        staleTime: 60000,
    })

    useEffect(() => {
        if (template) {
            setName(template.name)
            setSelectedIds(template.exercises.map(e => e.exerciseId))
        }
    }, [template])

    const exercises = [...myExercises, ...globalExercises.filter(g => !myExercises.some(m => m.id === g.id))]
    const isLoading = isLoadingTemplate || isLoadingMine || isLoadingGlobal

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            setSelectedIds((items) => {
                const oldIndex = items.indexOf(active.id as string)
                const newIndex = items.indexOf(over.id as string)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const handleSave = async () => {
        if (!name.trim() || selectedIds.length === 0) return

        startTransition(async () => {
            const res = await fetch(`/api/templates/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    exercises: selectedIds.map(exerciseId => ({ exerciseId }))
                })
            })

            if (res.ok) {
                queryClient.invalidateQueries({ queryKey: ['templates'] })
                queryClient.invalidateQueries({ queryKey: ['template', id] })
                toast.success('Änderungen gespeichert')
                router.push('/templates')
            } else {
                toast.error('Fehler beim Speichern')
            }
        })
    }

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ex.muscleGroup && ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()))

        let matchesCategory = true
        if (activeTab !== 'Alle') {
            const allowedMuscleGroups = CATEGORY_MAP[activeTab] || []
            matchesCategory = !!ex.muscleGroup && allowedMuscleGroups.includes(ex.muscleGroup)
        }

        return matchesSearch && matchesCategory
    })

    if (isLoadingTemplate) {
        return (
            <div className="min-h-screen bg-background p-4 space-y-4">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-3xl" />
            </div>
        )
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
                    <h1 className="text-[18px] font-bold tracking-tight text-foreground">Einheit bearbeiten</h1>
                </div>
                <Link href={`/workout/active?templateId=${id}`}>
                    <Button size="sm" className="h-9 rounded-xl font-bold bg-primary text-primary-foreground flex gap-1.5 px-4 shadow-sm shadow-primary/20 active:scale-95 transition-transform">
                        <Play className="w-4 h-4 fill-current" /> Starten
                    </Button>
                </Link>
            </header>

            <div className="container mx-auto p-4 pt-6 space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">Name</label>
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="h-14 bg-card ring-1 ring-white/5 border-0 focus-visible:ring-primary rounded-2xl text-[16px] px-4 font-semibold"
                    />
                </div>

                <div className="space-y-4">
                    {selectedIds.length > 0 && (
                        <div className="space-y-3 mb-8 bg-secondary/10 p-4 -mx-4 rounded-3xl border border-white/5">
                            <label className="text-xs font-bold tracking-widest text-primary uppercase px-1">Reihenfolge</label>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={selectedIds} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2">
                                        {selectedIds.map(id => {
                                            const ex = exercises.find(e => e.id === id) || template?.exercises.find((te: any) => te.exerciseId === id)?.exercise
                                            if (!ex) return null
                                            return (
                                                <SortableExerciseItem
                                                    key={id}
                                                    id={id}
                                                    name={ex.name}
                                                    muscleGroup={ex.muscleGroup}
                                                    onRemove={() => toggleSelection(id)}
                                                />
                                            )
                                        })}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">Übungen hinzufügen</label>
                        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4">
                            {['Alle', 'Push', 'Pull', 'Beine', 'Core'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${activeTab === tab ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-card text-muted-foreground ring-1 ring-white/5'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Übung suchen..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="h-12 pl-10 bg-card ring-1 ring-white/5 border-0 rounded-xl text-[15px] font-semibold"
                            />
                        </div>
                        <div className="space-y-2 mt-2">
                            {filteredExercises.slice(0, 20).map(ex => {
                                const isSelected = selectedIds.includes(ex.id)
                                return (
                                    <Card
                                        key={ex.id}
                                        onClick={() => toggleSelection(ex.id)}
                                        className={`bg-card ring-1 shadow-sm rounded-2xl border-0 overflow-hidden cursor-pointer transition-all active:scale-[0.98] ${isSelected ? 'ring-primary bg-primary/5' : 'ring-white/5'}`}
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-[15px]">{ex.name}</h4>
                                                <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider">{ex.muscleGroup}</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                                                <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} weight="bold" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-24 left-0 right-0 px-4 z-40">
                <Button
                    onClick={handleSave}
                    disabled={isPending || selectedIds.length === 0 || !name.trim()}
                    className="w-full h-14 text-[16px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                    {isPending ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Check className="w-5 h-5 weight-bold" /> Speichern</>}
                </Button>
            </div>
        </div>
    )
}
