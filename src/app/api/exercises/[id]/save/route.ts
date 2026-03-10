import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse("Unauthorized", { status: 401 })

        const { id } = await params
        const exercise = await prisma.exercise.findUnique({ where: { id } })

        if (!exercise) return new NextResponse("Exercise not found", { status: 404 })

        // Add user to the savedByUsers relation
        await prisma.user.update({
            where: { id: userId },
            data: {
                savedExercises: {
                    connect: { id }
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save exercise' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse("Unauthorized", { status: 401 })

        const { id } = await params

        // Remove user from the savedByUsers relation
        await prisma.user.update({
            where: { id: userId },
            data: {
                savedExercises: {
                    disconnect: { id }
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to remove exercise' }, { status: 500 })
    }
}
