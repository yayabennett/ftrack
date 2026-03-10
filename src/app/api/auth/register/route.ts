import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { email, password, name, migrateUserId } = await req.json()

        if (!email || !password) {
            return new NextResponse('Missing email or password', { status: 400 })
        }

        const lowerEmail = email.toLowerCase()

        const existing = await prisma.user.findUnique({ where: { email: lowerEmail } })
        if (existing) {
            return new NextResponse('Email already in use', { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const cookieStore = await cookies()
        const cookieMigrateUserId = cookieStore.get('ftrack-user-id')?.value
        const actualMigrateUserId = migrateUserId || cookieMigrateUserId

        if (actualMigrateUserId) {
            // Attempt to migrate existing local-only user (the initial "Bennett" or generated cookie users)
            const localUser = await prisma.user.findUnique({ where: { id: actualMigrateUserId } })
            if (localUser && !localUser.email) {
                const updated = await prisma.user.update({
                    where: { id: actualMigrateUserId },
                    data: {
                        email: lowerEmail,
                        password: hashedPassword,
                        name: name || localUser.name
                    }
                })
                return NextResponse.json(updated)
            }
        }

        // Create brand new user
        const newUser = await prisma.user.create({
            data: {
                email: lowerEmail,
                name,
                password: hashedPassword,
                isOnboarded: true
            }
        })
        return NextResponse.json(newUser)
    } catch (error) {
        console.error('Registration Error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
