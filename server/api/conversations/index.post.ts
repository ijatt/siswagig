import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const body = await readBody<{
      participant1_id: number
      participant2_id: number
    }>(event)

    if (!body.participant1_id || !body.participant2_id) {
      return createError({ statusCode: 400, statusMessage: 'Missing participant IDs' })
    }

    // Check if conversation already exists between these two users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            AND: [
              { participant1_id: body.participant1_id },
              { participant2_id: body.participant2_id }
            ]
          },
          {
            AND: [
              { participant1_id: body.participant2_id },
              { participant2_id: body.participant1_id }
            ]
          }
        ]
      }
    })

    if (existingConversation) {
      return existingConversation
    }

    // Create new conversation with participants
    const conversation = await prisma.conversation.create({
      data: {
        participant1_id: body.participant1_id,
        participant2_id: body.participant2_id
      }
    })

    return conversation
  } catch (err) {
    console.error(err)
    return createError({ statusCode: 500, statusMessage: 'Unable to create conversation' })
  }
})
