"use client"

import { useCallback } from 'react'

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning'

export function useHaptics() {
    const vibrate = useCallback((type: HapticType = 'light') => {
        // Safe check for navigator.vibrate
        if (typeof window === 'undefined' || !navigator.vibrate) return

        switch (type) {
            case 'light':
                navigator.vibrate(10) // Short, subtle tick
                break
            case 'medium':
                navigator.vibrate(20) // Firmer tick
                break
            case 'heavy':
                navigator.vibrate(40) // Stronger buzz
                break
            case 'success':
                navigator.vibrate([10, 30, 10]) // Double tap
                break
            case 'warning':
                navigator.vibrate([30, 40, 30]) // Longer double vibration
                break
            default:
                navigator.vibrate(10)
        }
    }, [])

    return { vibrate }
}
