import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const session = await prisma.workoutSession.update({
            where: { id },
            data: { endedAt: new Date() }
        })
        return NextResponse.json(session)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to finish session' }, { status: 500 })
    }
}
