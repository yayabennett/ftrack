"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { UserAvatar } from './user-avatar'
import { Check, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AvatarSelectorProps {
    currentStyle?: string
    userId: string
}

const STYLES = ['initials', 'adventurer', 'bottts', 'avataaars'] as const

export function AvatarSelector({ currentStyle = 'initials', userId }: AvatarSelectorProps) {
    const [style, setStyle] = useState<any>(currentStyle)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    const saveAvatar = async (newStyle: string) => {
        setIsSaving(true)
        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: newStyle })
            })

            if (res.ok) {
                toast.success('Profilbild aktualisiert')
                router.refresh()
            } else {
                toast.error('Fehler beim Speichern')
            }
        } catch (e) {
            toast.error('Netzwerkfehler')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Avatar Style</h3>
                <div className="flex gap-1">
                    {STYLES.map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                setStyle(s)
                                saveAvatar(s)
                            }}
                            disabled={isSaving}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${style === s
                                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                }`}
                        >
                            <UserAvatar seed={userId} style={s as any} className="w-6 h-6 border-0 bg-transparent" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
