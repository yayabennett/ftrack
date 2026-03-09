'use client'

import { Button } from '@/components/ui/button'
import { Warning } from '@phosphor-icons/react'

export default function Error({ reset }: { reset: () => void }) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                <Warning className="w-8 h-8" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Etwas ist schiefgelaufen</h2>
                <p className="text-sm text-muted-foreground max-w-[300px]">
                    Es gab ein Problem beim Laden dieser Seite. Bitte versuche es erneut.
                </p>
            </div>
            <Button
                onClick={reset}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 h-11 rounded-xl"
            >
                Nochmal versuchen
            </Button>
        </div>
    )
}
