import { PrismaClient, Equipment, MuscleGroup } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // ─── Default user ────────────────────────────────────────────────────────
    const defaultEmail = 'athlete@iTrack.app'
    const existingUser = await prisma.user.findUnique({ where: { email: defaultEmail } })
    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('champion123', 12)
        await prisma.user.create({
            data: {
                email: defaultEmail,
                name: 'Athlet',
                password: hashedPassword,
            },
        })
        console.log(`Created default user: ${defaultEmail} / champion123`)
    } else {
        console.log('Default user already exists — skipping.')
    }

    // Extensive list of exercises categorized by primary muscle group
    const exercises = [
        // CHEST (Push)
        { name: 'Bankdrücken (Langhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL },
        { name: 'Bankdrücken (Kurzhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL },
        { name: 'Schrägbankdrücken (Langhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL },
        { name: 'Schrägbankdrücken (Kurzhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL },
        { name: 'Brustpresse (Maschine)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.MACHINE },
        { name: 'Incline Brustpresse (Maschine)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.MACHINE },
        { name: 'Decline Bankdrücken', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL },
        { name: 'Butterfly (Maschine)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.MACHINE },
        { name: 'Cable Crossovers (High-to-Low)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.CABLE },
        { name: 'Cable Crossovers (Low-to-High)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.CABLE },
        { name: 'Liegestütze', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT },
        { name: 'Dips (Brust-Fokus)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT },

        // SHOULDERS (Push)
        { name: 'Military Press / Schulterdrücken (Langhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL },
        { name: 'Schulterdrücken (Kurzhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },
        { name: 'Schulterpresse (Maschine)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.MACHINE },
        { name: 'Arnold Press', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },
        { name: 'Seitheben (Kurzhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },
        { name: 'Seitheben (Kabelzug)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE },
        { name: 'Seitheben (Maschine)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.MACHINE },
        { name: 'Frontheben (Kurzhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },
        { name: 'Frontheben (Kabelzug)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE },
        { name: 'Aufrechtes Rudern / Upright Row', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL },
        { name: 'Face Pulls', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE },
        { name: 'Reverse Butterfly (Maschine)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.MACHINE },
        { name: 'Reverse Butterfly (Kurzhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },

        // TRICEPS (Push)
        { name: 'Trizepsdrücken (Kabelzug / Seil)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE },
        { name: 'Trizepsdrücken (Kabelzug / Stange)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE },
        { name: 'Trizepsdrücken über Kopf (Kabelzug)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE },
        { name: 'French Press / Skullcrushers (SZ-Stange)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL },
        { name: 'Trizeps-Kickbacks (Kurzhantel)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.DUMBBELL },
        { name: 'Enges Bankdrücken', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL },
        { name: 'Dips (Trizeps-Fokus)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BODYWEIGHT },
        { name: 'Trizeps Extension (Maschine)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.MACHINE },

        // BACK (Pull)
        { name: 'Kreuzheben / Deadlifts (Langhantel)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL },
        { name: 'Sumo Kreuzheben', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL },
        { name: 'Klimmzüge / Pull-ups', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT },
        { name: 'Chin-ups (Untergriff)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT },
        { name: 'Latzug (Breit)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE },
        { name: 'Latzug (V-Griff)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE },
        { name: 'Latzug (Enger Griff / Untergriff)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE },
        { name: 'Langhantelrudern', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL },
        { name: 'Kurzhantelrudern (Einarmig)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.DUMBBELL },
        { name: 'T-Bar Rudern', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE },
        { name: 'Kabelrudern (Sitzend / V-Griff)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE },
        { name: 'Kabelrudern (Breit)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE },
        { name: 'Rudermaschine (Brustgestützt)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE },
        { name: 'Pullover (Kabelzug / Straight Arm)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE },
        { name: 'Hyperextensions', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT },

        // BICEPS (Pull)
        { name: 'Bizepscurls (Langhantel)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL },
        { name: 'Bizepscurls (Kurzhantel)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL },
        { name: 'Hammercurls (Kurzhantel)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL },
        { name: 'Hammercurls (Kabelzug / Seil)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.CABLE },
        { name: 'Bizepscurls (Kabelzug)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.CABLE },
        { name: 'Preacher Curls (SZ-Stange)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL },
        { name: 'Preacher Curls (Maschine)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.MACHINE },
        { name: 'Incline Curls (Kurzhantel)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL },
        { name: 'Concentration Curls', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL },

        // LEGS (Quads, Hamstrings, Glutes, Calves)
        { name: 'Kniebeugen / Squats (Langhantel)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.BARBELL },
        { name: 'Beinpresse (45 Grad)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.MACHINE },
        { name: 'Beinpresse (Sitzend)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.MACHINE },
        { name: 'Bulgarian Split Squats (Kurzhanteln)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.DUMBBELL },
        { name: 'Ausfallschritte / Lunges', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.DUMBBELL },
        { name: 'Walking Lunges', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.BODYWEIGHT },
        { name: 'Beinstrecker / Leg Extension', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.MACHINE },
        { name: 'Vordere Kniebeugen / Front Squats', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.BARBELL },
        { name: 'Hackenschmidt Kniebeuge / Hack Squat', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.MACHINE },
        { name: 'Rumänisches Kreuzheben / RDLs', muscleGroup: MuscleGroup.HAMS, equipment: Equipment.BARBELL },
        { name: 'Beinbeuger / Leg Curls (Sitzend)', muscleGroup: MuscleGroup.HAMS, equipment: Equipment.MACHINE },
        { name: 'Beinbeuger / Leg Curls (Liegend)', muscleGroup: MuscleGroup.HAMS, equipment: Equipment.MACHINE },
        { name: 'Hip Thrusts (Langhantel)', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.BARBELL },
        { name: 'Hip Thrusts (Maschine)', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.MACHINE },
        { name: 'Glute Kickbacks (Kabelzug)', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.CABLE },
        { name: 'Abduktoren Maschine', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.MACHINE },
        { name: 'Adduktoren Maschine', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.MACHINE },
        { name: 'Wadenheben stehend (Barbell)', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.BARBELL },
        { name: 'Wadenheben stehend (Maschine)', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE },
        { name: 'Wadenheben sitzend (Maschine)', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE },

        // CORE 
        { name: 'Crunches', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
        { name: 'Crunches (Kabelzug)', muscleGroup: MuscleGroup.ABS, equipment: Equipment.CABLE },
        { name: 'Beinheben hängend', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
        { name: 'Beinheben sitzend (Maschine)', muscleGroup: MuscleGroup.ABS, equipment: Equipment.MACHINE },
        { name: 'Plank', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
        { name: 'Russian Twists', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
        { name: 'Ab Wheel Rollouts', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
    ]

    for (const ex of exercises) {
        // Upsert to avoid duplicates if seed is run multiple times
        // We use name as a unique identifier for seeding purposes here
        const existing = await prisma.exercise.findFirst({
            where: { name: ex.name }
        })

        if (!existing) {
            await prisma.exercise.create({
                data: ex,
            })
        } else {
            // Update muscle group just in case
            await prisma.exercise.update({
                where: { id: existing.id },
                data: ex
            })
        }
    }

    console.log(`Seeded ${exercises.length} exercises completed.`)
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
