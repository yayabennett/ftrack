"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Barbell as Dumbbell, ArrowRight, User, Ruler, Target, Lightning as Zap, Sparkle as Sparkles, CaretLeft as ChevronLeft } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ─── Constants ───────────────────────────────────────────────────────────────

const GOALS = [
    { id: 'muscle_gain', emoji: '💪', label: 'Muskelaufbau', desc: 'Masse und Definition aufbauen' },
    { id: 'fat_loss', emoji: '🔥', label: 'Fettabbau', desc: 'Körperfett reduzieren, Muskeln erhalten' },
    { id: 'strength', emoji: '🏋️', label: 'Kraft steigern', desc: 'Maximalkraft in Grundübungen' },
    { id: 'general_fitness', emoji: '⚡', label: 'Allgemeine Fitness', desc: 'Gesund und fit bleiben' },
] as const

const EXPERIENCE_LEVELS = [
    { id: 'beginner', emoji: '🌱', label: 'Anfänger', desc: 'Unter 6 Monate Trainingserfahrung' },
    { id: 'intermediate', emoji: '💎', label: 'Fortgeschritten', desc: '6 Monate – 2 Jahre regelmäßiges Training' },
    { id: 'advanced', emoji: '👑', label: 'Profi', desc: 'Über 2 Jahre konsequentes Training' },
] as const

const GENDERS = [
    { id: 'male', emoji: '♂️', label: 'Männlich' },
    { id: 'female', emoji: '♀️', label: 'Weiblich' },
    { id: 'other', emoji: '⚧️', label: 'Divers' },
] as const

const TOTAL_STEPS = 5

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileData {
    name: string
    age: string
    weight: string
    height: string
    gender: string
    goal: string
    experienceLevel: string
}

// ─── Step Components ─────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length: total }, (_, i) => (
                <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i < current
                        ? 'w-8 bg-primary'
                        : i === current
                            ? 'w-8 bg-primary/60'
                            : 'w-4 bg-white/10'
                        }`}
                />
            ))}
        </div>
    )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
                <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-[0_12px_40px_-8px_rgba(59,130,246,0.6)]">
                    <Dumbbell className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-sm shadow-lg">
                    <Sparkles className="w-4 h-4 text-amber-900" />
                </div>
            </div>

            <div className="space-y-3">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                    Willkommen bei <span className="text-gradient">ftrack</span>
                </h1>
                <p className="text-muted-foreground text-[15px] leading-relaxed max-w-xs mx-auto">
                    Dein intelligenter Trainingsbegleiter. Lass uns dein Profil einrichten, damit wir dein Training optimal gestalten können.
                </p>
            </div>

            <Button
                onClick={onNext}
                className="h-14 px-10 rounded-2xl text-[16px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_8px_30px_-6px_rgba(59,130,246,0.5)] transition-all active:scale-95 flex items-center gap-2"
            >
                Los geht&apos;s
                <ArrowRight className="w-5 h-5" />
            </Button>
        </div>
    )
}

function PersonalStep({
    data,
    onChange,
}: {
    data: ProfileData
    onChange: (field: keyof ProfileData, value: string) => void
}) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-400">
            <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mx-auto mb-4">
                    <User className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Über dich</h2>
                <p className="text-sm text-muted-foreground">Grundlagen für dein persönliches Training</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Name</label>
                    <Input
                        value={data.name}
                        onChange={e => onChange('name', e.target.value)}
                        placeholder="Dein Name"
                        className="h-13 bg-secondary/50 border-0 rounded-xl text-[16px] font-semibold px-4 focus-visible:ring-primary"
                    />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Alter</label>
                        <Input
                            type="number"
                            value={data.age}
                            onChange={e => onChange('age', e.target.value)}
                            placeholder="25"
                            className="h-13 bg-secondary/50 border-0 rounded-xl text-[16px] font-semibold text-center focus-visible:ring-primary"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Gewicht <span className="normal-case text-[9px]">kg</span></label>
                        <Input
                            type="number"
                            value={data.weight}
                            onChange={e => onChange('weight', e.target.value)}
                            placeholder="80"
                            className="h-13 bg-secondary/50 border-0 rounded-xl text-[16px] font-semibold text-center focus-visible:ring-primary"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Größe <span className="normal-case text-[9px]">cm</span></label>
                        <Input
                            type="number"
                            value={data.height}
                            onChange={e => onChange('height', e.target.value)}
                            placeholder="180"
                            className="h-13 bg-secondary/50 border-0 rounded-xl text-[16px] font-semibold text-center focus-visible:ring-primary"
                        />
                    </div>
                </div>

                {/* Gender Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Geschlecht</label>
                    <div className="grid grid-cols-3 gap-2">
                        {GENDERS.map(g => (
                            <button
                                key={g.id}
                                type="button"
                                onClick={() => onChange('gender', g.id)}
                                className={`p-3 rounded-xl text-center transition-all active:scale-95 ${data.gender === g.id
                                    ? 'bg-primary/15 ring-2 ring-primary text-foreground'
                                    : 'bg-secondary/40 ring-1 ring-white/5 text-muted-foreground hover:bg-secondary/60'
                                    }`}
                            >
                                <span className="text-lg">{g.emoji}</span>
                                <p className="text-[12px] font-bold mt-1">{g.label}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function GoalStep({
    selected,
    onSelect,
}: {
    selected: string
    onSelect: (id: string) => void
}) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-400">
            <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                    <Target className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Dein Trainingsziel</h2>
                <p className="text-sm text-muted-foreground">Was möchtest du erreichen?</p>
            </div>

            <div className="space-y-3">
                {GOALS.map(goal => (
                    <button
                        key={goal.id}
                        type="button"
                        onClick={() => onSelect(goal.id)}
                        className={`w-full p-4 rounded-2xl text-left transition-all active:scale-[0.98] flex items-center gap-4 ${selected === goal.id
                            ? 'bg-primary/15 ring-2 ring-primary shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                            : 'bg-secondary/30 ring-1 ring-white/5 hover:bg-secondary/50'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${selected === goal.id ? 'bg-primary/20' : 'bg-secondary/60'
                            }`}>
                            {goal.emoji}
                        </div>
                        <div>
                            <h3 className={`font-bold text-[15px] ${selected === goal.id ? 'text-foreground' : 'text-foreground/80'}`}>{goal.label}</h3>
                            <p className="text-[12px] text-muted-foreground">{goal.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

function ExperienceStep({
    selected,
    onSelect,
}: {
    selected: string
    onSelect: (id: string) => void
}) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-400">
            <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 mx-auto mb-4">
                    <Ruler className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Dein Level</h2>
                <p className="text-sm text-muted-foreground">Wie erfahren bist du im Krafttraining?</p>
            </div>

            <div className="space-y-3">
                {EXPERIENCE_LEVELS.map(level => (
                    <button
                        key={level.id}
                        type="button"
                        onClick={() => onSelect(level.id)}
                        className={`w-full p-4 rounded-2xl text-left transition-all active:scale-[0.98] flex items-center gap-4 ${selected === level.id
                            ? 'bg-primary/15 ring-2 ring-primary shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                            : 'bg-secondary/30 ring-1 ring-white/5 hover:bg-secondary/50'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${selected === level.id ? 'bg-primary/20' : 'bg-secondary/60'
                            }`}>
                            {level.emoji}
                        </div>
                        <div>
                            <h3 className={`font-bold text-[15px] ${selected === level.id ? 'text-foreground' : 'text-foreground/80'}`}>{level.label}</h3>
                            <p className="text-[12px] text-muted-foreground">{level.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

function SuccessStep({ name }: { name: string }) {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full gap-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_12px_40px_-8px_rgba(16,185,129,0.6)] animate-in zoom-in duration-500">
                    <Zap className="w-12 h-12 text-white" />
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Bereit, {name || 'Champ'}! 🎉
                </h2>
                <p className="text-muted-foreground text-[15px] leading-relaxed max-w-xs mx-auto">
                    Dein Profil ist eingerichtet. ftrack ist jetzt auf dein Training zugeschnitten. Zeit, Fortschritte zu machen!
                </p>
            </div>
        </div>
    )
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [data, setData] = useState<ProfileData>({
        name: '',
        age: '',
        weight: '',
        height: '',
        gender: '',
        goal: '',
        experienceLevel: '',
    })

    const updateField = (field: keyof ProfileData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }))
    }

    const canProceed = (): boolean => {
        switch (step) {
            case 0: return true // Welcome
            case 1: return !!(data.name && data.age && data.weight && data.height && data.gender)
            case 2: return !!data.goal
            case 3: return !!data.experienceLevel
            default: return true
        }
    }

    const handleNext = async () => {
        if (step < TOTAL_STEPS - 1) {
            setStep(prev => prev + 1)
            return
        }

        // Final step — redirect
        router.replace('/')
    }

    const handleBack = () => {
        if (step > 0) setStep(prev => prev - 1)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            const res = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    age: parseInt(data.age),
                    weight: parseFloat(data.weight),
                    height: parseFloat(data.height),
                    gender: data.gender,
                    goal: data.goal,
                    experienceLevel: data.experienceLevel,
                }),
            })

            if (!res.ok) {
                throw new Error('Failed')
            }

            // Move to success step
            setStep(TOTAL_STEPS - 1)
        } catch {
            setError('Etwas ist schiefgelaufen. Bitte versuche es erneut.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // When user clicks "Weiter" on the experience step, submit first
    const handleNextOrSubmit = async () => {
        if (step === 3) {
            // Experience step — submit and go to success
            await handleSubmit()
        } else {
            handleNext()
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header with back button + step indicator */}
            {step > 0 && step < TOTAL_STEPS - 1 && (
                <div className="px-4 pt-4 flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-secondary/80 transition-colors active:scale-95"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <StepIndicator current={step - 1} total={TOTAL_STEPS - 2} />
                    <div className="w-10" /> {/* Spacer */}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center px-6 py-8">
                {step === 0 && <WelcomeStep onNext={handleNext} />}
                {step === 1 && <PersonalStep data={data} onChange={updateField} />}
                {step === 2 && <GoalStep selected={data.goal} onSelect={v => updateField('goal', v)} />}
                {step === 3 && <ExperienceStep selected={data.experienceLevel} onSelect={v => updateField('experienceLevel', v)} />}
                {step === 4 && <SuccessStep name={data.name} />}
            </div>

            {/* Error message */}
            {error && (
                <div className="px-6 pb-2">
                    <p className="text-sm text-red-400 text-center font-semibold animate-in fade-in">{error}</p>
                </div>
            )}

            {/* Bottom CTA */}
            {step > 0 && (
                <div className="px-6 pb-10 pt-2">
                    <Button
                        onClick={step === TOTAL_STEPS - 1 ? handleNext : handleNextOrSubmit}
                        disabled={(step < TOTAL_STEPS - 1 && !canProceed()) || isSubmitting}
                        className="w-full h-14 rounded-2xl text-[16px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_8px_30px_-6px_rgba(59,130,246,0.5)] transition-all active:scale-95 disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : step === TOTAL_STEPS - 1 ? (
                            <>
                                <Dumbbell className="w-5 h-5" />
                                Training starten
                            </>
                        ) : step === 3 ? (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Profil erstellen
                            </>
                        ) : (
                            <>
                                Weiter
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Version footer on welcome */}
            {step === 0 && (
                <p className="text-xs text-muted-foreground/40 text-center pb-6 font-medium tracking-wider">
                    ftrack v0.3.0 · Dein Trainingsbegleiter
                </p>
            )}
        </div>
    )
}
