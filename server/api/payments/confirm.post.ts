import prisma from '~~/server/db/prisma'
import { PaymentStatus } from '~~/server/utils/stripe'

interface ConfirmPaymentBody {
  payment_id: number
}

// Confirm/capture a payment after client confirms (moves funds to platform) - DEMO MODE
export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const userId = await checkAccessToken(event);

    if (!userId)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    const body = await readBody<ConfirmPaymentBody>(event)

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

    // Verify the user is the client
    if (payment.client_id !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the client can confirm the payment' })
    }

    // Check payment status
    if (payment.status !== PaymentStatus.PENDING) {
      throw createError({ statusCode: 400, statusMessage: `Payment is already ${payment.status}` })
    }

    // DEMO MODE: Simulate payment capture
    const mockChargeId = `ch_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { payment_id: payment.payment_id },
      data: {
        status: PaymentStatus.PAID,
        stripe_charge_id: mockChargeId,
        paid_at: new Date()
      }
    })

    // Log transaction
    await prisma.paymentTransaction.create({
      data: {
        payment_id: payment.payment_id,
        type: 'payment_succeeded',
        amount: payment.amount,
        status: 'succeeded',
        metadata: JSON.stringify({
          charge_id: mockChargeId,
          demo_mode: true
        })
      }
    })

    // Create notification for freelancer
    await prisma.notification.create({
      data: {
        user_id: payment.freelancer_id,
        type: 'payment',
        title: 'Payment Received',
        message: `Client has paid RM${(payment.amount / 100).toFixed(2)} for "${payment.application.job.title}". Funds are held until job completion.`,
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
        paid_at: updatedPayment.paid_at,
        amount: updatedPayment.amount / 100
      },
      demoMode: true,
      message: '[DEMO MODE] Payment captured successfully. Funds are now held in escrow.'
    }
  } catch (error: any) {
    console.error('Confirm payment error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to confirm payment'
    })
  }
})
