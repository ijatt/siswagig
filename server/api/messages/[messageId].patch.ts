import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const { messageId } = event.context.params as { messageId: string }
    const body = await readBody<{ is_read: boolean }>(event)

    const message = await prisma.message.update({
      where: { message_id: parseInt(messageId) },
      data: {
        is_read: body.is_read
      },
      include: {
        sender: {
          select: {
            user_id: true,
            name: true,
            image_url: true,
            role: true
          }
        }
      }
    })

    return message
  } catch (err) {
    console.error(err)
    return createError({ statusCode: 500, statusMessage: 'Unable to update message' })
  }
})
