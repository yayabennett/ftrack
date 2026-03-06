import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Extensive list of exercises categorized by primary muscle group
    const exercises = [
        // CHEST (Push)
        { name: 'Bankdrücken (Langhantel)', muscleGroup: 'Brust', equipment: 'Barbell' },
        { name: 'Bankdrücken (Kurzhantel)', muscleGroup: 'Brust', equipment: 'Dumbbell' },
        { name: 'Schrägbankdrücken (Langhantel)', muscleGroup: 'Brust', equipment: 'Barbell' },
        { name: 'Schrägbankdrücken (Kurzhantel)', muscleGroup: 'Brust', equipment: 'Dumbbell' },
        { name: 'Brustpresse (Maschine)', muscleGroup: 'Brust', equipment: 'Machine' },
        { name: 'Butterfly (Maschine)', muscleGroup: 'Brust', equipment: 'Machine' },
        { name: 'Cable Crossovers', muscleGroup: 'Brust', equipment: 'Cable' },
        { name: 'Liegestütze', muscleGroup: 'Brust', equipment: 'Bodyweight' },
        { name: 'Dips (Brust-Fokus)', muscleGroup: 'Brust', equipment: 'Bodyweight' },

        // SHOULDERS (Push)
        { name: 'Military Press / Schulterdrücken (Langhantel)', muscleGroup: 'Schultern', equipment: 'Barbell' },
        { name: 'Schulterdrücken (Kurzhantel)', muscleGroup: 'Schultern', equipment: 'Dumbbell' },
        { name: 'Schulterpresse (Maschine)', muscleGroup: 'Schultern', equipment: 'Machine' },
        { name: 'Seitheben (Kurzhantel)', muscleGroup: 'Schultern', equipment: 'Dumbbell' },
        { name: 'Seitheben (Kabelzug)', muscleGroup: 'Schultern', equipment: 'Cable' },
        { name: 'Frontheben (Kurzhantel)', muscleGroup: 'Schultern', equipment: 'Dumbbell' },
        { name: 'Face Pulls', muscleGroup: 'Schultern', equipment: 'Cable' },
        { name: 'Reverse Butterfly (Maschine)', muscleGroup: 'Schultern', equipment: 'Machine' },

        // TRICEPS (Push)
        { name: 'Trizepsdrücken (Kabelzug)', muscleGroup: 'Trizeps', equipment: 'Cable' },
        { name: 'Trizepsdrücken über Kopf (Kabelzug)', muscleGroup: 'Trizeps', equipment: 'Cable' },
        { name: 'French Press / Skullcrushers (SZ-Stange)', muscleGroup: 'Trizeps', equipment: 'Barbell' },
        { name: 'Trizeps-Kickbacks (Kurzhantel)', muscleGroup: 'Trizeps', equipment: 'Dumbbell' },
        { name: 'Enges Bankdrücken', muscleGroup: 'Trizeps', equipment: 'Barbell' },
        { name: 'Dips (Trizeps-Fokus)', muscleGroup: 'Trizeps', equipment: 'Bodyweight' },

        // BACK (Pull)
        { name: 'Kreuzheben / Deadlifts (Langhantel)', muscleGroup: 'Rücken', equipment: 'Barbell' },
        { name: 'Klimmzüge / Pull-ups', muscleGroup: 'Rücken', equipment: 'Bodyweight' },
        { name: 'Latzug (Breit)', muscleGroup: 'Rücken', equipment: 'Machine' },
        { name: 'Latzug (Enger Griff)', muscleGroup: 'Rücken', equipment: 'Machine' },
        { name: 'Langhantelrudern', muscleGroup: 'Rücken', equipment: 'Barbell' },
        { name: 'Kurzhantelrudern (Einarmig)', muscleGroup: 'Rücken', equipment: 'Dumbbell' },
        { name: 'T-Bar Rudern', muscleGroup: 'Rücken', equipment: 'Machine' },
        { name: 'Kabelrudern (Sitzend)', muscleGroup: 'Rücken', equipment: 'Cable' },
        { name: 'Rudermaschine (Brustgestützt)', muscleGroup: 'Rücken', equipment: 'Machine' },
        { name: 'Pullover (Kabelzug)', muscleGroup: 'Rücken', equipment: 'Cable' },
        { name: 'Hyperextensions', muscleGroup: 'Rücken', equipment: 'Bodyweight' },

        // BICEPS (Pull)
        { name: 'Bizepscurls (Langhantel)', muscleGroup: 'Bizeps', equipment: 'Barbell' },
        { name: 'Bizepscurls (Kurzhantel)', muscleGroup: 'Bizeps', equipment: 'Dumbbell' },
        { name: 'Hammercurls (Kurzhantel)', muscleGroup: 'Bizeps', equipment: 'Dumbbell' },
        { name: 'Bizepscurls (Kabelzug)', muscleGroup: 'Bizeps', equipment: 'Cable' },
        { name: 'Preacher Curls (SZ-Stange)', muscleGroup: 'Bizeps', equipment: 'Barbell' },
        { name: 'Incline Curls (Kurzhantel)', muscleGroup: 'Bizeps', equipment: 'Dumbbell' },

        // LEGS (Quads, Hamstrings, Glutes, Calves)
        { name: 'Kniebeugen / Squats (Langhantel)', muscleGroup: 'Beine (Quads)', equipment: 'Barbell' },
        { name: 'Beinpresse / Leg Press', muscleGroup: 'Beine (Quads)', equipment: 'Machine' },
        { name: 'Bulgarian Split Squats', muscleGroup: 'Beine (Quads)', equipment: 'Dumbbell' },
        { name: 'Ausfallschritte / Lunges', muscleGroup: 'Beine (Quads)', equipment: 'Dumbbell' },
        { name: 'Beinstrecker / Leg Extension', muscleGroup: 'Beine (Quads)', equipment: 'Machine' },
        { name: 'Vordere Kniebeugen / Front Squats', muscleGroup: 'Beine (Quads)', equipment: 'Barbell' },
        { name: 'Hackenschmidt Kniebeuge / Hack Squat', muscleGroup: 'Beine (Quads)', equipment: 'Machine' },
        { name: 'Rumänisches Kreuzheben / RDLs', muscleGroup: 'Beine (Hams)', equipment: 'Barbell' },
        { name: 'Beinbeuger / Leg Curls (Sitzend)', muscleGroup: 'Beine (Hams)', equipment: 'Machine' },
        { name: 'Beinbeuger / Leg Curls (Liegend)', muscleGroup: 'Beine (Hams)', equipment: 'Machine' },
        { name: 'Hip Thrusts (Langhantel)', muscleGroup: 'Po / Glutes', equipment: 'Barbell' },
        { name: 'Glute Kickbacks (Kabelzug)', muscleGroup: 'Po / Glutes', equipment: 'Cable' },
        { name: 'Wadenheben stehend (Barbell)', muscleGroup: 'Waden', equipment: 'Barbell' },
        { name: 'Wadenheben stehend (Maschine)', muscleGroup: 'Waden', equipment: 'Machine' },
        { name: 'Wadenheben sitzend (Maschine)', muscleGroup: 'Waden', equipment: 'Machine' },

        // CORE 
        { name: 'Crunches', muscleGroup: 'Bauch', equipment: 'Bodyweight' },
        { name: 'Crunches (Kabelzug)', muscleGroup: 'Bauch', equipment: 'Cable' },
        { name: 'Beinheben hängend', muscleGroup: 'Bauch', equipment: 'Bodyweight' },
        { name: 'Plank', muscleGroup: 'Bauch', equipment: 'Bodyweight' },
        { name: 'Russian Twists', muscleGroup: 'Bauch', equipment: 'Bodyweight' },
        { name: 'Ab Wheel Rollouts', muscleGroup: 'Bauch', equipment: 'Bodyweight' },
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
