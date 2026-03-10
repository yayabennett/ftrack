import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q')?.toLowerCase()

        const exercises = await prisma.exercise.findMany({
            where: {
                isCustom: false,
                ...(q ? {
                    name: {
                        contains: q,
                        mode: 'insensitive'
                    }
                } : {})
            },
            // Include whether the current user has saved it so the UI knows if it's already active
            include: {
                savedByUsers: {
                    where: { id: userId }
                }
            },
            orderBy: { name: 'asc' }
            // take: removed to allow the picker to display all 200+ exercises instantly
        })

        // Map to include a simple boolean
        const mapped = exercises.map(ex => ({
            ...ex,
            isSaved: ex.savedByUsers.length > 0
        }))

        return NextResponse.json(mapped)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to search global exercises' }, { status: 500 })
    }
}
