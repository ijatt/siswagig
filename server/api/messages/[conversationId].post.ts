import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const { conversationId } = event.context.params as { conversationId: string }
    const body = await readBody<{
      content: string
      sender_id: number
      attachments?: Array<{ file_url: string; file_name: string; file_type: string }>
    }>(event)

    if (!body.content || !body.sender_id) {
      return createError({ statusCode: 400, statusMessage: 'Missing required fields' })
    }

    const message = await prisma.message.create({
      data: {
        conversation_id: parseInt(conversationId),
        sender_id: body.sender_id,
        content: body.content,
        attachments: {
          createMany: {
            data: body.attachments || []
          }
        }
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
      }
    })

    return message
  } catch (err) {
    console.error(err)
    return createError({ statusCode: 500, statusMessage: 'Unable to create message' })
  }
})
