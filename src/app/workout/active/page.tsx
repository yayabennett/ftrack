"use client"

import { useState } from 'react'
import { Check, Clock, Plus, Timer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ActiveWorkout() {
    const [timer, setTimer] = useState<number | null>(null)

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-mono font-medium text-lg tracking-widest text-primary">00:14:32</span>
                </div>
                <Button variant="default" size="sm" className="bg-primary text-black hover:bg-primary/90 font-bold px-6 action-glow">
                    FINISH
                </Button>
            </div>

            <div className="container mx-auto p-4 space-y-6 animate-in slide-in-from-bottom-8 duration-500">

                {/* Exercise Card 1 */}
                <Card className="bg-card/40 border-border/50 overflow-hidden">
                    <CardHeader className="bg-secondary/30 p-3 flex flex-row items-center justify-between border-b border-border/50">
                        <CardTitle className="text-base font-semibold text-primary">Bench Press (Barbell)</CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-[3rem_1fr_1fr_4rem] gap-2 p-3 pb-2 text-xs font-semibold text-muted-foreground text-center uppercase tracking-wider">
                            <div>Set</div>
                            <div>kg</div>
                            <div>Reps</div>
                            <div className="text-right pr-2"><Check className="h-4 w-4 inline-block opacity-50" /></div>
                        </div>

                        <div className="space-y-1 p-2 pt-0">
                            {/* Set 1: Completed */}
                            <div className="grid grid-cols-[3rem_1fr_1fr_4rem] gap-2 items-center bg-primary/10 rounded-lg p-2 transition-colors">
                                <div className="text-center text-sm font-bold text-primary">1</div>
                                <Input type="number" defaultValue="60" className="h-10 text-center font-semibold bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-primary shadow-none" />
                                <Input type="number" defaultValue="12" className="h-10 text-center font-semibold bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-primary shadow-none" />
                                <div className="flex justify-end pr-1">
                                    <Button size="icon" className="h-8 w-8 rounded-md bg-primary text-black action-glow">
                                        <Check className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Set 2: Active */}
                            <div className="grid grid-cols-[3rem_1fr_1fr_4rem] gap-2 items-center bg-secondary/20 rounded-lg p-2 transition-colors">
                                <div className="text-center text-sm font-bold text-muted-foreground">2</div>
                                <Input type="number" placeholder="60" className="h-10 text-center font-semibold bg-background border-border/50 focus-visible:ring-primary" />
                                <Input type="number" placeholder="10" className="h-10 text-center font-semibold bg-background border-border/50 focus-visible:ring-primary" />
                                <div className="flex justify-end pr-1">
                                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-md border-border/50 bg-background text-muted-foreground">
                                        <Check className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            <Button variant="ghost" className="w-full text-xs font-medium text-muted-foreground hover:text-primary mt-2 uppercase tracking-widest">
                                <Plus className="mr-1 h-3 w-3" /> Add Set
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Global Add Exercise Button */}
                <Button variant="outline" className="w-full py-8 text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 border-dashed rounded-xl">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Exercise
                </Button>
            </div>

        </div>
    )
}
