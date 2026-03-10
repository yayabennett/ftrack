import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Creating ENUM types...')
    try {
        await prisma.$executeRawUnsafe(`CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');`)
    } catch (e) { console.log('Gender enum may already exist') }

    try {
        await prisma.$executeRawUnsafe(`CREATE TYPE "Goal" AS ENUM ('muscle_gain', 'weight_loss', 'maintenance', 'strength');`)
    } catch (e) { console.log('Goal enum may already exist') }

    try {
        await prisma.$executeRawUnsafe(`CREATE TYPE "ExperienceLevel" AS ENUM ('beginner', 'intermediate', 'advanced');`)
    } catch (e) { console.log('ExperienceLevel enum may already exist') }

    try {
        await prisma.$executeRawUnsafe(`CREATE TYPE "Equipment" AS ENUM ('Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight');`)
    } catch (e) { console.log('Equipment enum may already exist') }

    try {
        await prisma.$executeRawUnsafe(`CREATE TYPE "MuscleGroup" AS ENUM ('Brust', 'Rücken', 'Beine (Quads)', 'Beine (Hams)', 'Schultern', 'Bizeps', 'Trizeps', 'Bauch', 'Waden', 'Po / Glutes', 'Ganzkörper');`)
    } catch (e) { console.log('MuscleGroup enum may already exist') }

    console.log('Altering User table...')
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "gender" TYPE "Gender" USING "gender"::"text"::"Gender";`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "goal" TYPE "Goal" USING "goal"::"text"::"Goal";`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "experienceLevel" TYPE "ExperienceLevel" USING "experienceLevel"::"text"::"ExperienceLevel";`)

    console.log('Altering Exercise table...')
    await prisma.$executeRawUnsafe(`ALTER TABLE "Exercise" ALTER COLUMN "muscleGroup" TYPE "MuscleGroup" USING "muscleGroup"::"text"::"MuscleGroup";`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "Exercise" ALTER COLUMN "equipment" TYPE "Equipment" USING "equipment"::"text"::"Equipment";`)

    console.log('Migration Complete!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
