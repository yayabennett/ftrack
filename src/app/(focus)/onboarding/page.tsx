"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowRight, CheckCircle, Barbell as Dumbbell, Target, Ruler, User,
    Sparkle as Sparkles, Lightning as Zap, CaretLeft as ChevronLeft,
    Fire, Heartbeat, Plant, Diamond, Crown, GenderMale, GenderFemale, GenderIntersex
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn } from 'next-auth/react'

import { Gender, Goal, ExperienceLevel } from '@prisma/client'

// ─── Constants ───────────────────────────────────────────────────────────────

const GOALS = [
    { id: Goal.MUSCLE_GAIN, title: 'Muskeln aufbauen', desc: 'Sichtbar Masse & Kraft gewinnen', icon: Dumbbell, color: 'text-blue-500 bg-blue-500/10' },
    { id: Goal.FAT_LOSS, title: 'Fett abbauen', desc: 'Körperfett reduzieren, straffer werden', icon: Fire, color: 'text-orange-500 bg-orange-500/10' },
    { id: Goal.STRENGTH, title: 'Stärker werden', desc: 'Gewichte bei Grundübungen steigern', icon: Zap, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: Goal.GENERAL_FITNESS, title: 'Einfach fit werden', desc: 'Gesund bleiben und besser fühlen', icon: Heartbeat, color: 'text-violet-500 bg-violet-500/10' },
] as const

const EXPERIENCE_LEVELS = [
    { id: ExperienceLevel.BEGINNER, title: 'Anfänger', desc: 'Ich fange gerade erst an', icon: Plant, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: ExperienceLevel.INTERMEDIATE, title: 'Fortgeschritten', desc: 'Ich trainiere schon einige Monate', icon: Diamond, color: 'text-blue-500 bg-blue-500/10' },
    { id: ExperienceLevel.ADVANCED, title: 'Profi', desc: 'Ich trainiere seit Jahren', icon: Crown, color: 'text-amber-500 bg-amber-500/10' },
] as const

const GENDERS = [
    { id: Gender.MALE, title: 'Männlich', icon: GenderMale, color: 'text-blue-500 bg-blue-500/10' },
    { id: Gender.FEMALE, title: 'Weiblich', icon: GenderFemale, color: 'text-pink-500 bg-pink-500/10' },
    { id: Gender.OTHER, title: 'Divers', icon: GenderIntersex, color: 'text-violet-500 bg-violet-500/10' },
] as const

const TOTAL_STEPS = 8 // Welcome, Name, Gender, Goal, Experience, Metrics, Analyzing, Account

// ─── Types ───────────────────────────────────────────────────────────────────

import { RegisterInput } from '@/lib/validations/auth'
type ProfileData = RegisterInput

// ─── Shared Components ───────────────────────────────────────────────────────

const PageHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <div className="text-center space-y-3 mb-10 mt-6 px-4">
        <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground"
        >
            {title}
        </motion.h2>
        {subtitle && (
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-[15px] md:text-[17px] text-muted-foreground font-medium max-w-[280px] mx-auto leading-relaxed"
            >
                {subtitle}
            </motion.p>
        )}
    </div>
)

const CardButton = ({
    selected,
    onClick,
    icon: Icon,
    iconColorClass,
    title,
    desc
}: {
    selected: boolean,
    onClick: () => void,
    icon: React.ElementType,
    iconColorClass: string,
    title: string,
    desc?: string
}) => (
    <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className={`w-full text-left p-5 rounded-[24px] transition-all duration-300 flex items-center gap-5 border-2 ${selected
            ? 'bg-primary/5 border-primary shadow-[0_8px_30px_rgb(6,182,212,0.15)] ring-4 ring-primary/10'
            : 'bg-card border-transparent shadow-soft hover:shadow-md hover:bg-secondary/40'
            }`}
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 ${selected ? 'scale-110 ' + iconColorClass : 'bg-secondary/50 text-muted-foreground'}`}>
            <Icon weight={selected ? "duotone" : "regular"} className="w-8 h-8" />
        </div>
        <div>
            <h3 className={`font-bold text-[17px] sm:text-lg tracking-tight ${selected ? 'text-primary' : 'text-foreground'}`}>{title}</h3>
            {desc && <p className={`text-[13px] sm:text-sm mt-1 font-medium ${selected ? 'text-foreground/80' : 'text-muted-foreground'}`}>{desc}</p>}
        </div>
        <div className="ml-auto">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                {selected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle className="w-4 h-4 text-white" weight="bold" /></motion.div>}
            </div>
        </div>
    </motion.button>
)

const HugeInput = ({ value, onChange, placeholder, type = "text", postfix }: { value: string, onChange: (v: string) => void, placeholder: string, type?: string, postfix?: string }) => (
    <div className="relative flex items-center justify-center w-full">
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-center bg-transparent border-b-2 border-border focus:border-primary focus:outline-none transition-colors text-4xl sm:text-5xl font-black py-4 placeholder:text-muted/40 pb-4 text-foreground"
            autoFocus
        />
        {postfix && value && (
            <span className="absolute right-8 bottom-6 text-xl text-muted-foreground font-bold">{postfix}</span>
        )}
    </div>
)

// ─── Step Components ─────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full gap-10">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                className="relative"
            >
                <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(6,182,212,0.5)]">
                    <Dumbbell className="w-14 h-14 text-white" weight="fill" />
                </div>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-4"
            >
                <div className="inline-flex items-baseline justify-center text-6xl tracking-[-0.08em] mb-4">
                    <span className="font-extralight opacity-80">i</span>
                    <span className="font-black text-primary -ml-1">Track</span>
                </div>
                <h1 className="text-[26px] font-extrabold tracking-tight leading-tight">
                    Erreiche deine Ziele.<br />
                    <span className="opacity-50">Wissenschaftlich fundiert.</span>
                </h1>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="w-full mt-auto mb-8"
            >
                <Button
                    onClick={onNext}
                    className="w-full h-[60px] rounded-[24px] text-[18px] font-bold btn-primary-gradient shadow-[0_12px_30px_-8px_rgba(6,182,212,0.6)] hover:shadow-[0_16px_40px_-8px_rgba(6,182,212,0.7)] transition-all active:scale-95 flex items-center justify-center gap-2 text-white"
                >
                    Ich bin neu hier
                    <ArrowRight className="w-5 h-5" weight="bold" />
                </Button>
                <div className="mt-6 flex justify-center">
                    <button onClick={() => window.location.href = '/login'} className="text-[15px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                        Bereits Mitglied? <span className="text-primary">Einloggen</span>
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

function NameStep({ data, onChange }: { data: ProfileData; onChange: (f: keyof ProfileData, v: string) => void }) {
    return (
        <div className="flex flex-col h-full items-center pt-8">
            <PageHeader title="Wie dürfen wir dich nennen?" subtitle="Damit wir dich im Dashboard persönlich begrüßen können." />
            <div className="w-full max-w-[300px] mt-10">
                <HugeInput value={data.name} onChange={(v) => onChange('name', v)} placeholder="Dein Name" />
            </div>
        </div>
    )
}

function GenderStep({ data, onChange }: { data: ProfileData; onChange: (f: keyof ProfileData, v: string) => void }) {
    return (
        <div className="flex flex-col h-full pt-8">
            <PageHeader title="Was ist dein Geschlecht?" subtitle="Das hilft uns, deinen Kalorienbedarf und dein Volumen genauer zu berechnen." />
            <div className="space-y-4 px-2 w-full max-w-sm mx-auto mt-4">
                {GENDERS.map((g) => (
                    <CardButton
                        key={g.id}
                        icon={g.icon}
                        iconColorClass={g.color}
                        title={g.title}
                        selected={data.gender === g.id}
                        onClick={() => onChange('gender', g.id)}
                    />
                ))}
            </div>
        </div>
    )
}

function GoalStep({ data, onChange }: { data: ProfileData; onChange: (f: keyof ProfileData, v: string) => void }) {
    return (
        <div className="flex flex-col h-full pt-8">
            <PageHeader title="Was ist dein Hauptziel?" subtitle="Wir passen deinen Trainingsplan exakt auf dieses Ziel an." />
            <div className="space-y-4 px-2 w-full max-w-sm mx-auto mt-2">
                {GOALS.map((g) => (
                    <CardButton
                        key={g.id}
                        icon={g.icon}
                        iconColorClass={g.color}
                        title={g.title}
                        desc={g.desc}
                        selected={data.goal === g.id}
                        onClick={() => onChange('goal', g.id)}
                    />
                ))}
            </div>
        </div>
    )
}

function ExperienceStep({ data, onChange }: { data: ProfileData; onChange: (f: keyof ProfileData, v: string) => void }) {
    return (
        <div className="flex flex-col h-full pt-8">
            <PageHeader title="Dein Fitness-Level?" subtitle="Wir passen die Übungsauswahl an deine Erfahrung an." />
            <div className="space-y-4 px-2 w-full max-w-sm mx-auto mt-4">
                {EXPERIENCE_LEVELS.map((g) => (
                    <CardButton
                        key={g.id}
                        icon={g.icon}
                        iconColorClass={g.color}
                        title={g.title}
                        desc={g.desc}
                        selected={data.experienceLevel === g.id}
                        onClick={() => onChange('experienceLevel', g.id)}
                    />
                ))}
            </div>
        </div>
    )
}

function MetricSlider({ title, value, min, max, unit, onChange }: { title: string, value: number, min: number, max: number, unit: string, onChange: (v: number) => void }) {
    return (
        <div className="py-2">
            <p className="text-center font-bold text-muted-foreground uppercase tracking-widest text-[12px] mb-8">{title}</p>

            <div className="relative w-full mb-10 px-2">
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-16 bg-secondary/30 rounded-[28px] overflow-hidden border-2 border-transparent shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] pointer-events-none">
                    <div className="absolute inset-0 opacity-20 text-foreground" style={{
                        backgroundImage: `
                            linear-gradient(90deg, currentColor 2px, transparent 2px),
                            linear-gradient(90deg, currentColor 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 100%, 10px 30%',
                        backgroundPosition: 'left bottom, left bottom',
                        backgroundRepeat: 'repeat-x'
                    }} />
                </div>

                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value || min}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="premium-slider"
                />
            </div>

            <div className="text-center flex items-baseline justify-center gap-2">
                <motion.div
                    key={value}
                    initial={{ y: 5, opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="text-6xl sm:text-7xl font-black text-foreground tracking-tighter"
                >
                    {value || min}
                </motion.div>
                <span className="text-2xl text-muted-foreground font-semibold">{unit}</span>
            </div>
        </div>
    )
}

function MetricsStep({ data, onChange }: { data: ProfileData; onChange: (f: keyof ProfileData, v: any) => void }) {
    return (
        <div className="flex flex-col h-full pt-4">
            <PageHeader title="Deine Körpermaße" subtitle="Präzise Daten. Maximale Ergebnisse." />
            <div className="space-y-12 mt-4 w-full max-w-sm mx-auto">
                <MetricSlider title="Alter" value={data.age as unknown as number} min={14} max={99} unit="Jahre" onChange={(v) => onChange('age', v)} />
                <MetricSlider title="Gewicht" value={data.weight as unknown as number} min={40} max={200} unit="kg" onChange={(v) => onChange('weight', v)} />
                <MetricSlider title="Körpergröße" value={data.height as unknown as number} min={140} max={220} unit="cm" onChange={(v) => onChange('height', v)} />
            </div>
        </div>
    )
}

function AnalyzingStep({ onComplete }: { onComplete: () => void }) {
    const [progress, setProgress] = useState(0)
    const [phase, setPhase] = useState(0)

    const phases = [
        "Analysiere Profil...",
        "Berechne ideales Trainingsvolumen...",
        "Optimiere Übungsauswahl...",
        "Dein Plan ist bereit!"
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 1.2
                if (next > 30 && phase === 0) setPhase(1)
                if (next > 60 && phase === 1) setPhase(2)
                if (next >= 100) {
                    clearInterval(interval)
                    setPhase(3)
                    setTimeout(onComplete, 800)
                    return 100
                }
                return next
            })
        }, 50)
        return () => clearInterval(interval)
    }, [phase, onComplete])

    return (
        <div className="flex flex-col items-center justify-center text-center h-full gap-10">
            <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" className="stroke-secondary/50 fill-none stroke-[6]" strokeLinecap="round" />
                    <motion.circle
                        cx="50" cy="50" r="45"
                        className="stroke-primary fill-none stroke-[6]"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 283" }}
                        animate={{ strokeDasharray: `${(progress / 100) * 283} 283` }}
                        transition={{ ease: "linear" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    {phase === 3 ? <Sparkles className="text-primary w-12 h-12" weight="fill" /> : <Dumbbell className="text-primary/50 w-10 h-10 animate-pulse" weight="fill" />}
                </div>
            </div>
            <div>
                <motion.h2
                    key={phase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-2xl font-extrabold tracking-tight"
                >
                    {phases[phase]}
                </motion.h2>
                <p className="text-muted-foreground font-medium mt-2">Wir stellen alles für dich ein...</p>
            </div>
        </div>
    )
}

function AccountStep({ data, onChange }: { data: ProfileData; onChange: (f: keyof ProfileData, v: string) => void }) {
    return (
        <div className="flex flex-col h-full pt-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                <Zap className="w-8 h-8" weight="fill" />
            </div>
            <PageHeader title="Sichere deinen Code" subtitle="Letzter Schritt! Lege einen Account an, um deinen personalisierten Plan für immer zu speichern." />

            <div className="space-y-6 mt-6 px-2 w-full max-w-sm mx-auto">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Adresse</label>
                    <input
                        type="email"
                        value={data.email || ''}
                        onChange={(e) => onChange('email', e.target.value)}
                        placeholder="name@beispiel.de"
                        className="w-full h-[60px] bg-secondary/40 border-2 border-transparent rounded-[20px] text-[16px] font-bold px-5 focus:border-primary focus:bg-card focus:shadow-[0_8px_30px_rgb(6,182,212,0.1)] outline-none transition-all placeholder:text-muted-foreground/40 placeholder:font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Passwort <span className="text-[10px] ml-1 opacity-50">(min. 6 Zeichen)</span></label>
                    <input
                        type="password"
                        value={data.password || ''}
                        onChange={(e) => onChange('password', e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-[60px] bg-secondary/40 border-2 border-transparent rounded-[20px] text-[16px] font-bold px-5 focus:border-primary focus:bg-card focus:shadow-[0_8px_30px_rgb(6,182,212,0.1)] outline-none transition-all placeholder:text-muted-foreground/40 placeholder:font-medium"
                    />
                </div>
            </div>
        </div>
    )
}

// ─── Main Wizard Layout ──────────────────────────────────────────────────────

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Data Store
    const [data, setData] = useState<ProfileData>({
        name: '',
        gender: Gender.MALE, // Default to satisfy non-null
        goal: Goal.MUSCLE_GAIN, // Default to satisfy non-null
        experienceLevel: ExperienceLevel.BEGINNER, // Default to satisfy non-null
        age: "" as unknown as number,
        weight: "" as unknown as number,
        height: "" as unknown as number,
        email: '',
        password: ''
    })

    const updateField = (field: keyof ProfileData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setError(null)
    }

    const canProceed = (): boolean => {
        switch (step) {
            case 0: return true // Welcome
            case 1: return data.name.length >= 2
            case 2: return !!data.gender
            case 3: return !!data.goal
            case 4: return !!data.experienceLevel
            case 5: return !!(data.age && data.weight && data.height)
            case 6: return false // Auto-advances
            case 7: return !!(data.email && data.password && data.password.length >= 6)
            default: return true
        }
    }

    const handleNext = async () => {
        if (step === 7) {
            await handleSubmit()
            return
        }

        // Auto fake loading
        if (step === 5) {
            setStep(6)
            return
        }

        if (step < TOTAL_STEPS - 1) setStep(s => s + 1)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(errorText || 'Fehler beim Erstellen des Accounts')
            }

            const signInRes = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            })

            if (signInRes?.error) throw new Error('Account erstellt, Login fehlgeschlagen.')

            router.replace('/') // Success redirect
        } catch (err: any) {
            setError(err.message || 'Etwas ist schiefgelaufen.')
            setIsSubmitting(false)
        }
    }

    // Animation Config
    const variants: import("framer-motion").Variants = {
        initial: { opacity: 0, x: 20, scale: 0.98 },
        animate: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
        exit: { opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.2 } }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Top Progress Bar - Yazio Style (Hidden on Welcome and Analyzing) */}
            {step > 0 && step !== 6 && (
                <div className="bg-background/80 backdrop-blur-xl z-50 sticky top-0 px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => setStep(s => s - 1)}
                        className="w-10 h-10 rounded-[14px] bg-secondary/60 flex items-center justify-center text-foreground hover:bg-secondary transition-colors shrink-0"
                    >
                        <ChevronLeft className="w-5 h-5" weight="bold" />
                    </button>

                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-end mb-1.5 px-0.5">
                            <motion.span
                                key={step}
                                initial={{ opacity: 0, y: 2 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[10px] font-black text-primary uppercase tracking-widest"
                            >
                                {step < 3 ? 'Startpunkt' : step < 5 ? 'Halbzeit' : 'Fast Geschafft'}
                            </motion.span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Noch ~1 Min
                            </span>
                        </div>
                        <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden relative">
                            <motion.div
                                className="absolute top-0 bottom-0 left-0 bg-primary rounded-full overflow-hidden"
                                initial={{ width: `${((step) / (TOTAL_STEPS - 2)) * 100}%` }}
                                animate={{ width: `${((step) / (TOTAL_STEPS - 2)) * 100}%` }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }} />
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col px-4 sm:px-6 relative overflow-x-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full max-w-md mx-auto h-full flex flex-col pt-4"
                    >
                        {step === 0 && <WelcomeStep onNext={handleNext} />}
                        {step === 1 && <NameStep data={data} onChange={updateField} />}
                        {step === 2 && <GenderStep data={data} onChange={updateField} />}
                        {step === 3 && <GoalStep data={data} onChange={updateField} />}
                        {step === 4 && <ExperienceStep data={data} onChange={updateField} />}
                        {step === 5 && <MetricsStep data={data} onChange={updateField} />}
                        {step === 6 && <AnalyzingStep onComplete={() => setStep(7)} />}
                        {step === 7 && <AccountStep data={data} onChange={updateField} />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Floating Error Toast */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-32 left-4 right-4 z-50 pointer-events-none"
                    >
                        <div className="max-w-sm mx-auto bg-destructive/95 text-destructive-foreground text-[14px] font-bold py-3 px-5 rounded-2xl shadow-xl text-center backdrop-blur-md">
                            {error}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Sticky Action Bar */}
            {step > 0 && step !== 6 && (
                <div className="p-4 sm:p-6 pb-8 bg-gradient-to-t from-background via-background to-transparent sticky bottom-0 z-40 mt-auto">
                    <div className="max-w-md mx-auto">
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed() || isSubmitting}
                            className="w-full h-[64px] rounded-[24px] text-[18px] font-extrabold bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-none"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-3 border-background/20 border-t-background rounded-full animate-spin" />
                            ) : step === 7 ? (
                                <>Fortschritt sichern <Sparkles className="w-5 h-5" weight="fill" /></>
                            ) : (
                                <>Weiter <ArrowRight className="w-5 h-5" weight="bold" /></>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
