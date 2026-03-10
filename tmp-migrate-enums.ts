import prisma from './src/lib/prisma'

async function migrate() {
    try {
        console.log("Migrating legacy Goal values...")

        // Use raw query because the Prisma Client might not be generated with the new enums or might fail to load
        // We want to update the 'goal' column in the 'User' table.
        // The previous values were strings 'weight_loss' and 'maintenance' (or whatever they were mapped to).

        // Actually, let's just try to update them to NULL first if we are unsure, 
        // or to the new mapped strings if we know them.

        const res1 = await prisma.$executeRawUnsafe(`UPDATE "User" SET goal = 'fat_loss' WHERE goal = 'weight_loss'`)
        console.log(`Updated ${res1} users from weight_loss to fat_loss`)

        const res2 = await prisma.$executeRawUnsafe(`UPDATE "User" SET goal = 'general_fitness' WHERE goal = 'maintenance'`)
        console.log(`Updated ${res2} users from maintenance to general_fitness`)

    } catch (error) {
        console.error("Migration failed:", error)
    } finally {
        process.exit()
    }
}

migrate()
