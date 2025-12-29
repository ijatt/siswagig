import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()

  try {
    const user_id = await checkAccessToken(event)
    if (!user_id) {
      return createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // Mark all notifications as read for this user
    await prisma.notification.updateMany({
      where: {
        user_id: Number(user_id),
        is_read: false
      },
      data: {
        is_read: true
      }
    })

    return { success: true }
  } catch (err) {
    console.error('Error marking all notifications as read:', err)
    return createError({ statusCode: 500, statusMessage: 'Failed to update notifications' })
  } finally {
    await prisma.$disconnect()
  }
})
