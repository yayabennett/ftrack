"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Barbell } from "@phosphor-icons/react"
import { toast } from "sonner"

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            })

            if (!res.ok) {
                const errorText = await res.text()
                setError(errorText || "Registration failed")
                setLoading(false)
                return
            }

            // Registration successful, now sign in automatically
            const signInRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (signInRes?.error) {
                setError("Account created, but failed to sign in automatically.")
                setLoading(false)
            } else {
                toast.success("Account created successfully!")
                router.push("/")
                router.refresh()
            }
        } catch (err) {
            setError("An unexpected error occurred.")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-sm p-6 space-y-6 bg-card border border-border/50">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Barbell weight="fill" className="text-primary w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
                    <p className="text-sm text-muted-foreground text-center">
                        Save your progress and access it from any device.
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Name
                        </label>
                        <Input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Email
                        </label>
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Password
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating Account..." : "Register"}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </Card>
        </div>
    )
}
