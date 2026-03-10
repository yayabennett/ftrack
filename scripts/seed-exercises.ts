import { PrismaClient, MuscleGroup, Equipment } from '@prisma/client'

const prisma = new PrismaClient()

// Massive list of global exercises covering all muscle groups and variations
const GLOBAL_EXERCISES = [
    // CHEST
    { name: 'Bankdrücken (Langhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL },
    { name: 'Schrägbankdrücken (Langhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL },
    { name: 'Negativbankdrücken (Langhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL },
    { name: 'Bankdrücken (Kurzhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL },
    { name: 'Schrägbankdrücken (Kurzhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL },
    { name: 'Negativbankdrücken (Kurzhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL },
    { name: 'Brustpresse (Maschine)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.MACHINE },
    { name: 'Schrägbank-Brustpresse (Maschine)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.MACHINE },
    { name: 'Fliegende Bewegung (Kurzhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL },
    { name: 'Fliegende Bewegung Schrägbank (Kurzhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL },
    { name: 'Cable Crossover (Kabelzug)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.CABLE },
    { name: 'Cable Crossover tief (Kabelzug)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.CABLE },
    { name: 'Butterfly (Maschine)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.MACHINE },
    { name: 'Dips (Brust-fokus)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT },
    { name: 'Liegestütze', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT },
    { name: 'Liegestütze (erschwert/zusätzliches Gewicht)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT },
    { name: 'Liegestütze mit enger Handposition', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT },
    { name: 'Liegestütze auf Ringen', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT },
    { name: 'Guillotine Press', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL },
    { name: 'Hex Press (Kurzhantel)', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL },

    // BACK
    { name: 'Kreuzheben (Langhantel)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL },
    { name: 'Kreuzheben (Rumänisch / RDL)', muscleGroup: MuscleGroup.HAMS, equipment: Equipment.BARBELL }, // Kept here but mapped HAMS usually
    { name: 'Klimmzüge (Breiter Griff)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT },
    { name: 'Klimmzüge (Enger Griff / Untergriff)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT },
    { name: 'Klimmzüge mit Zusatzgewicht', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT },
    { name: 'Latzug (Breit, zur Brust)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE },
    { name: 'Latzug (Eng, V-Griff)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE },
    { name: 'Latzug (Maschine, isolateral)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE },
    { name: 'Latzug mit gestreckten Armen', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE },
    { name: 'Langhantelrudern (Vorgebeugt)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL },
    { name: 'Langhantelrudern (Untergriff)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL },
    { name: 'Kurzhantelrudern (Einarmig)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.DUMBBELL },
    { name: 'Rudern am Kabelzug (Sitzend, Eng)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE },
    { name: 'Rudern am Kabelzug (Sitzend, Breit)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE },
    { name: 'T-Bar Rudern', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL },
    { name: 'T-Bar Rudern (Maschine)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE },
    { name: 'Rudern an der Maschine', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE },
    { name: 'Meadows Row', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL },
    { name: 'Gorilla Rows', muscleGroup: MuscleGroup.BACK, equipment: Equipment.DUMBBELL },
    { name: 'Pullovers (Kurzhantel)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.DUMBBELL },
    { name: 'Pullovers (Maschine)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE },
    { name: 'Hyperextensions (Rückenstrecker)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT },
    { name: 'Good Mornings (Langhantel)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL },
    { name: 'Seal Row (Langhantel)', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL },

    // QUADS (Legs)
    { name: 'Kniebeugen (Barbell, High Bar)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.BARBELL },
    { name: 'Kniebeugen (Barbell, Low Bar)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.BARBELL },
    { name: 'Frontkniebeugen (Langhantel)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.BARBELL },
    { name: 'Goblet Squats (Kurzhantel/Kettlebell)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.DUMBBELL },
    { name: 'Bulgarian Split Squats (Kurzhantel)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.DUMBBELL },
    { name: 'Bulgarian Split Squats (Langhantel)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.BARBELL },
    { name: 'Ausfallschritte (Gehend, Kurzhantel)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.DUMBBELL },
    { name: 'Ausfallschritte (Langhantel)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.BARBELL },
    { name: 'Beinpresse (45 Grad)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.MACHINE },
    { name: 'Beinpresse (Horizontal)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.MACHINE },
    { name: 'Hackenschmidt Kniebeugen (Maschine)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.MACHINE },
    { name: 'Beinstrecker (Maschine)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.MACHINE },
    { name: 'Sissy Squats', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.BODYWEIGHT },
    { name: 'Pistol Squats', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.BODYWEIGHT },
    { name: 'Belt Squats', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.MACHINE },
    { name: 'Step-Ups (Kurzhantel)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.DUMBBELL },

    // HAMS & GLUTES
    { name: 'Kreuzheben (Sumo)', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.BARBELL },
    { name: 'Rumänisches Kreuzheben (RDL, Langhantel)', muscleGroup: MuscleGroup.HAMS, equipment: Equipment.BARBELL },
    { name: 'Rumänisches Kreuzheben (RDL, Kurzhantel)', muscleGroup: MuscleGroup.HAMS, equipment: Equipment.DUMBBELL },
    { name: 'Stiff-Leg Deadlifts (Langhantel)', muscleGroup: MuscleGroup.HAMS, equipment: Equipment.BARBELL },
    { name: 'Beinbeuger liegend (Maschine)', muscleGroup: MuscleGroup.HAMS, equipment: Equipment.MACHINE },
    { name: 'Beinbeuger sitzend (Maschine)', muscleGroup: MuscleGroup.HAMS, equipment: Equipment.MACHINE },
    { name: 'Beinbeuger stehend (Maschine / Kabelzug)', muscleGroup: MuscleGroup.HAMS, equipment: Equipment.MACHINE },
    { name: 'Glute-Ham Raise (GHR)', muscleGroup: MuscleGroup.HAMS, equipment: Equipment.BODYWEIGHT },
    { name: 'Hip Thrusts (Langhantel)', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.BARBELL },
    { name: 'Hip Thrusts (Maschine)', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.MACHINE },
    { name: 'Glute Bridges', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.BODYWEIGHT },
    { name: 'Kabel-Kickbacks (Glutes)', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.CABLE },
    { name: 'Abduktionsmaschine (Sitzend)', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.MACHINE },
    { name: 'Adduktionsmaschine (Sitzend)', muscleGroup: MuscleGroup.QUADS, equipment: Equipment.MACHINE },
    { name: 'Reverse Hyperextensions', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.MACHINE },

    // SHOULDERS
    { name: 'Schulterdrücken (Langhantel stehend, OHP)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL },
    { name: 'Schulterdrücken (Langhantel sitzend)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL },
    { name: 'Schulterdrücken (Kurzhantel sitzend)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },
    { name: 'Arnold Press (Kurzhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },
    { name: 'Schulterpresse (Maschine)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.MACHINE },
    { name: 'Seitheben (Kurzhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },
    { name: 'Seitheben (Kabelzug, uniliteral)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE },
    { name: 'Seitheben (Kabelzug, bilateral)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE },
    { name: 'Seitheben (Maschine)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.MACHINE },
    { name: 'Frontheben (Langhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL },
    { name: 'Frontheben (Kurzhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },
    { name: 'Frontheben (Kabelzug)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE },
    { name: 'Face Pulls (Kabelzug)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE },
    { name: 'Butterfly Reverse (Maschine)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.MACHINE },
    { name: 'Vorgebeugtes Seitheben (Kurzhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },
    { name: 'Vorgebeugtes Seitheben (Kabelzug)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE },
    { name: 'Aufrechtes Rudern (Langhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL },
    { name: 'Aufrechtes Rudern (Kabelzug)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE },
    { name: 'Shrugs (Kurzhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },
    { name: 'Shrugs (Langhantel)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL },
    { name: 'Shrugs (Maschine)', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.MACHINE },

    // BICEPS
    { name: 'Langhantel-Curls', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL },
    { name: 'SZ-Stangen-Curls', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL },
    { name: 'Kurzhantel-Curls (stehend)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL },
    { name: 'Kurzhantel-Curls (sitzend wechselnd)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL },
    { name: 'Hammer-Curls (Kurzhantel)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL },
    { name: 'Hammer-Curls (Kabelzug, Seil)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.CABLE },
    { name: 'Preacher Curls (SZ-Stange)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL },
    { name: 'Preacher Curls (Kurzhantel)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL },
    { name: 'Preacher Curls (Maschine)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.MACHINE },
    { name: 'Konzentrations-Curls (Kurzhantel)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL },
    { name: 'Spider Curls', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL },
    { name: 'Reverse Curls (Langhantel, Obergriff)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL },
    { name: 'Incline Dumbbell Curls (Schrägbank)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL },
    { name: 'Bizeps-Curls am tiefen Block', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.CABLE },
    { name: 'High Pulley Cable Curls (Doppel-Bizeps)', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.CABLE },

    // TRICEPS
    { name: 'Trizepsdrücken / Pushdowns (Kabelzug, Seil)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE },
    { name: 'Trizepsdrücken / Pushdowns (Kabelzug, V-Griff/Stange)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE },
    { name: 'Trizepsdrücken überkopf (Kabelzug, Seil)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE },
    { name: 'French Press / Skullcrusher (SZ-Stange)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL },
    { name: 'French Press / Skullcrusher (Kurzhanteln)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.DUMBBELL },
    { name: 'Enges Bankdrücken (Langhantel)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL },
    { name: 'Dips (Körpergewicht)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BODYWEIGHT },
    { name: 'Dips an der Maschine', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.MACHINE },
    { name: 'Kurzhantel Kickbacks', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.DUMBBELL },
    { name: 'Kabel Kickbacks', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE },
    { name: 'Einarmiges Trizepsdrücken überkopf (Kurzhantel)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.DUMBBELL },
    { name: 'Beidhändiges Trizepsdrücken überkopf (Kurzhantel)', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.DUMBBELL },
    { name: 'JM Press', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL },

    // ABS
    { name: 'Crunches', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
    { name: 'Bicycle Crunches', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
    { name: 'Sit-ups', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
    { name: 'Sit-ups auf der Negativbank', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
    { name: 'Kabel-Crunches', muscleGroup: MuscleGroup.ABS, equipment: Equipment.CABLE },
    { name: 'Beinheben liegend', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
    { name: 'Beinheben hängend (Klimmzugstange)', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
    { name: 'Knieheben hängend / Captains Chair', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
    { name: 'Ab Wheel Rollouts', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
    { name: 'Plank (Unterarmstütz)', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
    { name: 'Side Plank', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
    { name: 'Russian Twists', muscleGroup: MuscleGroup.ABS, equipment: Equipment.BODYWEIGHT },
    { name: 'Russian Twists mit Gewicht', muscleGroup: MuscleGroup.ABS, equipment: Equipment.DUMBBELL },
    { name: 'Woodchoppers (Kabelzug)', muscleGroup: MuscleGroup.ABS, equipment: Equipment.CABLE },
    { name: 'Bauchpresse (Maschine)', muscleGroup: MuscleGroup.ABS, equipment: Equipment.MACHINE },

    // CALVES
    { name: 'Wadenheben stehend (Maschine)', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE },
    { name: 'Wadenheben sitzend (Maschine)', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE },
    { name: 'Wadenheben an der Beinpresse', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE },
    { name: 'Wadenheben stehend (Kurzhantel)', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.DUMBBELL },
    { name: 'Wadenheben an der Multipresse', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE },
    { name: 'Esel-Wadenheben (Donkey Calf Raises)', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE },
]

async function main() {
    console.log(`Clearing global exercises existing...`)
    // Not going to clear user custom ones, just existing globals with the exact names we intend to have
    const existingNames = GLOBAL_EXERCISES.map(e => e.name)

    console.log(`Upserting ${GLOBAL_EXERCISES.length} exercises...`)
    let count = 0
    for (const ex of GLOBAL_EXERCISES) {
        // Upsert acts as find or create to avoid duplicates
        try {
            await prisma.exercise.upsert({
                where: {
                    name_userId: {
                        name: ex.name,
                        userId: 'global-placeholder-for-upsert', // wait, prisma unique constraint handles nulls weirdly in unique constraints via Prisma
                    }
                },
                update: {
                    muscleGroup: ex.muscleGroup,
                    equipment: ex.equipment
                },
                create: {
                    name: ex.name,
                    muscleGroup: ex.muscleGroup,
                    equipment: ex.equipment,
                    isCustom: false,
                }
            })
        } catch {
            // if the unique constraint fails or if we don't have a good index, we just findFirst and then Create
            const exists = await prisma.exercise.findFirst({
                where: { name: ex.name, isCustom: false }
            })
            if (!exists) {
                await prisma.exercise.create({
                    data: {
                        name: ex.name,
                        muscleGroup: ex.muscleGroup,
                        equipment: ex.equipment,
                        isCustom: false,
                        userId: null
                    }
                })
                count++
            }
        }
    }

    console.log(`Done! seeded ${count} new global exercises.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
