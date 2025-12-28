import { PrismaClient } from "@prisma/client"

interface CompleteProfileBody {
  user_id: number
  bio: string
  skills: number[]
  location: string
}

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  
  try {
    

    const body = await readBody<CompleteProfileBody>(event)

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { user_id: body.user_id },
      data: {
        bio: body.bio,
        location: body.location,
        profile_completed: true
      }
    })

    // Add skills to user
    if (body.skills && body.skills.length > 0) {
      // Delete existing skills
      await prisma.userSkill.deleteMany({
        where: { user_id: body.user_id }
      })

      // Add new skills
      await prisma.userSkill.createMany({
        data: body.skills.map(skill_id => ({
          user_id: body.user_id,
          skill_id
        }))
      })
    }

    return {
      message: "Profile completed successfully",
      user: updatedUser
    }
  } catch (error) {
    console.error("Error completing profile:", error)
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to complete profile"
    })
  }
})
