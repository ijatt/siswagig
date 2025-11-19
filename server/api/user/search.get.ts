import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const query = getQuery(event)
    const searchTerm = query.q as string

    if (!searchTerm || searchTerm.length < 2) {
      return []
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        image_url: true,
        role: true
      },
      take: 10
    })

    return users
  } catch (err) {
    console.error(err)
    return createError({ statusCode: 500, statusMessage: 'Unable to search users' })
  }
})
