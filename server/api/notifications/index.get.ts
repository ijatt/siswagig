import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()

  try {
    const user_id = await checkAccessToken(event)
    if (!user_id) {
      return createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const query = getQuery(event)
    const limit = Number(query.limit) || 20
    const unreadOnly = query.unreadOnly === 'true'

    // Fetch notifications for the user
    const notifications = await prisma.notification.findMany({
      where: {
        user_id: Number(user_id),
        ...(unreadOnly ? { is_read: false } : {})
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    })

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        user_id: Number(user_id),
        is_read: false
      }
    })

    return {
      notifications,
      unreadCount
    }
  } catch (err) {
    console.error('Error fetching notifications:', err)
    return createError({ statusCode: 500, statusMessage: 'Failed to fetch notifications' })
  } finally {
    await prisma.$disconnect()
  }
})
