import { Button } from '@/components/ui/button'
import { Question } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-[80vh] bg-background flex flex-col items-center justify-center gap-6 px-6 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <Question className="w-10 h-10" />
            </div>
            <div className="space-y-3">
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight">404</h2>
                <h3 className="text-xl font-bold text-foreground">Seite nicht gefunden</h3>
                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                    Die gesuchte Seite existiert leider nicht oder wurde verschoben.
                </p>
            </div>
            <Link href="/" className="mt-4">
                <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 h-12 rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/25"
                >
                    Zurück zur Startseite
                </Button>
            </Link>
        </div>
    )
}
