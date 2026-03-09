import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { getCurrentUserId } from '@/lib/auth'

const CreateTemplateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    exercises: z.array(z.object({
        exerciseId: z.string().uuid(),
        targetSets: z.number().optional().nullable(),
        repRange: z.string().optional().nullable(),
        notes: z.string().optional().nullable()
    })).optional()
})

export async function GET() {
    try {
        const userId = await getCurrentUserId()
        const templates = await prisma.template.findMany({
            where: userId ? { userId } : {},
            include: {
                exercises: {
                    include: {
                        exercise: true
                    },
                    orderBy: { order: 'asc' }
                },
                sessions: {
                    select: { startedAt: true },
                    orderBy: { startedAt: 'desc' },
                    take: 1
                },
                _count: {
                    select: { sessions: true }
                }
            },
            orderBy: { order: 'asc' }
        })

        // Sort by usage frequency (most used first), then by most recently used
        const sorted = [...templates].sort((a: typeof templates[number], b: typeof templates[number]) => {
            const aCount = a._count.sessions
            const bCount = b._count.sessions
            if (aCount !== bCount) return bCount - aCount
            const aLast = a.sessions[0]?.startedAt?.getTime() ?? 0
            const bLast = b.sessions[0]?.startedAt?.getTime() ?? 0
            return bLast - aLast
        })

        // Enhance response with usage stats
        const enhanced = sorted.map((t: typeof templates[number]) => ({
            ...t,
            usageCount: t._count.sessions,
            lastUsed: t.sessions[0]?.startedAt?.toISOString() ?? null,
            sessions: undefined,
            _count: undefined
        }))

        return NextResponse.json(enhanced)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const result = CreateTemplateSchema.safeParse(json)

        if (!result.success) {
            return NextResponse.json({ error: result.error.format() }, { status: 400 })
        }

        const { name, exercises } = result.data
        const userId = await getCurrentUserId()

        const template = await prisma.template.create({
            data: {
                name,
                userId,
                exercises: {
                    create: exercises?.map((ex, index) => ({
                        exerciseId: ex.exerciseId,
                        order: index,
                        targetSets: ex.targetSets,
                        repRange: ex.repRange,
                        notes: ex.notes
                    })) || []
                }
            },
            include: {
                exercises: true
            }
        })

        return NextResponse.json(template)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }
}
