import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()

  try {
    const user_id = await checkAccessToken(event)
    if (!user_id) {
      return createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const notificationId = getRouterParam(event, 'id')
    
    if (!notificationId) {
      return createError({ statusCode: 400, statusMessage: 'Notification ID required' })
    }

    // Mark single notification as read
    const notification = await prisma.notification.updateMany({
      where: {
        notification_id: Number(notificationId),
        user_id: Number(user_id) // Ensure user owns this notification
      },
      data: {
        is_read: true
      }
    })

    if (notification.count === 0) {
      return createError({ statusCode: 404, statusMessage: 'Notification not found' })
    }

    return { success: true }
  } catch (err) {
    console.error('Error marking notification as read:', err)
    return createError({ statusCode: 500, statusMessage: 'Failed to update notification' })
  } finally {
    await prisma.$disconnect()
  }
})
