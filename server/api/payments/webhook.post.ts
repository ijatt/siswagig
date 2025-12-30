import prisma from '~~/server/db/prisma'
import { verifyWebhookSignature, PaymentStatus } from '~~/server/utils/stripe'

// Handle Stripe webhooks
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    // Get raw body
    const body = await readRawBody(event)
    if (!body) {
      throw createError({ statusCode: 400, statusMessage: 'No body provided' })
    }

    // Get Stripe signature
    const signature = getHeader(event, 'stripe-signature')
    if (!signature) {
      throw createError({ statusCode: 400, statusMessage: 'No Stripe signature' })
    }

    // Verify webhook
    const webhookSecret = config.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw createError({ statusCode: 500, statusMessage: 'Webhook secret not configured' })
    }

    const stripeEvent = verifyWebhookSignature(body, signature, webhookSecret)

    console.log(`Stripe webhook received: ${stripeEvent.type}`)

    // Handle different event types
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = stripeEvent.data.object as any
        await handlePaymentIntentSucceeded(paymentIntent, stripeEvent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = stripeEvent.data.object as any
        await handlePaymentIntentFailed(paymentIntent, stripeEvent.id)
        break
      }

      case 'account.updated': {
        const account = stripeEvent.data.object as any
        await handleAccountUpdated(account, stripeEvent.id)
        break
      }

      case 'transfer.created': {
        const transfer = stripeEvent.data.object as any
        await handleTransferCreated(transfer, stripeEvent.id)
        break
      }

      case 'charge.refunded': {
        const charge = stripeEvent.data.object as any
        await handleChargeRefunded(charge, stripeEvent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    return { received: true }
  } catch (error: any) {
    console.error('Webhook error:', error)
    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Webhook error'
    })
  }
})

// Handle successful payment
async function handlePaymentIntentSucceeded(paymentIntent: any, eventId: string) {
  const payment = await prisma.payment.findUnique({
    where: { stripe_payment_intent_id: paymentIntent.id }
  })

  if (!payment) {
    console.log(`Payment not found for intent: ${paymentIntent.id}`)
    return
  }

  // Only update if still pending
  if (payment.status === PaymentStatus.PENDING) {
    await prisma.payment.update({
      where: { payment_id: payment.payment_id },
      data: {
        status: PaymentStatus.PAID,
        stripe_charge_id: paymentIntent.latest_charge,
        paid_at: new Date()
      }
    })

    await prisma.paymentTransaction.create({
      data: {
        payment_id: payment.payment_id,
        type: 'payment_succeeded',
        stripe_event_id: eventId,
        amount: paymentIntent.amount,
        status: 'succeeded'
      }
    })
  }
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent: any, eventId: string) {
  const payment = await prisma.payment.findUnique({
    where: { stripe_payment_intent_id: paymentIntent.id }
  })

  if (!payment) {
    console.log(`Payment not found for intent: ${paymentIntent.id}`)
    return
  }

  await prisma.payment.update({
    where: { payment_id: payment.payment_id },
    data: {
      status: PaymentStatus.FAILED,
      failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed'
    }
  })

  await prisma.paymentTransaction.create({
    data: {
      payment_id: payment.payment_id,
      type: 'payment_failed',
      stripe_event_id: eventId,
      amount: paymentIntent.amount,
      status: 'failed',
      metadata: JSON.stringify({
        error: paymentIntent.last_payment_error
      })
    }
  })
}

// Handle Stripe Connect account updates
async function handleAccountUpdated(account: any, eventId: string) {
  const stripeAccount = await prisma.stripeAccount.findUnique({
    where: { stripe_account_code: account.id }
  })

  if (!stripeAccount) {
    console.log(`Stripe account not found: ${account.id}`)
    return
  }

  await prisma.stripeAccount.update({
    where: { stripe_account_id: stripeAccount.stripe_account_id },
    data: {
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      onboarding_complete: account.details_submitted,
      account_status: account.charges_enabled ? 'active' : 
                      account.requirements?.disabled_reason ? 'restricted' : 'pending'
    }
  })
}

// Handle transfer created
async function handleTransferCreated(transfer: any, eventId: string) {
  const payment = await prisma.payment.findFirst({
    where: { stripe_transfer_id: transfer.id }
  })

  if (payment) {
    await prisma.paymentTransaction.create({
      data: {
        payment_id: payment.payment_id,
        type: 'transfer_created',
        stripe_event_id: eventId,
        amount: transfer.amount,
        status: 'created',
        metadata: JSON.stringify({
          destination: transfer.destination
        })
      }
    })
  }
}

// Handle charge refunded
async function handleChargeRefunded(charge: any, eventId: string) {
  const payment = await prisma.payment.findFirst({
    where: { stripe_charge_id: charge.id }
  })

  if (!payment) return

  await prisma.payment.update({
    where: { payment_id: payment.payment_id },
    data: {
      status: PaymentStatus.REFUNDED,
      refunded_at: new Date()
    }
  })

  await prisma.paymentTransaction.create({
    data: {
      payment_id: payment.payment_id,
      type: 'refund_completed',
      stripe_event_id: eventId,
      amount: charge.amount_refunded,
      status: 'refunded'
    }
  })
}
