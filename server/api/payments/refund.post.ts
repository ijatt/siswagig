import prisma from '~~/server/db/prisma'
import { PaymentStatus } from '~~/server/utils/stripe'

interface RefundPaymentBody {
  payment_id: number
  reason?: string
}

// Refund a payment (before or after release) - DEMO MODE
export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const userId = await checkAccessToken(event);

    if (!userId)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    const body = await readBody<RefundPaymentBody>(event)

    if (!body.payment_id) {
      throw createError({ statusCode: 400, statusMessage: 'Payment ID is required' })
    }

    // Get the payment
    const payment = await prisma.payment.findUnique({
      where: { payment_id: body.payment_id },
      include: {
        application: {
          include: {
            job: true
          }
        }
      }
    })

    if (!payment) {
      throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
    }

    // Only client can initiate refund
    if (payment.client_id !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the client can request a refund' })
    }

    // Can only refund PENDING or PAID payments (not released)
    if (payment.status === PaymentStatus.RELEASED) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Cannot refund a released payment. Funds have already been transferred to the freelancer.' 
      })
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw createError({ statusCode: 400, statusMessage: 'Payment has already been refunded' })
    }

    if (payment.status === PaymentStatus.FAILED) {
      throw createError({ statusCode: 400, statusMessage: 'Cannot refund a failed payment' })
    }

    // DEMO MODE: Simulate refund
    const mockRefundId = `re_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { payment_id: payment.payment_id },
      data: {
        status: PaymentStatus.REFUNDED,
        refunded_at: new Date(),
        failure_reason: body.reason || 'Refund requested by client'
      }
    })

    // Log transaction
    await prisma.paymentTransaction.create({
      data: {
        payment_id: payment.payment_id,
        type: 'refund_completed',
        amount: payment.amount,
        status: 'refunded',
        metadata: JSON.stringify({
          refund_id: mockRefundId,
          reason: body.reason,
          demo_mode: true
        })
      }
    })

    // Create notification for freelancer
    await prisma.notification.create({
      data: {
        user_id: payment.freelancer_id,
        type: 'payment',
        title: 'Payment Refunded',
        message: `The payment of RM${(payment.amount / 100).toFixed(2)} for "${payment.application.job.title}" has been refunded to the client.`,
        link: `/payments`,
        related_job_id: payment.application.job_id,
        related_application_id: payment.application_id
      }
    })

    return {
      success: true,
      payment: {
        payment_id: updatedPayment.payment_id,
        status: updatedPayment.status,
        refunded_at: updatedPayment.refunded_at,
        amount: updatedPayment.amount / 100
      },
      demoMode: true,
      message: '[DEMO MODE] Payment refunded successfully'
    }
  } catch (error: any) {
    console.error('Refund payment error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to refund payment'
    })
  }
})
