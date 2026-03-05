import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Flame, TrendingUp } from 'lucide-react'

export default function StatsPage() {
    return (
        <div className="container mx-auto p-4 space-y-6 pb-24 animate-in fade-in duration-500">
            <header className="flex items-center justify-between pt-4 pb-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Insights</h1>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/10 border-primary/20 shadow-[0_0_15px_rgba(132,204,22,0.1)]">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Flame className="h-8 w-8 text-orange-500 mb-2 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                        <h3 className="text-3xl font-extrabold text-white">3</h3>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Week Streak</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/60 transition-colors">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Activity className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-3xl font-extrabold text-white">24</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Workouts</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Weekly Volume (kg)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="h-48 flex items-end justify-between gap-2 pt-4">
                        {/* Fake Chart Bars for MVP */}
                        {[40, 65, 30, 80, 50, 90, 60].map((height, i) => (
                            <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer relative">
                                {/* Tooltip placeholder */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black/80 text-[10px] text-white py-1 px-2 rounded font-mono transition-opacity pointer-events-none">
                                    {height * 100}
                                </div>
                                <div
                                    className={`w-full transition-all duration-300 rounded-t-sm ${i === 5 ? 'bg-primary action-glow' : 'bg-primary/20 group-hover:bg-primary/40'
                                        }`}
                                    style={{ height: `${height}%` }}
                                />
                                <span className={`text-[10px] font-bold ${i === 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
