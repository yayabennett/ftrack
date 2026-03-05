"use client"

import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ActiveWorkout() {
    const [timer, setTimer] = useState<number | null>(null)

    return (
        <div className="min-h-screen bg-background pb-32">
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 h-14 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-mono font-bold text-[17px] tracking-widest text-primary">00:14:32</span>
                </div>
                <Button variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 h-8 rounded-full shadow-sm">
                    Einheit beenden
                </Button>
            </div>

            <div className="container mx-auto p-4 space-y-6 animate-in slide-in-from-bottom-8 duration-300">

                <Card className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden text-card-foreground">
                    <CardHeader className="bg-secondary/50 p-3 flex flex-row items-center justify-between border-b border-white/5">
                        <CardTitle className="text-[15px] font-semibold text-foreground">Bankdrücken (Langhantel)</CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-secondary">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-[3rem_1fr_1fr_4rem] gap-2 p-3 pb-2 text-[11px] font-bold text-muted-foreground text-center uppercase tracking-wider">
                            <div>Satz</div>
                            <div>kg</div>
                            <div>Wdh</div>
                            <div className="text-right pr-2"><Check className="h-4 w-4 inline-block opacity-50" /></div>
                        </div>

                        <div className="space-y-1 p-2 pt-0">
                            {/* Set 1: Completed */}
                            <div className="grid grid-cols-[3rem_1fr_1fr_4rem] gap-2 items-center bg-primary/10 rounded-xl p-2 transition-colors">
                                <div className="text-center text-[15px] font-bold text-primary">1</div>
                                <Input type="number" defaultValue="60" className="h-11 text-[16px] text-center font-semibold bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-primary shadow-none" />
                                <Input type="number" defaultValue="12" className="h-11 text-[16px] text-center font-semibold bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-primary shadow-none" />
                                <div className="flex justify-end pr-1">
                                    <Button size="icon" className="h-9 w-9 rounded-[10px] bg-primary text-primary-foreground">
                                        <Check className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Set 2: Active */}
                            <div className="grid grid-cols-[3rem_1fr_1fr_4rem] gap-2 items-center bg-secondary/40 rounded-xl p-2 transition-colors">
                                <div className="text-center text-[15px] font-bold text-muted-foreground">2</div>
                                <Input type="number" placeholder="60" className="h-11 text-[16px] text-center font-semibold bg-secondary/80 border-0 focus-visible:ring-1 focus-visible:ring-primary shadow-none" />
                                <Input type="number" placeholder="10" className="h-11 text-[16px] text-center font-semibold bg-secondary/80 border-0 focus-visible:ring-1 focus-visible:ring-primary shadow-none" />
                                <div className="flex justify-end pr-1">
                                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-[10px] border-white/10 bg-secondary/80 text-muted-foreground">
                                        <Check className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            <Button variant="ghost" className="w-full h-11 text-[13px] font-semibold text-primary hover:bg-primary/5 mt-2 rounded-xl">
                                <Plus className="mr-1 h-4 w-4" /> SATZ HINZUFÜGEN
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Button className="w-full h-14 text-[17px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-2xl shadow-none">
                    <Plus className="mr-2 h-5 w-5" />
                    Übung hinzufügen
                </Button>
            </div>
        </div>
    )
}
