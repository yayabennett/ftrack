import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const OnboardingSchema = z.object({
    name: z.string().min(1),
    age: z.number().int().min(10).max(99),
    weight: z.number().min(20).max(300),
    height: z.number().min(100).max(250),
    gender: z.enum(['male', 'female', 'other']),
    goal: z.enum(['muscle_gain', 'fat_loss', 'strength', 'general_fitness']),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
})

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const result = OnboardingSchema.safeParse(json)

        if (!result.success) {
            return NextResponse.json({ error: result.error.format() }, { status: 400 })
        }

        const data = result.data

        const user = await prisma.user.create({
            data: {
                name: data.name,
                age: data.age,
                weight: data.weight,
                height: data.height,
                gender: data.gender,
                goal: data.goal,
                experienceLevel: data.experienceLevel,
                isOnboarded: true,
            },
        })

        const response = NextResponse.json({ success: true, userId: user.id })

        // Set a long-lived httpOnly cookie with the userId
        response.cookies.set('ftrack-user-id', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
        })

        return response
    } catch (error) {
        console.error('Onboarding error:', error)
        return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
    }
}
