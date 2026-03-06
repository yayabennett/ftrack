import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Verify template exists
        const template = await prisma.template.findUnique({ where: { id } })
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
