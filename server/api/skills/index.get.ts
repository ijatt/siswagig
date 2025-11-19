import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const skills = await prisma.skill.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return skills
  } catch (err) {
    return createError({ statusCode: 500, statusMessage: 'Unable to fetch skills' })
  }
})
