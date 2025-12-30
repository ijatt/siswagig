import prisma from '~~/server/db/prisma'
import { PaymentStatus } from '~~/server/utils/stripe'

interface ReleasePaymentBody {
  payment_id: number
}

// Release payment to freelancer (transfer from platform to connected account) - DEMO MODE
export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const userId = await checkAccessToken(event);

    if (!userId)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    const body = await readBody<ReleasePaymentBody>(event)

    if (!body.payment_id) {
      throw createError({ statusCode: 400, statusMessage: 'Payment ID is required' })
    }

    // Get the payment with related data
    const payment = await prisma.payment.findUnique({
      where: { payment_id: body.payment_id },
      include: {
        application: {
          include: {
            job: true,
            user: true // Freelancer
          }
        },
        freelancerStripe: true
      }
    })

    if (!payment) {
      throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
    }

    // Verify the user is the client
    if (payment.client_id !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the client can release the payment' })
    }

    // Check payment status - must be PAID (held in escrow)
    if (payment.status !== PaymentStatus.PAID) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: `Payment must be in 'paid' status to release. Current status: ${payment.status}` 
      })
    }

    // Check application status - should be Completed
    if (payment.application.status !== 'Completed') {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Job must be marked as Completed before releasing payment' 
      })
    }

    // Verify freelancer has payment info (Stripe OR bank account)
    const freelancer = payment.application.user
    const hasPaymentInfo = payment.freelancerStripe || (freelancer.bank_name && freelancer.bank_account_no)
    
    if (!hasPaymentInfo) {
      throw createError({ statusCode: 400, statusMessage: 'Freelancer has not set up payment information' })
    }

    // DEMO MODE: Simulate transfer to freelancer
    const mockTransferId = `tr_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Determine destination for transaction log
    const destination = payment.freelancerStripe?.stripe_account_code || 
      `bank:${freelancer.bank_name}:****${freelancer.bank_account_no?.slice(-4)}`

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { payment_id: payment.payment_id },
      data: {
        status: PaymentStatus.RELEASED,
        stripe_transfer_id: mockTransferId,
        released_at: new Date()
      }
    })

    // Log transaction
    await prisma.paymentTransaction.create({
      data: {
        payment_id: payment.payment_id,
        type: 'transfer_completed',
        amount: payment.freelancer_amount,
        status: 'completed',
        metadata: JSON.stringify({
          transfer_id: mockTransferId,
          destination_account: destination,
          demo_mode: true
        })
      }
    })

    // Create notification for freelancer
    await prisma.notification.create({
      data: {
        user_id: payment.freelancer_id,
        type: 'payment',
        title: 'Payment Released! 🎉',
        message: `RM${(payment.freelancer_amount / 100).toFixed(2)} has been released to your account for "${payment.application.job.title}".`,
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
        released_at: updatedPayment.released_at,
        freelancer_amount: updatedPayment.freelancer_amount / 100,
        transfer_id: mockTransferId
      },
      demoMode: true,
      message: '[DEMO MODE] Payment released successfully to freelancer'
    }
  } catch (error: any) {
    console.error('Release payment error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to release payment'
    })
  }
})
