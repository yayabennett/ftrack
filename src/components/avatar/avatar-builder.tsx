"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Check, DiceThree, CheckCircle, ArrowCounterClockwise, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { parseAvatarConfig, stringifyAvatarConfig, AvatarConfig } from '@/lib/avatar-utils'

const TRAITS = {
    hair: [
        { id: 'fonze', label: 'Kurz' },
        { id: 'mrT', label: 'Buzzcut' },
        { id: 'turban', label: 'Turban' },
        { id: 'dannyPhantom', label: 'Wuschelig' },
        { id: 'full', label: 'Lang' },
        { id: 'pixie', label: 'Pixie' },
        { id: 'dougFunny', label: 'Glatze' }
    ],
    facialHair: [
        { id: '', label: 'Keiner' },
        { id: 'beard', label: 'Vollbart' },
        { id: 'scruff', label: 'Drei-Tage' }
    ],
    eyes: [
        { id: 'eyes', label: 'Normal' },
        { id: 'round', label: 'Rund' },
        { id: 'smile', label: 'Fröhlich' }
    ],
    mouth: [
        { id: 'smile', label: 'Lächeln' },
        { id: 'laughing', label: 'Lachen' },
        { id: 'nervous', label: 'Nervös' },
        { id: 'pucker', label: 'Kuss' },
        { id: 'smirk', label: 'Grinsen' },
        { id: 'surprised', label: 'Überrascht' }
    ],
    glasses: [
        { id: '', label: 'Keine' },
        { id: 'round', label: 'Rund' },
        { id: 'square', label: 'Eckig' }
    ]
}

const HAIR_COLORS = [
    { id: '000000', label: 'Schwarz' },
    { id: '77311d', label: 'Braun' },
    { id: 'ffba5a', label: 'Blond' },
    { id: 'd93967', label: 'Rot' },
    { id: 'e0ddff', label: 'Grau' },
    { id: '9287ff', label: 'Lila' },
    { id: 'fc909f', label: 'Pink' },
]

const TABS = [
    { id: 'hair', label: 'Frisur & Haar' },
    { id: 'face', label: 'Gesicht & Details' }
]

interface AvatarBuilderProps {
    currentStyle?: string
    userId: string
    userName?: string | null
}

export function AvatarBuilder({ currentStyle, userId, userName }: AvatarBuilderProps) {
    const router = useRouter()

    const originalConfig = parseAvatarConfig(currentStyle, userId)

    // Ensure we force background to transparent for the new builder format, if they had a color before or not.
    const [config, setConfig] = useState<AvatarConfig>({
        ...originalConfig,
        bgColor: 'transparent'
    })
    const [activeTab, setActiveTab] = useState('hair')
    const [isSaving, setIsSaving] = useState(false)

    const handleTraitChange = (category: string, value: string) => {
        setConfig(prev => {
            const newTraits = { ...prev.traits }
            if (value === '') {
                delete newTraits[category]
            } else {
                newTraits[category] = [value]
            }
            return {
                ...prev,
                style: 'builder',
                traits: newTraits
            }
        })
    }

    const handleShuffle = () => {
        const newSeed = Math.random().toString(16).substring(2, 10)

        const randomTrait = (options: { id: string }[]) => options[Math.floor(Math.random() * options.length)].id

        const newTraits: Record<string, string[]> = {}
        const hair = randomTrait(TRAITS.hair)
        if (hair) newTraits.hair = [hair]

        const eyes = randomTrait(TRAITS.eyes)
        if (eyes) newTraits.eyes = [eyes]

        const mouth = randomTrait(TRAITS.mouth)
        if (mouth) newTraits.mouth = [mouth]

        const facialHair = randomTrait(TRAITS.facialHair)
        if (facialHair) newTraits.facialHair = [facialHair]

        const glasses = randomTrait(TRAITS.glasses)
        if (glasses) newTraits.glasses = [glasses]

        const hairColor = randomTrait(HAIR_COLORS)
        newTraits.hairColor = [hairColor]

        setConfig({
            style: 'builder',
            seed: newSeed,
            bgColor: 'transparent',
            isUrl: false,
            traits: newTraits
        })
    }

    const handleReset = () => {
        setConfig({ ...originalConfig, bgColor: 'transparent' })
    }

    const draftString = stringifyAvatarConfig(config)
    const currentString = stringifyAvatarConfig({ ...originalConfig, bgColor: 'transparent' })
    const hasChanged = draftString !== currentString

    const saveAvatar = async () => {
        setIsSaving(true)
        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: draftString })
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
        <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
                <Sparkle className="w-5 h-5 text-primary" weight="fill" />
                <h3 className="text-sm font-bold tracking-widest text-foreground uppercase">Avatar Studio</h3>
            </div>

            <div className="bg-card ring-1 ring-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-black/20">
                {/* Premium Header / Preview Area */}
                <div className="relative pt-12 pb-10 px-4 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20">

                    {/* Glowing Backdrops */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 blur-[64px] rounded-full pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-violet-500/20 blur-[48px] rounded-full pointer-events-none" />

                    {/* Top Controls */}
                    <div className="absolute top-5 left-5 right-5 flex justify-between z-20">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleReset}
                            disabled={!hasChanged}
                            className={`w-10 h-10 rounded-full bg-background/50 backdrop-blur-md border-white/10 transition-all ${hasChanged ? 'opacity-100 hover:bg-background/80 hover:scale-105' : 'opacity-40 pointer-events-none'}`}
                        >
                            <ArrowCounterClockwise className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleShuffle}
                            className="h-10 rounded-full px-4 gap-2 bg-foreground text-background hover:bg-foreground/90 font-bold shadow-lg shadow-black/20 hover:scale-105 transition-all"
                        >
                            <DiceThree className="w-5 h-5" weight="fill" />
                            Würfeln
                        </Button>
                    </div>

                    {/* Avatar Display */}
                    <div className="relative group z-10">
                        <UserAvatar
                            style={draftString}
                            seed={config.seed}
                            defaultName={userName || undefined}
                            className="w-40 h-40 ring-[6px] ring-background/80 shadow-2xl text-5xl relative z-10 transition-transform duration-500 ease-out group-hover:scale-105 bg-secondary/30 backdrop-blur-sm"
                        />
                    </div>
                </div>

                {/* Trait Controls */}
                <div className="bg-secondary/10 p-2 border-t border-white/5">
                    {/* Premium Tabs */}
                    <div className="flex gap-2 p-1.5 bg-background/50 backdrop-blur-xl rounded-[24px] mx-2 mt-2">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2.5 rounded-[20px] text-[13px] font-bold transition-all duration-300 ${activeTab === tab.id
                                        ? "bg-foreground text-background shadow-md shadow-black/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 space-y-8 min-h-[300px] mt-2">
                        {activeTab === 'hair' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 ease-out fill-mode-both">

                                {/* Hair Style Selector */}
                                <div className="space-y-3.5">
                                    <label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Schnitt</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {TRAITS.hair.map((t) => {
                                            const isActive = ((config.traits.hair as string[])?.[0] || 'fonze') === t.id
                                            const actuallyActive = isActive && config.style !== 'initials'
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleTraitChange('hair', t.id)}
                                                    className={`px-4 py-2.5 rounded-2xl text-[14px] font-semibold transition-all duration-200 active:scale-95 ${actuallyActive
                                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-primary ring-offset-2 ring-offset-card'
                                                            : 'bg-background/80 text-muted-foreground hover:text-foreground hover:bg-secondary border border-white/5 shadow-sm'
                                                        }`}
                                                >
                                                    {t.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Hair Color Selector */}
                                <div className="space-y-3.5">
                                    <label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Haarfarbe</label>
                                    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar snap-x">
                                        {HAIR_COLORS.map((c) => {
                                            // Handle default fallback logically: if no color is set, "000000" might be a safe assumption or the actual default is unknown. We check active state strictly.
                                            const isActive = ((config.traits.hairColor as string[])?.[0] || '') === c.id
                                            return (
                                                <button
                                                    key={c.id}
                                                    onClick={() => handleTraitChange('hairColor', c.id)}
                                                    className={`w-14 h-14 rounded-full shrink-0 snap-center transition-all duration-300 active:scale-90 flex items-center justify-center relative ${isActive
                                                            ? 'ring-4 ring-primary ring-offset-4 ring-offset-card scale-110 shadow-xl shadow-primary/20'
                                                            : 'ring-1 ring-white/10 shadow-sm hover:scale-110'
                                                        }`}
                                                    style={{ backgroundColor: `#${c.id}` }}
                                                >
                                                    {/* Inner inset shadow for realistic bubble feel */}
                                                    <div className="absolute inset-0 rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3)] mix-blend-overlay pointer-events-none" />
                                                    <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_8px_rgba(255,255,255,0.4)] mix-blend-overlay pointer-events-none" />

                                                    {isActive && <Check className="w-6 h-6 text-white drop-shadow-md relative z-10" weight="bold" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Facial Hair Selector */}
                                <div className="space-y-3.5">
                                    <label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Bart</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {TRAITS.facialHair.map((t) => {
                                            const isActive = ((config.traits.facialHair as string[])?.[0] || '') === t.id
                                            const actuallyActive = isActive && config.style !== 'initials'
                                            return (
                                                <button
                                                    key={t.id || 'none'}
                                                    onClick={() => handleTraitChange('facialHair', t.id)}
                                                    className={`px-4 py-2.5 rounded-2xl text-[14px] font-semibold transition-all duration-200 active:scale-95 border ${actuallyActive
                                                            ? 'bg-foreground text-background border-transparent shadow-lg shadow-black/20'
                                                            : 'bg-background/80 text-muted-foreground hover:text-foreground border-white/5 hover:bg-secondary'
                                                        }`}
                                                >
                                                    {t.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'face' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 ease-out fill-mode-both">
                                {/* Eyes Selector */}
                                <div className="space-y-3.5">
                                    <label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Augen</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {TRAITS.eyes.map((t) => {
                                            const isActive = ((config.traits.eyes as string[])?.[0] || 'eyes') === t.id
                                            const actuallyActive = isActive && config.style !== 'initials'
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleTraitChange('eyes', t.id)}
                                                    className={`px-4 py-2.5 rounded-2xl text-[14px] font-semibold transition-all duration-200 active:scale-95 border ${actuallyActive
                                                            ? 'bg-foreground text-background border-transparent shadow-lg shadow-black/20'
                                                            : 'bg-background/80 text-muted-foreground hover:text-foreground hover:bg-secondary border-white/5'
                                                        }`}
                                                >
                                                    {t.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Mouth Selector */}
                                <div className="space-y-3.5">
                                    <label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Mund</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {TRAITS.mouth.map((t) => {
                                            const isActive = ((config.traits.mouth as string[])?.[0] || 'smile') === t.id
                                            const actuallyActive = isActive && config.style !== 'initials'
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleTraitChange('mouth', t.id)}
                                                    className={`px-4 py-2.5 rounded-2xl text-[14px] font-semibold transition-all duration-200 active:scale-95 border ${actuallyActive
                                                            ? 'bg-foreground text-background border-transparent shadow-lg shadow-black/20'
                                                            : 'bg-background/80 text-muted-foreground hover:text-foreground hover:bg-secondary border-white/5'
                                                        }`}
                                                >
                                                    {t.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Glasses Selector */}
                                <div className="space-y-3.5">
                                    <label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Brille</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {TRAITS.glasses.map((t) => {
                                            const isActive = ((config.traits.glasses as string[])?.[0] || '') === t.id
                                            const actuallyActive = isActive && config.style !== 'initials'
                                            return (
                                                <button
                                                    key={t.id || 'none'}
                                                    onClick={() => handleTraitChange('glasses', t.id)}
                                                    className={`px-4 py-2.5 rounded-2xl text-[14px] font-semibold transition-all duration-200 active:scale-95 border ${actuallyActive
                                                            ? 'bg-primary text-primary-foreground border-transparent shadow-lg shadow-primary/25 ring-2 ring-primary ring-offset-2 ring-offset-card'
                                                            : 'bg-background/80 text-muted-foreground hover:text-foreground hover:bg-secondary border-white/5'
                                                        }`}
                                                >
                                                    {t.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Action Area */}
                        <div className="pt-6 pb-2">
                            <Button
                                onClick={saveAvatar}
                                disabled={!hasChanged || isSaving}
                                className={`w-full h-14 text-[16px] font-bold rounded-full shadow-xl transition-all duration-300 ${hasChanged ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 scale-100' : 'bg-background/50 border border-white/5 text-muted-foreground shadow-none scale-[0.98]'
                                    }`}
                                variant="outline"
                            >
                                {isSaving ? (
                                    <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : hasChanged ? (
                                    <>Änderungen speichern <CheckCircle className="ml-2 w-6 h-6" weight="fill" /></>
                                ) : (
                                    'Profilbild ist aktuell'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
