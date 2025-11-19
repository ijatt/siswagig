import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const { userId } = event.context.params as { userId: string }
    const userIdNum = parseInt(userId)
    
    // Get all conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1_id: userIdNum },
          { participant2_id: userIdNum }
        ]
      },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                user_id: true,
                name: true,
                image_url: true,
                role: true
              }
            },
          },
        }
      },
      orderBy: {
        updated_at: 'desc'
      }
    })

    return conversations
  } catch (err) {
    console.error(err)
    return createError({ statusCode: 500, statusMessage: 'Unable to fetch conversations' })
  }
})
