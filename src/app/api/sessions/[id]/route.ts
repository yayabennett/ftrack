import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Verify session exists
        const session = await prisma.workoutSession.findUnique({ where: { id } })
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Cascade delete: WorkoutExercises → SetEntries all deleted by onDelete: Cascade
        await prisma.workoutSession.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
    }
}
