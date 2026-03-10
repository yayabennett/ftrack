import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const { id } = await params
        const template = await prisma.template.findUnique({
            where: { id, userId },
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { order: 'asc' }
                }
            }
        })

        if (!template) return new NextResponse('Not found', { status: 404 })

        return NextResponse.json(template)
    } catch (e) {
        console.error(e)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const { id } = await params
        const { name, exercises, isProgressiveOverload, color } = await request.json()

        // Batch update: delete old relations and create new ones
        await prisma.$transaction([
            prisma.templateExercise.deleteMany({ where: { templateId: id } }),
            prisma.template.update({
                where: { id, userId },
                data: {
                    name,
                    color,
                    isProgressiveOverload: isProgressiveOverload ?? false,
                    exercises: {
                        create: exercises.map((ex: any, idx: number) => ({
                            exerciseId: ex.exerciseId,
                            order: idx,
                            targetSets: ex.targetSets || 3,
                            repRange: ex.repRange || '8-12',
                            targetWeight: ex.targetWeight ? parseFloat(ex.targetWeight) : null,
                            notes: ex.notes || ''
                        }))
                    }
                }
            })
        ])

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error(e)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const { id } = await params

        // Verify template exists and belongs to user
        const template = await prisma.template.findUnique({ where: { id, userId } })
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }

        // Cascade delete: TemplateExercises are deleted by onDelete: Cascade
        await prisma.template.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
    }
}
