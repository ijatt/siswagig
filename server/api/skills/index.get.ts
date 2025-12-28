import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  try {
    const prisma = new PrismaClient()
    const skills = await prisma.skill.findMany({
      select: {
        skill_id: true,
        name: true
      },
      orderBy: {
        name: 'asc',
      },
    })
    return skills
  } catch (err) {
    console.error("Error fetching skills:", err)
    return createError({ statusCode: 500, statusMessage: 'Unable to fetch skills' })
  }
})
