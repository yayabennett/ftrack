"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DotsSixVertical as GripVertical, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

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
            className={`flex items-center gap-3 p-3 bg-card border border-white/5 rounded-2xl shadow-sm touch-none transition-colors ${isDragging ? 'ring-2 ring-primary bg-primary/5 opacity-90' : ''
                }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="p-1 cursor-grab text-muted-foreground hover:text-foreground touch-none bg-secondary/50 rounded-lg shrink-0"
            >
                <GripVertical className="h-5 w-5" />
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
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-lg -mt-1 -mr-1"
                        onClick={onRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {onUpdate && targets && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sätze</label>
                            <input
                                type="number"
                                value={targets.targetSets || ''}
                                onChange={e => onUpdate({ targetSets: parseInt(e.target.value) || undefined })}
                                placeholder="3"
                                className="w-full h-9 bg-background/50 border border-white/5 rounded-lg px-2 text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reps</label>
                            <input
                                type="text"
                                value={targets.repRange || ''}
                                onChange={e => onUpdate({ repRange: e.target.value })}
                                placeholder="8-12"
                                className="w-full h-9 bg-background/50 border border-white/5 rounded-lg px-2 text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gewicht (kg)</label>
                            <input
                                type="number"
                                step="2.5"
                                value={targets.targetWeight || ''}
                                onChange={e => onUpdate({ targetWeight: parseFloat(e.target.value) || undefined })}
                                placeholder="-"
                                className="w-full h-9 bg-background/50 border border-white/5 rounded-lg px-2 text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
