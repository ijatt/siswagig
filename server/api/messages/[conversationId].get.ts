import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const { conversationId } = event.context.params as { conversationId: string }
    
    const messages = await prisma.message.findMany({
      where: {
        conversation_id: parseInt(conversationId)
      },
      include: {
        sender: {
          select: {
            user_id: true,
            name: true,
            image_url: true,
            role: true
          }
        },
        attachments: true
      },
      orderBy: {
        created_at: 'asc'
      }
    })

    return messages
  } catch (err) {
    console.error(err)
    return createError({ statusCode: 500, statusMessage: 'Unable to fetch messages' })
  }
})
