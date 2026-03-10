"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { UserAvatar } from './user-avatar'
import { Check, DiceThree, CheckCircle, Palette } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface AvatarSelectorProps {
    currentStyle?: string
    userId: string
}

const PREMIUM_STYLES = [
    { id: 'micah', label: 'Memoji' },
    { id: 'notionists', label: 'Sketch' },
    { id: 'adventurer', label: 'Abenteurer' },
    { id: 'bottts', label: 'Roboter' },
    { id: 'initials', label: 'Initialen' }
]

const BG_COLORS = [
    { id: 'transparent', label: 'Leer' },
    { id: '#3b82f6', label: 'Blau' },
    { id: '#10b981', label: 'Smaragd' },
    { id: '#8b5cf6', label: 'Violett' },
    { id: '#ec4899', label: 'Pink' },
    { id: '#f59e0b', label: 'Bernstein' },
    { id: '#ef4444', label: 'Rot' }
]

export function AvatarSelector({ currentStyle = 'initials', userId }: AvatarSelectorProps) {
    const router = useRouter()

    // Parse current DB state (e.g. "micah:seed123:#3b82f6" or just "initials")
    const parts = currentStyle.includes(':') ? currentStyle.split(':') : [currentStyle, userId, 'transparent']

    const [collection, setCollection] = useState(parts[0] || 'initials')
    const [seed, setSeed] = useState(parts[1] || userId)
    const [bgColor, setBgColor] = useState(parts[2] || 'transparent')
    const [isSaving, setIsSaving] = useState(false)

    // Derived state representing current builder selections
    const draftStyle = `${collection}:${seed}:${bgColor}`
    const hasChanged = draftStyle !== currentStyle

    const handleShuffle = () => {
        // Generate a random 8-character hex string for the seed
        setSeed(Math.random().toString(16).substring(2, 10))
    }

    const saveAvatar = async () => {
        setIsSaving(true)
        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: draftStyle })
            })

            if (res.ok) {
                toast.success('Dein neuer Avatar ist live! 🎉')
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
            <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">Avatar Studio</h3>

            <Card className="bg-card ring-1 ring-white/5 border-0 rounded-3xl overflow-hidden shadow-sm">
                <CardContent className="p-0">
                    {/* Top: Large Preview Area & Shuffle */}
                    <div className="bg-gradient-to-br from-secondary/50 via-background to-secondary/30 p-8 flex flex-col justify-center items-center relative gap-6 border-b border-white/5">

                        <div className="relative group">
                            {/* Glowing effect behind avatar */}
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 opacity-50" />

                            {/* The Actual Preview generated dynamically */}
                            <UserAvatar
                                seed={seed}
                                style={draftStyle}
                                className="w-32 h-32 ring-4 ring-background shadow-xl text-4xl relative z-10 transition-transform duration-300"
                            />
                        </div>

                        <Button
                            variant="secondary"
                            onClick={handleShuffle}
                            className="rounded-full shadow-sm font-bold gap-2 active:scale-95 transition-transform"
                        >
                            <DiceThree className="w-5 h-5" weight="fill" />
                            Würfeln
                        </Button>
                    </div>

                    {/* Bottom: Customization Controls */}
                    <div className="p-5 space-y-6">

                        {/* Style Selector */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Charakter-Stil</label>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
                                {PREMIUM_STYLES.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setCollection(s.id)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 snap-center shrink-0 border ${collection === s.id
                                                ? 'bg-foreground text-background border-transparent shadow-md'
                                                : 'bg-secondary/50 text-muted-foreground border-transparent hover:text-foreground'
                                            }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Selector */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Palette className="w-4 h-4" /> Hintergrund
                            </label>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                                {BG_COLORS.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setBgColor(c.id)}
                                        className={`w-10 h-10 rounded-full shrink-0 transition-transform active:scale-90 flex items-center justify-center border-2 ${bgColor === c.id
                                                ? 'border-foreground scale-110'
                                                : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: c.id === 'transparent' ? 'rgba(255,255,255,0.05)' : c.id }}
                                    >
                                        {bgColor === c.id && <Check className={`w-5 h-5 ${c.id === 'transparent' ? 'text-foreground' : 'text-white'}`} weight="bold" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Save Action */}
                        <div className="pt-2">
                            <Button
                                onClick={saveAvatar}
                                disabled={!hasChanged || isSaving}
                                className="w-full h-12 text-[15px] font-bold rounded-2xl shadow-sm transition-all"
                                variant={hasChanged ? 'default' : 'secondary'}
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : hasChanged ? (
                                    <>Speichern <CheckCircle className="ml-1.5 w-5 h-5" weight="fill" /></>
                                ) : (
                                    'Bereits gespeichert'
                                )}
                            </Button>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
