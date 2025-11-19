import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        image_url: true,
        role: true
      },
      take: 50,
      orderBy: {
        name: 'asc'
      }
    })

    return users
  } catch (err) {
    console.error(err)
    return createError({ statusCode: 500, statusMessage: 'Unable to fetch users' })
  }
})
