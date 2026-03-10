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
            className="bg-card ring-1 ring-white/5 shadow-sm rounded-2xl border-0 overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
            onClick={toggle}
        >
            <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOn ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-[15px] text-foreground">{label}</p>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isOn ? 'bg-primary' : 'bg-secondary border border-white/5'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${isOn ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
            </CardContent>
        </Card>
    )
}
