import prisma from '~~/server/db/prisma'
import { verifyToken } from '~~/server/utils/verify-token'

// Get payment by ID
export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const userId = await checkAccessToken(event);

    if (!userId)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    const paymentId = parseInt(event.context.params?.id as string)

    if (isNaN(paymentId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid payment ID' })
    }

    // Get the payment with related data
    const payment = await prisma.payment.findUnique({
      where: { payment_id: paymentId },
      include: {
        application: {
          include: {
            job: {
              select: {
                job_id: true,
                title: true,
                status: true,
                image_url: true
              }
            }
          }
        },
        client: {
          select: {
            user_id: true,
            name: true,
            email: true,
            image_url: true
          }
        },
        freelancer: {
          select: {
            user_id: true,
            name: true,
            email: true,
            image_url: true
          }
        }
      }
    })

    if (!payment) {
      throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
    }

    // Verify user is either client or freelancer
    if (payment.client_id !== userId && payment.freelancer_id !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Access denied' })
    }

    return {
      success: true,
      payment: {
        payment_id: payment.payment_id,
        application_id: payment.application_id,
        amount: payment.amount / 100,
        platform_fee: payment.platform_fee / 100,
        freelancer_amount: payment.freelancer_amount / 100,
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        paid_at: payment.paid_at,
        released_at: payment.released_at,
        refunded_at: payment.refunded_at,
        created_at: payment.created_at,
        job: payment.application.job,
        client: payment.client,
        freelancer: payment.freelancer,
        application_status: payment.application.status
      }
    }
  } catch (error: any) {
    console.error('Get payment error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to get payment'
    })
  }
})
