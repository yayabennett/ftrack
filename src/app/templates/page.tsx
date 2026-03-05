import { Plus, User, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function TemplatesPage() {
    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Copy className="h-5 w-5 text-primary" />
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground">Vorlagen</h1>
                </div>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-secondary text-foreground hover:bg-secondary/80">
                    <Plus className="h-5 w-5" />
                </Button>
            </header>

            <div className="container mx-auto p-4 space-y-4 animate-in fade-in duration-300">
                <Card className="bg-card ring-1 ring-white/5 shadow-sm hover:scale-[0.99] hover:bg-secondary transition-all cursor-pointer rounded-2xl border-0 overflow-hidden text-card-foreground">
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-[17px] mb-1">Push Day</h3>
                            <p className="text-[14px] text-muted-foreground w-[200px] sm:w-auto truncate">Bankdrücken, Schulterdrücken...</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[11px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-full">5 Übungen</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card ring-1 ring-white/5 shadow-sm hover:scale-[0.99] hover:bg-secondary transition-all cursor-pointer rounded-2xl border-0 overflow-hidden text-card-foreground">
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-[17px] mb-1">Pull Day</h3>
                            <p className="text-[14px] text-muted-foreground w-[200px] sm:w-auto truncate">Kreuzheben, Klimmzüge, Rud...</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[11px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-full">4 Übungen</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card ring-1 ring-white/5 shadow-sm hover:bg-secondary transition-colors cursor-pointer border border-dashed border-white/10 mt-6 rounded-2xl overflow-hidden text-card-foreground">
                    <CardContent className="p-6 flex gap-3 items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <Plus className="h-5 w-5 opacity-60" />
                        <p className="text-[15px] font-medium">Neue Vorlage erstellen</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
