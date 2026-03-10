import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { RegisterInput, OnboardingInput } from '../validations/auth'

export class UserService {
    static async isEmailTaken(email: string) {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })
        return !!user
    }

    static async registerAndOnboard(data: RegisterInput, migrateUserId?: string | null) {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        const lowerEmail = data.email.toLowerCase()

        // 1. Check if we should migrate an existing local user
        if (migrateUserId) {
            const localUser = await prisma.user.findUnique({ where: { id: migrateUserId } })
            if (localUser && !localUser.email) {
                return await prisma.user.update({
                    where: { id: migrateUserId },
                    data: {
                        email: lowerEmail,
                        password: hashedPassword,
                        name: data.name,
                        age: data.age,
                        weight: data.weight,
                        height: data.height,
                        gender: data.gender,
                        goal: data.goal,
                        experienceLevel: data.experienceLevel,
                        isOnboarded: true,
                    }
                })
            }
        }

        // 2. Otherwise create brand new user
        return await prisma.user.create({
            data: {
                email: lowerEmail,
                password: hashedPassword,
                name: data.name,
                age: data.age,
                weight: data.weight,
                height: data.height,
                gender: data.gender,
                goal: data.goal,
                experienceLevel: data.experienceLevel,
                isOnboarded: true,
            }
        })
    }

    static async updateOnboarding(userId: string, data: OnboardingInput) {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
                isOnboarded: true
            }
        })
    }

    static async findById(id: string) {
        return await prisma.user.findUnique({ where: { id } })
    }
}
