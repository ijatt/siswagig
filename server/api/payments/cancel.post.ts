import prisma from '~~/server/db/prisma'
import { PaymentStatus } from '~~/server/utils/stripe'

interface CancelPaymentBody {
  payment_id: number
}

// Cancel a pending payment (for retrying)
export default defineEventHandler(async (event) => {
  try {
    const userId = await checkAccessToken(event);

    if (!userId)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });

    const body = await readBody<CancelPaymentBody>(event)

    if (!body.payment_id) {
      throw createError({ statusCode: 400, statusMessage: 'Payment ID is required' })
    }

    // Get the payment
    const payment = await prisma.payment.findUnique({
      where: { payment_id: body.payment_id }
    })

    if (!payment) {
      throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
    }

    // Only client can cancel
    if (payment.client_id !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the client can cancel this payment' })
    }

    // Can only cancel pending payments
    if (payment.status !== PaymentStatus.PENDING) {
      throw createError({ statusCode: 400, statusMessage: 'Only pending payments can be cancelled' })
    }

    // Delete the payment record (so a new one can be created)
    await prisma.payment.delete({
      where: { payment_id: payment.payment_id }
    })

    return {
      success: true,
      message: 'Payment cancelled. You can try again.'
    }
  } catch (error: any) {
    console.error('Cancel payment error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to cancel payment'
    })
  }
})
