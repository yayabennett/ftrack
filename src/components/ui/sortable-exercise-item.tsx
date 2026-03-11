"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DotsSixVertical as GripVertical, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useHaptics } from '@/hooks/use-haptics'

interface Props {
    id: string
    name: string
    muscleGroup: string | null
    onRemove: () => void
    targets?: {
        targetSets?: number
        repRange?: string
        targetWeight?: number
    }
    onUpdate?: (updates: Partial<{ targetSets: number, repRange: string, targetWeight: number }>) => void
}

export function SortableExerciseItem({ id, name, muscleGroup, onRemove, targets, onUpdate }: Props) {
    const { vibrate } = useHaptics()
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-start gap-3 p-3 bg-card/60 backdrop-blur-md ring-1 ring-white/5 rounded-[20px] shadow-sm transition-all ${isDragging ? 'ring-2 ring-primary bg-primary/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-105 z-50' : ''
                }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="mt-1 p-2 cursor-grab text-muted-foreground hover:text-foreground hover:bg-white/5 active:bg-white/10 transition-colors rounded-xl shrink-0 flex items-center justify-center -ml-1"
            >
                <GripVertical className="h-6 w-6" weight="bold" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className="font-semibold text-[15px] truncate">{name}</h4>
                        {muscleGroup && (
                            <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider truncate">
                                {muscleGroup}
                            </p>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-xl -mr-1"
                        onClick={() => {
                            vibrate('light')
                            onRemove()
                        }}
                    >
                        <X className="h-5 w-5" weight="bold" />
                    </Button>
                </div>

                {onUpdate && targets && (
                    <div className="grid grid-cols-3 gap-3 mt-1 pr-1 pb-1">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">Sätze</label>
                            <input
                                type="number"
                                value={targets.targetSets || ''}
                                onChange={e => onUpdate({ targetSets: parseInt(e.target.value) || undefined })}
                                placeholder="3"
                                className="w-full h-14 bg-black/20 ring-1 ring-white/5 shadow-inner shadow-black/40 rounded-xl px-2 text-center tabular-nums text-[18px] font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-primary/5 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">Reps</label>
                            <input
                                type="text"
                                value={targets.repRange || ''}
                                onChange={e => onUpdate({ repRange: e.target.value })}
                                placeholder="8-12"
                                className="w-full h-14 bg-black/20 ring-1 ring-white/5 shadow-inner shadow-black/40 rounded-xl px-2 text-center tabular-nums text-[18px] font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-primary/5 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">KG</label>
                            <input
                                type="number"
                                step="2.5"
                                value={targets.targetWeight || ''}
                                onChange={e => onUpdate({ targetWeight: parseFloat(e.target.value) || undefined })}
                                placeholder="-"
                                className="w-full h-14 bg-black/20 ring-1 ring-white/5 shadow-inner shadow-black/40 rounded-xl px-2 text-center tabular-nums text-[18px] font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-primary/5 transition-all"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
