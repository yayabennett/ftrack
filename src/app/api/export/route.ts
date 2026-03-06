import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        // Fetch all user data in a nested tree structure
        const [sessions, templates, exercises] = await Promise.all([
            prisma.workoutSession.findMany({
                include: {
                    exercises: {
                        include: {
                            exercise: true,
                            sets: true
                        }
                    }
                }
            }),
            prisma.template.findMany({
                include: {
                    exercises: {
                        include: {
                            exercise: true
                        }
                    }
                }
            }),
            // Only user-created custom exercises
            prisma.exercise.findMany({
                where: { isCustom: true }
            })
        ])

        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            data: {
                sessions,
                templates,
                customExercises: exercises
            }
        }

        // Return as a downloadable JSON file
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="workout-data-${new Date().toISOString().split('T')[0]}.json"`,
            },
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
    }
}
