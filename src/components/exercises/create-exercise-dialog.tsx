import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Check } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MuscleGroup, Equipment } from '@prisma/client'

const MUSCLE_GROUPS = Object.values(MuscleGroup)
const EQUIPMENTS = Object.values(Equipment)

export function CreateExerciseDialog() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | ''>('')
    const [equipment, setEquipment] = useState<Equipment | ''>('')
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/exercises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    muscleGroup: muscleGroup || undefined,
                    equipment: equipment || undefined,
                })
            })
            if (!res.ok) throw new Error('Failed to create exercise')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-exercises'] })
            toast.success('Übung erstellt', { description: `"${name}" wurde erfolgreich hinzugefügt.` })
            setOpen(false)
            setName('')
            setMuscleGroup('')
            setEquipment('')
        },
        onError: () => {
            toast.error('Fehler', { description: 'Beim Erstellen der Übung trat ein Fehler auf.' })
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        createMutation.mutate()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-14 font-bold rounded-full w-full bg-card/60 backdrop-blur-md ring-1 ring-white/10 text-primary shadow-sm active:scale-95 transition-all text-[15px] hover:bg-card/80">
                    <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
                    Eigene Übung erstellen
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-background/95 backdrop-blur-3xl border-white/10 p-6 rounded-3xl w-[90vw] max-w-md">
                <DialogHeader className="mb-4 text-left">
                    <DialogTitle className="text-xl font-black tracking-tight">Neue Übung</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">
                            Name der Übung
                        </label>
                        <Input
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Z.b. Rumänisches Kreuzheben"
                            className="h-14 bg-card ring-1 ring-white/5 border-0 focus-visible:ring-primary rounded-2xl text-[16px] px-4 font-semibold"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">
                            Muskelgruppe (Optional)
                        </label>
                        <select
                            value={muscleGroup}
                            onChange={e => setMuscleGroup(e.target.value as MuscleGroup)}
                            className="w-full h-14 px-4 bg-card ring-1 ring-white/5 border-0 rounded-2xl text-[16px] font-semibold text-foreground focus:ring-primary focus:outline-none appearance-none"
                        >
                            <option value="">Keine Auswahl</option>
                            {MUSCLE_GROUPS.map(mg => (
                                <option key={mg} value={mg}>{mg}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">
                            Equipment (Optional)
                        </label>
                        <select
                            value={equipment}
                            onChange={e => setEquipment(e.target.value as Equipment)}
                            className="w-full h-14 px-4 bg-card ring-1 ring-white/5 border-0 rounded-2xl text-[16px] font-semibold text-foreground focus:ring-primary focus:outline-none appearance-none"
                        >
                            <option value="">Keine Auswahl</option>
                            {EQUIPMENTS.map(eq => (
                                <option key={eq} value={eq}>{eq}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={createMutation.isPending || !name.trim()}
                            className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                        >
                            {createMutation.isPending ? (
                                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><Check className="w-5 h-5 mr-2" strokeWidth={3} /> Übung speichern</>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
