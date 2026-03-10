"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Barbell, UserPlus, SignIn } from "@phosphor-icons/react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

type Tab = "login" | "register"

export default function AuthPage() {
    const router = useRouter()
    const [tab, setTab] = useState<Tab>("login")

    // Form state
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (tab === "register") {
            try {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                })

                if (!res.ok) {
                    const errorText = await res.text()
                    setError(errorText || "Registrierung fehlgeschlagen")
                    setLoading(false)
                    return
                }

                // Auto sign-in
                const signInRes = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                })

                if (signInRes?.error) {
                    setError("Account erstellt, Login fehlgeschlagen.")
                    setLoading(false)
                } else {
                    toast.success("Account erfolgreich erstellt!")
                    router.push("/")
                    router.refresh()
                }
            } catch (err) {
                setError("Ein unerwarteter Fehler ist aufgetreten.")
                setLoading(false)
            }
        } else {
            // Login
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
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Soft decorative background circles instead of neon glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/30 rounded-full blur-3xl pointer-events-none translate-y-1/4 -translate-x-1/4" />

            <div className="w-full max-w-sm z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center gap-2 mb-8">
                    <div className="text-center">
                        <h1 className="text-6xl tracking-[-0.08em] text-foreground flex items-baseline justify-center">
                            <span className="font-extralight opacity-80">i</span>
                            <span className="font-black text-primary -ml-1">Track</span>
                        </h1>
                        <p className="text-xs text-muted-foreground font-bold mt-2 opacity-60 uppercase tracking-[0.3em]">Premium Training</p>
                    </div>
                </div>

                <Card className="p-6 bg-card border-border shadow-soft rounded-[32px] overflow-hidden relative">
                    {/* Segmented Control */}
                    <div className="flex p-1 bg-secondary/60 rounded-xl mb-6 ring-1 ring-white/5 relative z-10">
                        <button
                            type="button"
                            onClick={() => { setTab("login"); setError(""); }}
                            className={`flex-1 py-1.5 text-[13px] font-bold rounded-lg transition-all z-10 ${tab === "login" ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"}`}
                        >
                            Anmelden
                        </button>
                        <button
                            type="button"
                            onClick={() => { setTab("register"); setError(""); }}
                            className={`flex-1 py-1.5 text-[13px] font-bold rounded-lg transition-all z-10 ${tab === "register" ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"}`}
                        >
                            Registrieren
                        </button>
                        <motion.div
                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-card rounded-lg shadow-sm ring-1 ring-white/10"
                            animate={{ left: tab === "login" ? "4px" : "calc(50%)" }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-destructive/10 text-destructive text-sm font-semibold p-3 rounded-xl text-center mb-6 ring-1 ring-destructive/20 relative z-10">
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {tab === "register" && (
                                <motion.div
                                    key="name-field"
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="space-y-1.5 overflow-hidden"
                                >
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                                        Name
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Dein Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={tab === "register"}
                                        className="h-12 bg-secondary/30 border-0 rounded-xl text-[15px] font-medium px-4 focus-visible:ring-primary focus-visible:bg-secondary/50 transition-all placeholder:text-muted-foreground/50"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                            ) : tab === "login" ? (
                                <>
                                    <SignIn className="w-5 h-5" />
                                    Einloggen
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Account erstellen
                                </>
                            )}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}
