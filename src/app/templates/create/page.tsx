import { redirect } from 'next/navigation'
import { ArrowLeft, Check, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export const revalidate = 0 // Disable caching

export default async function CreateTemplatePage() {
    // 1. Fetch available exercises
    const allExercises = await prisma.exercise.findMany({
        orderBy: { name: 'asc' }
    })

    // 2. Define the Server Action inside the component file
    async function createTemplate(formData: FormData) {
        'use server'

        const rawName = formData.get('name')
        const name = typeof rawName === 'string' ? rawName.trim() : ''

        if (!name) return

        // Extract selected exercise IDs
        const selectedIds = []
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('exercise_') && value === 'on') {
                selectedIds.push(key.replace('exercise_', ''))
            }
        }

        if (selectedIds.length === 0) return

        // Create the template with nested writes
        await prisma.template.create({
            data: {
                name,
                exercises: {
                    create: selectedIds.map((exId, index) => ({
                        exerciseId: exId,
                        order: index
                    }))
                }
            }
        })

        redirect('/templates')
    }

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

            <form action={createTemplate} className="container mx-auto p-4 space-y-6 mt-4 animate-in fade-in duration-300">
                {/* Name Input */}
                <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">
                        Name der Einheit
                    </label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="z.B. Push Day, Full Body A..."
                        className="h-14 bg-card ring-1 ring-white/5 border-0 focus-visible:ring-primary rounded-2xl text-[16px] px-4 font-semibold"
                        required
                    />
                </div>

                {/* Exercises List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            Übungen auswählen
                        </label>
                        <span className="text-[10px] text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full">{allExercises.length} verfügbar</span>
                    </div>

                    <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar pb-10">
                        {allExercises.map(ex => (
                            <label key={ex.id} className="relative block group cursor-pointer">
                                <input
                                    type="checkbox"
                                    name={`exercise_${ex.id}`}
                                    className="peer sr-only"
                                />
                                <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground transition-all peer-checked:ring-primary peer-checked:bg-primary/5 active:scale-[0.98]">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-[15px]">{ex.name}</h4>
                                            <p className="text-[12px] text-muted-foreground">{ex.muscleGroup} • {ex.equipment}</p>
                                        </div>
                                        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center transition-all peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                                            <Check className="w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Floating Submit Button */}
                <div className="fixed bottom-24 left-0 right-0 px-4 z-40">
                    <Button type="submit" className="w-full h-14 text-[16px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] transition-transform active:scale-95 flex items-center justify-center gap-2">
                        <Check className="w-5 h-5 stroke-[3px]" /> Einheit speichern
                    </Button>
                </div>
            </form >
        </div >
    )
}
