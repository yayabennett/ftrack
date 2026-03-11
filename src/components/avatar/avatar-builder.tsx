"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Check, DiceThree, CheckCircle, ArrowCounterClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { parseAvatarConfig, stringifyAvatarConfig, AvatarConfig } from '@/lib/avatar-utils'

// Since we map "builder" to Micah, we provide trait options compatible with Micah
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

const BG_COLORS = [
    { id: 'transparent', label: 'Leer' },
    { id: '#3b82f6', label: 'Blau' },
    { id: '#10b981', label: 'Smaragd' },
    { id: '#8b5cf6', label: 'Violett' },
    { id: '#ec4899', label: 'Pink' },
    { id: '#f59e0b', label: 'Bernstein' },
    { id: '#ef4444', label: 'Rot' }
]

const TABS = [
    { id: 'hair', label: 'Frisur' },
    { id: 'face', label: 'Gesicht' },
    { id: 'colors', label: 'Farben' }
]

interface AvatarBuilderProps {
    currentStyle?: string
    userId: string
    userName?: string | null
}

export function AvatarBuilder({ currentStyle, userId, userName }: AvatarBuilderProps) {
    const router = useRouter()

    // Original DB Config
    const originalConfig = parseAvatarConfig(currentStyle, userId)

    // Working State
    const [config, setConfig] = useState<AvatarConfig>(originalConfig)
    const [activeTab, setActiveTab] = useState('hair')
    const [isSaving, setIsSaving] = useState(false)

    // Ensure style is builder if they start changing traits that only micah supports
    const handleTraitChange = (category: string, value: string) => {
        setConfig(prev => {
            const newTraits = { ...prev.traits }
            if (value === '') {
                delete newTraits[category]
            } else {
                newTraits[category] = [value] // Arrays required for traits by dicebear
            }
            return {
                ...prev,
                style: 'builder',
                traits: newTraits
            }
        })
    }

    const handleBgChange = (bgColor: string) => {
        setConfig(prev => ({ ...prev, bgColor }))
    }

    const handleShuffle = () => {
        // Randomize all the builder traits + seed to get completely new combo
        const newSeed = Math.random().toString(16).substring(2, 10)

        const randomTrait = (options: { id: string }[]) => {
            const randomOption = options[Math.floor(Math.random() * options.length)]
            return randomOption.id
        }

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

        setConfig({
            style: 'builder',
            seed: newSeed,
            // keep old bg color or randomize? Let's keep the bg color.
            bgColor: config.bgColor,
            isUrl: false,
            traits: newTraits
        })
    }

    const handleReset = () => {
        setConfig(originalConfig)
    }

    const draftString = stringifyAvatarConfig(config)
    const currentString = currentStyle || ''
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
        <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">Avatar Studio</h3>

            <Card className="bg-card ring-1 ring-white/5 border-0 rounded-3xl overflow-hidden shadow-sm">
                <CardContent className="p-0">
                    {/* Top: Large Preview Area */}
                    <div className="bg-gradient-to-br from-secondary/50 via-background to-secondary/30 pt-8 pb-6 px-4 flex flex-col justify-center items-center relative gap-6 border-b border-white/5">

                        {/* Control Buttons (Reset / Shuffle) */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                disabled={!hasChanged}
                                className="h-8 w-8 p-0 rounded-full bg-background/50 backdrop-blur"
                            >
                                <ArrowCounterClockwise className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleShuffle}
                                className="h-8 rounded-full shadow-sm font-bold gap-1.5 active:scale-95 transition-transform"
                            >
                                <DiceThree className="w-4 h-4" weight="fill" />
                                Würfeln
                            </Button>
                        </div>

                        <div className="relative group mt-4">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 opacity-50" />
                            <UserAvatar
                                style={draftString}
                                seed={config.seed}
                                defaultName={userName || undefined}
                                className="w-32 h-32 ring-4 ring-background shadow-xl text-4xl relative z-10 transition-transform duration-300"
                            />
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1.5 bg-secondary/40 rounded-full p-1 w-full max-w-[280px]">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-1.5 rounded-full text-[12px] font-bold transition-all ${activeTab === tab.id
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bottom: Customization Controls */}
                    <div className="p-5 space-y-6">
                        {activeTab === 'hair' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
                                {/* Hair Style Selector */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Frisur</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TRAITS.hair.map((t) => {
                                            const isActive = ((config.traits.hair as string[])?.[0] || 'fonze') === t.id
                                            const isOldInitials = config.style === 'initials' && !config.traits.hair
                                            const actuallyActive = isActive && !isOldInitials

                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleTraitChange('hair', t.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all active:scale-95 border ${actuallyActive
                                                        ? 'bg-foreground text-background border-transparent shadow-sm'
                                                        : 'bg-secondary/50 text-muted-foreground border-transparent hover:text-foreground'
                                                        }`}
                                                >
                                                    {t.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                {/* Facial Hair Selector */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Bart</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TRAITS.facialHair.map((t) => {
                                            const isActive = ((config.traits.facialHair as string[])?.[0] || '') === t.id
                                            const actuallyActive = isActive && config.style !== 'initials'
                                            return (
                                                <button
                                                    key={t.id || 'none'}
                                                    onClick={() => handleTraitChange('facialHair', t.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all active:scale-95 border ${actuallyActive
                                                        ? 'bg-foreground text-background border-transparent shadow-sm'
                                                        : 'bg-secondary/50 text-muted-foreground border-transparent hover:text-foreground'
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
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
                                {/* Eyes Selector */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Augen</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TRAITS.eyes.map((t) => {
                                            const isActive = ((config.traits.eyes as string[])?.[0] || 'eyes') === t.id
                                            const actuallyActive = isActive && config.style !== 'initials'
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleTraitChange('eyes', t.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all active:scale-95 border ${actuallyActive
                                                        ? 'bg-foreground text-background border-transparent shadow-sm'
                                                        : 'bg-secondary/50 text-muted-foreground border-transparent hover:text-foreground'
                                                        }`}
                                                >
                                                    {t.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                {/* Mouth Selector */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Mund</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TRAITS.mouth.map((t) => {
                                            const isActive = ((config.traits.mouth as string[])?.[0] || 'smile') === t.id
                                            const actuallyActive = isActive && config.style !== 'initials'
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleTraitChange('mouth', t.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all active:scale-95 border ${actuallyActive
                                                        ? 'bg-foreground text-background border-transparent shadow-sm'
                                                        : 'bg-secondary/50 text-muted-foreground border-transparent hover:text-foreground'
                                                        }`}
                                                >
                                                    {t.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                {/* Glasses Selector */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Brille</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TRAITS.glasses.map((t) => {
                                            const isActive = ((config.traits.glasses as string[])?.[0] || '') === t.id
                                            const actuallyActive = isActive && config.style !== 'initials'
                                            return (
                                                <button
                                                    key={t.id || 'none'}
                                                    onClick={() => handleTraitChange('glasses', t.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all active:scale-95 border ${actuallyActive
                                                        ? 'bg-foreground text-background border-transparent shadow-sm'
                                                        : 'bg-secondary/50 text-muted-foreground border-transparent hover:text-foreground'
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

                        {activeTab === 'colors' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
                                {/* Background Color */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Hintergrund</label>
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                                        {BG_COLORS.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => handleBgChange(c.id)}
                                                className={`w-10 h-10 rounded-full shrink-0 transition-transform active:scale-90 flex items-center justify-center border-2 ${config.bgColor === c.id
                                                    ? 'border-foreground scale-110'
                                                    : 'border-transparent'
                                                    }`}
                                                style={{ backgroundColor: c.id === 'transparent' ? 'rgba(255,255,255,0.05)' : c.id }}
                                            >
                                                {config.bgColor === c.id && <Check className={`w-5 h-5 ${c.id === 'transparent' ? 'text-foreground' : 'text-white'}`} weight="bold" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* In a full version, we could add Skin color, Hair Color here through the traits system. */}
                            </div>
                        )}

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
                                    <>Änderungen speichern <CheckCircle className="ml-1.5 w-5 h-5" weight="fill" /></>
                                ) : (
                                    'Bereits berechnet & schick'
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
