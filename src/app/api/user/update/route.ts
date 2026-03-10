import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const { image, name, weight, height, age } = await request.json()

        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(image !== undefined && { image }),
                ...(name !== undefined && { name }),
                ...(weight !== undefined && { weight }),
                ...(height !== undefined && { height }),
                ...(age !== undefined && { age }),
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error(error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
