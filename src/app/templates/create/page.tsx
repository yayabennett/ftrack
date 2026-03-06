"use client"

import { useState, useTransition, useEffect } from 'react'
import { ArrowLeft, Check, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Defines how muscle groups map to main categories
const CATEGORY_MAP: Record<string, string[]> = {
    'Push': ['Brust', 'Schultern', 'Trizeps'],
    'Pull': ['Rücken', 'Bizeps'],
    'Beine': ['Beine (Quads)', 'Beine (Hams)', 'Po / Glutes', 'Waden'],
    'Core': ['Bauch']
}

export default function CreateTemplatePage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Fetch data via an API call instead of direct prisma (since it's a Client Component)
    // We'll manage state for the exercises here
    const [exercises, setExercises] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // UI State
    const [name, setName] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('Alle')

    // Selected exercises map (id -> order) to preserve selection sequence
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Load exercises on mount
    useEffect(() => {
        fetch('/api/exercises')
            .then(res => res.json())
            .then(data => {
                setExercises(data)
                setIsLoading(false)
            })
    }, [])

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || selectedIds.length === 0) return

        startTransition(async () => {
            const formData = new FormData()
            formData.append('name', name)
            selectedIds.forEach(id => {
                formData.append(`exercise_${id}`, 'on')
            })

            // Call the existing server action logic by using our POST endpoint or an inline action
            // Actually, we can't easily inline server actions in a standard CC without a separate file.
            // Let's create an API endpoint or just use a generic fetch.
            // Since we need to create a template, let's justPOST to /api/templates
            const res = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    exercises: selectedIds.map(id => ({ exerciseId: id }))
                })
            })

            if (res.ok) {
                router.push('/templates')
            } else {
                alert('Fehler beim Speichern der Einheit.')
            }
        })
    }

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    // Filter Logic
    const filteredExercises = exercises.filter(ex => {
        // Search filter
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ex.muscleGroup && ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()))

        // Category filter
        let matchesCategory = true
        if (activeTab !== 'Alle') {
            const allowedMuscleGroups = CATEGORY_MAP[activeTab] || []
            matchesCategory = allowedMuscleGroups.includes(ex.muscleGroup)
        }

        return matchesSearch && matchesCategory
    })

    const tabs = ['Alle', 'Push', 'Pull', 'Beine', 'Core']

    return (
        <div className="min-h-screen bg-background pb-28">
            <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Link href="/templates">
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full -ml-2 text-foreground hover:bg-secondary/80">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-[18px] font-bold tracking-tight text-foreground">Neue Einheit</h1>
                </div>
            </header>

            <form onSubmit={handleFormSubmit} className="container mx-auto p-4 pt-6 space-y-6 animate-in fade-in duration-300">
                {/* Name Input */}
                <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">
                        Name der Einheit
                    </label>
                    <Input
                        id="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="z.B. Push Day, Full Body A..."
                        className="h-14 bg-card ring-1 ring-white/5 border-0 focus-visible:ring-primary rounded-2xl text-[16px] px-4 font-semibold"
                        required
                    />
                </div>

                {/* Exercises Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            Übungen ({selectedIds.length} gewählt)
                        </label>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${activeTab === tab
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-card text-muted-foreground ring-1 ring-white/5'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Übung suchen..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="h-12 pl-10 bg-card ring-1 ring-white/5 border-0 focus-visible:ring-primary rounded-xl text-[15px] font-semibold"
                        />
                    </div>

                    {/* Exercise List */}
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar pb-10">
                        {isLoading ? (
                            <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">Lade Übungen...</div>
                        ) : filteredExercises.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">Keine Übungen gefunden.</div>
                        ) : (
                            filteredExercises.map(ex => {
                                const isSelected = selectedIds.includes(ex.id)
                                return (
                                    <label key={ex.id} className="relative block group cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelection(ex.id)}
                                            className="peer sr-only"
                                        />
                                        <Card className={`bg-card ring-1 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground transition-all active:scale-[0.98] ${isSelected ? 'ring-primary bg-primary/5' : 'ring-white/5'}`}>
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-[15px]">{ex.name}</h4>
                                                    <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider">{ex.muscleGroup} • {ex.equipment}</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                                                    <Check className={`w-3.5 h-3.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </label>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Floating Submit Button */}
                <div className="fixed bottom-24 left-0 right-0 px-4 z-40">
                    <Button
                        type="submit"
                        disabled={isPending || selectedIds.length === 0 || !name.trim()}
                        className="w-full h-14 text-[16px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-2xl shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isPending ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Check className="w-5 h-5 stroke-[3px]" /> Einheit speichern</>}
                    </Button>
                </div>
            </form>
        </div>
    )
}
