import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Flame, TrendingUp } from 'lucide-react'

export default function StatsPage() {
    return (
        <div className="container mx-auto p-4 space-y-6 pb-24 animate-in fade-in duration-300">
            <header className="flex items-center justify-between pt-4 pb-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Insights</h1>
            </header>

            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-surface border-border shadow-sm rounded-xl">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Flame className="h-8 w-8 text-orange-500 mb-2 drop-shadow-sm" />
                        <h3 className="text-3xl font-bold text-foreground">3</h3>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Wochen-Streak</p>
                    </CardContent>
                </Card>

                <Card className="bg-surface border-border shadow-sm rounded-xl hover:bg-surface-2 transition-colors">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Activity className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-3xl font-bold text-foreground">24</h3>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Einheiten</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-surface border-border rounded-xl">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-foreground">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Wochen-Volumen (kg)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="h-48 flex items-end justify-between gap-2 pt-4">
                        {/* Fake Chart Bars for MVP */}
                        {[40, 65, 30, 80, 50, 90, 60].map((height, i) => (
                            <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer relative">
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-surface-2 border border-border text-[11px] text-foreground py-1 px-2 rounded-md font-medium transition-opacity pointer-events-none shadow-sm">
                                    {height * 100}
                                </div>
                                <div
                                    className={`w-full transition-all duration-300 rounded-t-sm ${i === 5 ? 'bg-primary' : 'bg-primary/20 group-hover:bg-primary/40'
                                        }`}
                                    style={{ height: `${height}%` }}
                                />
                                <span className={`text-[11px] font-semibold ${i === 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {['M', 'D', 'M', 'D', 'F', 'S', 'S'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
