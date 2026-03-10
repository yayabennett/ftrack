import { UserService } from './src/lib/services/user.service'
import { Gender, Goal, ExperienceLevel } from '@prisma/client'

async function test() {
    try {
        console.log("Testing user registration service...")
        const testData = {
            name: "Test User",
            email: `test-${Date.now()}@example.com`,
            password: "password123",
            age: 25,
            weight: 80,
            height: 180,
            gender: Gender.MALE,
            goal: Goal.MUSCLE_GAIN,
            experienceLevel: ExperienceLevel.BEGINNER
        }

        const user = await UserService.registerAndOnboard(testData)
        console.log("SUCCESS: User created:", user.id)
    } catch (error) {
        console.error("FAILURE: Error during registration:", error)
    } finally {
        process.exit()
    }
}

test()
