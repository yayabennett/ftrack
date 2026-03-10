import { z } from 'zod'
import { Gender, Goal, ExperienceLevel } from '@prisma/client'

export const OnboardingSchema = z.object({
    name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
    gender: z.nativeEnum(Gender),
    goal: z.nativeEnum(Goal),
    experienceLevel: z.nativeEnum(ExperienceLevel),
    age: z.coerce.number().int().min(12).max(100),
    weight: z.coerce.number().min(30).max(300),
    height: z.coerce.number().min(100).max(250),
})

export const RegisterSchema = OnboardingSchema.extend({
    email: z.string().email("Ungültige E-Mail Adresse"),
    password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
})

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export type OnboardingInput = z.infer<typeof OnboardingSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
