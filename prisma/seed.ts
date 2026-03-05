import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const exercises = [
        { name: 'Bench Press (Barbell)', muscleGroup: 'Chest', equipment: 'Barbell' },
        { name: 'Squat (Barbell)', muscleGroup: 'Legs', equipment: 'Barbell' },
        { name: 'Deadlift (Barbell)', muscleGroup: 'Back', equipment: 'Barbell' },
        { name: 'Overhead Press (Dumbbell)', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
        { name: 'Pull Up', muscleGroup: 'Back', equipment: 'Bodyweight' },
        { name: 'Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbell' },
        { name: 'Incline Bench Press (Dumbbell)', muscleGroup: 'Chest', equipment: 'Dumbbell' },
        { name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine' },
        { name: 'Romanian Deadlift (Barbell)', muscleGroup: 'Legs', equipment: 'Barbell' },
        { name: 'Bicep Curl (Dumbbell)', muscleGroup: 'Arms', equipment: 'Dumbbell' },
        { name: 'Tricep Extension (Cable)', muscleGroup: 'Arms', equipment: 'Cable' },
        { name: 'Lateral Raise (Dumbbell)', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    ]

    for (const ex of exercises) {
        await prisma.exercise.create({
            data: ex,
        })
    }

    console.log('Seed completed')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
