import { NextResponse } from 'next/server'
import { WorkoutService } from '@/lib/services/workout.service'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // All complex PR calculation, volume math, and historical comparison
        // is now cleanly abstracted into the domain service layer.
        const recap = await WorkoutService.getRecapStats(id)

        if (!recap) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        return NextResponse.json(recap)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to generate recap' }, { status: 500 })
    }
}
