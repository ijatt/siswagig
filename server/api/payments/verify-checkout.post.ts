import prisma from '~~/server/db/prisma'
import Stripe from 'stripe'
import { PaymentStatus } from '~~/server/utils/stripe'

interface VerifyBody {
  session_id: string
}

// Verify Stripe Checkout Session and update payment status
export default defineEventHandler(async (event) => {
  try {
    const userId = await checkAccessToken(event);

    if (!userId)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });

    const body = await readBody<VerifyBody>(event)

    if (!body.session_id) {
      throw createError({ statusCode: 400, statusMessage: 'Session ID is required' })
    }

    const config = useRuntimeConfig()
    const stripeSecretKey = config.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      throw createError({ statusCode: 500, statusMessage: 'Stripe is not configured' })
    }

    const stripe = new Stripe(stripeSecretKey)

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(body.session_id)

    if (session.payment_status !== 'paid') {
      throw createError({ statusCode: 400, statusMessage: 'Payment not completed' })
    }

    // Find and update the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        stripe_payment_intent_id: body.session_id,
        client_id: userId as number
      },
      include: {
        application: {
          include: { job: true }
        }
      }
    })

    if (!payment) {
      throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
    }

    if (payment.status !== PaymentStatus.PENDING) {
      // Already processed
      return {
        success: true,
        amount: payment.amount,
        status: payment.status
      }
    }

    // Update payment to PAID (escrow)
    const updatedPayment = await prisma.payment.update({
      where: { payment_id: payment.payment_id },
      data: {
        status: PaymentStatus.PAID,
        stripe_charge_id: session.payment_intent as string,
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
          checkout_session_id: session.id,
          payment_intent: session.payment_intent
        })
      }
    })

    // Notify freelancer
    await prisma.notification.create({
      data: {
        user_id: payment.freelancer_id,
        type: 'payment',
        title: 'Payment Received! 💰',
        message: `Client has paid RM${(payment.amount / 100).toFixed(2)} for "${payment.application.job.title}". Funds are held until released.`,
        link: `/payments`,
        related_job_id: payment.application.job_id,
        related_application_id: payment.application_id
      }
    })

    return {
      success: true,
      amount: updatedPayment.amount,
      status: updatedPayment.status
    }
  } catch (error: any) {
    console.error('Verify checkout error:', error.message || error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to verify payment'
    })
  }
})
