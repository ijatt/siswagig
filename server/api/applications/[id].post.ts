import { PrismaClient } from '@prisma/client'
import { createStatusNotification, createWorkSubmittedNotification } from '~~/server/utils/notifications'
import { PaymentStatus } from '~~/server/utils/stripe'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()

  try {
    const { id } = event.context.params as { id: string }
    const application_id = Number(id)

    const body = await readBody<{ status?: string }>(event)

    if (!body || !body.status) return createError({ statusCode: 400, statusMessage: 'Missing status in request body' })

    // Extended status flow:
    // Pending -> Interview/Rejected/Hired
    // Hired -> In Progress (when work starts)
    // In Progress -> Submitted (freelancer submits work)
    // Submitted -> Completed (client approves) or In Progress (client requests revision)
    // Completed -> (final state)
    const allowed = ['Pending', 'Interview', 'Hired', 'Rejected', 'In Progress', 'Submitted', 'Completed', 'Revision']
    if (!allowed.includes(body.status)) return createError({ statusCode: 400, statusMessage: 'Invalid status' })

    const updated = await prisma.application.update({
      where: { application_id },
      data: {
        status: body.status as any,
        // Set completed_at timestamp when status becomes Completed
        ...(body.status === 'Completed' ? { completed_at: new Date() } : {})
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

    const clientId = updated.job.user.user_id
    const freelancerId = updated.user.user_id
    const jobTitle = updated.job.title

    // Helper function to send automatic message
    const sendAutoMessage = async (senderId: number, content: string) => {
      // Get or create conversation
      let conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { AND: [{ participant1_id: clientId }, { participant2_id: freelancerId }] },
            { AND: [{ participant1_id: freelancerId }, { participant2_id: clientId }] }
          ]
        }
      })

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { participant1_id: clientId, participant2_id: freelancerId }
        })
      }

      await prisma.message.create({
        data: {
          conversation_id: conversation.conversation_id,
          sender_id: senderId,
          content
        }
      })
    }

    // Send automatic messages based on status changes
    if (body.status === 'Hired') {
      await sendAutoMessage(clientId, `🎉 Congratulations! You have been hired for the job "${jobTitle}". Let's discuss the project details and get started!`)
      
      // Create notification for freelancer
      await createStatusNotification(freelancerId, 'Hired', jobTitle, updated.job_id, application_id)
      
      // Update job status to In Progress
      await prisma.job.update({
        where: { job_id: updated.job_id },
        data: { status: 'In Progress' }
      })
    }

    if (body.status === 'In Progress') {
      await sendAutoMessage(freelancerId, `📋 I've started working on "${jobTitle}". I'll keep you updated on the progress!`)
      
      // Create notification for client
      await createStatusNotification(clientId, 'In Progress', jobTitle, updated.job_id, application_id)
    }

    if (body.status === 'Submitted') {
      await sendAutoMessage(freelancerId, `✅ I've completed the work for "${jobTitle}" and submitted it for your review. Please check and let me know if everything looks good!`)
      
      // Create notification for client
      await createWorkSubmittedNotification(clientId, updated.user.name, jobTitle, application_id)
    }

    if (body.status === 'Completed') {
      await sendAutoMessage(clientId, `🎊 Great job! The work for "${jobTitle}" has been approved and marked as completed. Thank you for your excellent work!`)
      
      // Create notification for freelancer
      await createStatusNotification(freelancerId, 'Completed', jobTitle, updated.job_id, application_id)
      
      // Update job status to Completed
      await prisma.job.update({
        where: { job_id: updated.job_id },
        data: { status: 'Completed' }
      })

      // Auto-create payment record if not exists
      const existingPayment = await prisma.payment.findUnique({
        where: { application_id }
      })

      if (!existingPayment) {
        // Calculate amounts
        const feePercent = 10 // 10% platform fee
        const amount = updated.price_offered
        const amountCents = Math.round(amount * 100)
        const platformFeeCents = Math.round(amountCents * feePercent / 100)
        const freelancerAmountCents = amountCents - platformFeeCents

        await prisma.payment.create({
          data: {
            application_id: application_id,
            client_id: clientId,
            freelancer_id: freelancerId,
            amount: amountCents,
            platform_fee: platformFeeCents,
            freelancer_amount: freelancerAmountCents,
            currency: 'myr',
            status: PaymentStatus.PENDING,
            description: `Payment for job: ${jobTitle}`
          }
        })

        // Notify client about pending payment
        await prisma.notification.create({
          data: {
            user_id: clientId,
            type: 'payment',
            title: 'Payment Required 💳',
            message: `Please complete the payment of RM${amount.toFixed(2)} for "${jobTitle}" to release funds to the freelancer.`,
            link: `/payments`,
            related_job_id: updated.job_id,
            related_application_id: application_id
          }
        })
      }
    }

    if (body.status === 'Revision') {
      await sendAutoMessage(clientId, `📝 I've reviewed your submission for "${jobTitle}" and would like some revisions. Please check our messages for details.`)
      
      // Create notification for freelancer
      await createStatusNotification(freelancerId, 'Revision', jobTitle, updated.job_id, application_id)
      
      // Set back to In Progress for the freelancer to continue working
      await prisma.application.update({
        where: { application_id },
        data: { status: 'In Progress' }
      })
    }

    if (body.status === 'Rejected') {
      await sendAutoMessage(clientId, `Thank you for your interest in "${jobTitle}". Unfortunately, we've decided to go with another candidate. Best of luck with your future applications!`)
      
      // Create notification for freelancer
      await createStatusNotification(freelancerId, 'Rejected', jobTitle, updated.job_id, application_id)
    }

    if (body.status === 'Interview') {
      // Create notification for freelancer
      await createStatusNotification(freelancerId, 'Interview', jobTitle, updated.job_id, application_id)
    }

    return updated
  } catch (err) {
    console.error(err)
    return createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
