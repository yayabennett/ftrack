import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const sourceTemplate = await prisma.template.findUnique({
            where: { id: params.id, userId },
            include: { exercises: true }
        })

        if (!sourceTemplate) return new NextResponse('Not found', { status: 404 })

        const newTemplate = await prisma.template.create({
            data: {
                name: `${sourceTemplate.name} (Kopie)`,
                userId,
                exercises: {
                    create: sourceTemplate.exercises.map(ex => ({
                        exerciseId: ex.exerciseId,
                        order: ex.order,
                        targetSets: ex.targetSets,
                        repRange: ex.repRange,
                        notes: ex.notes
                    }))
                }
            }
        })

        return NextResponse.json(newTemplate)
    } catch (e) {
        console.error(e)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
