"use client"
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useHaptics } from '@/hooks/use-haptics'

export function SettingsToggle({ icon, label, defaultOn = false }: { icon: React.ReactNode; label: string, defaultOn?: boolean }) {
    const [isOn, setIsOn] = useState(defaultOn)
    const { vibrate } = useHaptics()

    const toggle = () => {
        vibrate('light')
        setIsOn(!isOn)
    }

    return (
        <Card
            className="bg-card/60 backdrop-blur-md ring-1 ring-white/10 shadow-sm rounded-[24px] border-0 overflow-hidden cursor-pointer active:scale-95 transition-all hover:bg-card/80"
            onClick={toggle}
        >
            <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${isOn ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="font-extrabold text-[17px] text-foreground tracking-tight">{label}</p>
                </div>
                <div className={`w-14 h-8 rounded-full p-1 transition-all ${isOn ? 'bg-primary shadow-[0_0_15px_rgba(0,226,170,0.4)]' : 'bg-secondary ring-1 ring-white/10 shadow-inner'}`}>
                    <div className={`bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${isOn ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
            </CardContent>
        </Card>
    )
}
