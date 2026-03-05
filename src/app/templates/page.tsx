import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function TemplatesPage() {
    return (
        <div className="container mx-auto p-4 space-y-6 pb-24 animate-in fade-in duration-300">
            <header className="flex items-center justify-between pt-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Vorlagen</h1>
                <Button size="icon" variant="ghost" className="rounded-full text-primary hover:text-primary hover:bg-primary/10 w-10 h-10">
                    <Plus className="h-6 w-6" />
                </Button>
            </header>

            <div className="space-y-3">
                <Card className="bg-surface border-border hover:bg-surface-2 transition-colors cursor-pointer rounded-xl">
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

                <Card className="bg-surface border-border hover:bg-surface-2 transition-colors cursor-pointer rounded-xl">
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

                <Card className="bg-surface border-border hover:bg-surface-2 transition-colors cursor-pointer border-dashed mt-6 rounded-xl">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <Plus className="h-8 w-8 mb-2 opacity-60" />
                        <p className="text-[15px] font-medium">Neue Vorlage erstellen</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
