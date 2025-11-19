import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()

  try {
    const { id } = event.context.params as { id: string }
    const application_id = Number(id)

    const body = await readBody<{ status?: string }>(event)

    if (!body || !body.status) return createError({ statusCode: 400, statusMessage: 'Missing status in request body' })

    const allowed = ['Pending', 'Interview', 'Hired', 'Rejected']
    if (!allowed.includes(body.status)) return createError({ statusCode: 400, statusMessage: 'Invalid status' })

    const updated = await prisma.application.update({
      where: { application_id },
      data: {
        status: body.status as any
      },
      include: {
        user: {
          select: {
            name: true,
            image_url: true,
            user_id: true,
            userSkills: {
              select: {
                skill: true
              }
            }
          }
        },
        job: {
          include: {
            user: {
              select: {
                name: true,
                image_url: true,
                user_id: true
              }
            }
          }
        }
      }
    })

    // If status is set to "Hired", create conversation and send automatic message
    if (body.status === 'Hired') {
      const clientId = updated.job.user.user_id
      const freelancerId = updated.user.user_id
      const jobTitle = updated.job.title
      const clientName = updated.job.user.name

      // Create or get existing conversation
      let conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            {
              AND: [
                { participant1_id: clientId },
                { participant2_id: freelancerId }
              ]
            },
            {
              AND: [
                { participant1_id: freelancerId },
                { participant2_id: clientId }
              ]
            }
          ]
        }
      })

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participant1_id: clientId,
            participant2_id: freelancerId
          }
        })
      }

      // Send automatic message from client to freelancer
      await prisma.message.create({
        data: {
          conversation_id: conversation.conversation_id,
          sender_id: clientId,
          content: `Congratulations! You have been hired for the job "${jobTitle}". Let's discuss the project details.`
        }
      })
    }

    return updated
  } catch (err) {
    console.error(err)
    return createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
