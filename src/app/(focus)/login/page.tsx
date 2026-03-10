"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SignIn } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function AuthPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false
        })

        if (res?.error) {
            setError("Ungültige E-Mail oder Passwort.")
            setLoading(false)
        } else {
            router.push("/")
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Soft decorative background circles instead of neon glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/30 rounded-full blur-3xl pointer-events-none translate-y-1/4 -translate-x-1/4" />

            <div className="w-full max-w-sm z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center gap-2 mb-8">
                    <div className="text-center">
                        <Link href="/onboarding">
                            <h1 className="text-6xl tracking-[-0.08em] text-foreground flex items-baseline justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-300">
                                <span className="font-extralight opacity-80">i</span>
                                <span className="font-black text-primary -ml-1">Track</span>
                            </h1>
                        </Link>
                        <p className="text-xs text-muted-foreground font-bold mt-2 opacity-60 uppercase tracking-[0.3em]">Premium Training</p>
                    </div>
                </div>

                <Card className="p-6 bg-card border-border shadow-soft rounded-[32px] overflow-hidden relative">
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-destructive/10 text-destructive text-sm font-semibold p-3 rounded-xl text-center mb-6 ring-1 ring-destructive/20 relative z-10">
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                                Email
                            </label>
                            <Input
                                type="email"
                                placeholder="name@beispiel.de"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 bg-secondary/30 border-0 rounded-xl text-[15px] font-medium px-4 focus-visible:ring-primary focus-visible:bg-secondary/50 transition-all placeholder:text-muted-foreground/50"
                            />
                        </div>
                        <div className="space-y-1.5 pb-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                                Passwort
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-12 bg-secondary/30 border-0 rounded-xl text-[15px] font-medium px-4 focus-visible:ring-primary focus-visible:bg-secondary/50 transition-all placeholder:text-muted-foreground/50"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-[52px] rounded-2xl text-[16px] font-bold btn-primary-gradient text-white flex items-center justify-center gap-2 mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <SignIn className="w-5 h-5" />
                                    Einloggen
                                </>
                            )}
                        </Button>
                    </form>
                </Card>

                <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                    <Link href="/onboarding">
                        <Button variant="ghost" className="h-auto py-2 px-4 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground">
                            Noch keinen Account? Jetzt starten
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
