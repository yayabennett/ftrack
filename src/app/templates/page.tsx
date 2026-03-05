import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function TemplatesPage() {
    return (
        <div className="container mx-auto p-4 space-y-6 pb-24 animate-in fade-in duration-500">
            <header className="flex items-center justify-between pt-4">
                <h1 className="text-2xl font-bold tracking-tight text-white">Templates</h1>
                <Button size="icon" variant="ghost" className="rounded-full text-primary hover:text-primary hover:bg-primary/20">
                    <Plus className="h-6 w-6" />
                </Button>
            </header>

            <div className="space-y-4">
                <Card className="bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/60 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-base mb-1">Push Day</h3>
                            <p className="text-xs text-muted-foreground w-[200px] sm:w-auto truncate">Bench Press, Overhead P...</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2 py-1 rounded-md">5 Exercises</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/60 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-base mb-1">Pull Day</h3>
                            <p className="text-xs text-muted-foreground w-[200px] sm:w-auto truncate">Deadlift, Pull Up, Dumb...</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2 py-1 rounded-md">4 Exercises</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/60 transition-colors cursor-pointer border-dashed mt-8">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                        <Plus className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm font-medium">Create New Template</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
