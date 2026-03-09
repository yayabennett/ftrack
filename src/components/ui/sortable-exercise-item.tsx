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
}

export function SortableExerciseItem({ id, name, muscleGroup, onRemove }: Props) {
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
                className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-xl"
                onClick={onRemove}
            >
                <X className="h-5 w-5" />
            </Button>
        </div>
    )
}
