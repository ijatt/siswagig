import prisma from '~~/server/db/prisma'
import Stripe from 'stripe'
import { toCents, calculatePlatformFee, PaymentStatus } from '~~/server/utils/stripe'

interface CheckoutBody {
  application_id: number
}

// Create Stripe Checkout Session - shows real Stripe payment page
export default defineEventHandler(async (event) => {
  try {
    const userId = await checkAccessToken(event);

    if (!userId)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });

    const body = await readBody<CheckoutBody>(event)

    if (!body.application_id) {
      throw createError({ statusCode: 400, statusMessage: 'Application ID is required' })
    }

    // Get the application
    const application = await prisma.application.findUnique({
      where: { application_id: body.application_id },
      include: {
        job: true,
        user: {
          include: {
            stripeAccount: true
          }
        },
        payment: true
      }
    })

    if (!application) {
      throw createError({ statusCode: 404, statusMessage: 'Application not found' })
    }

    if (application.job.user_id !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the job owner can create a payment' })
    }

    if (application.payment) {
      throw createError({ statusCode: 400, statusMessage: 'Payment already exists for this application' })
    }

    if (!['Submitted', 'Completed'].includes(application.status)) {
      throw createError({ statusCode: 400, statusMessage: 'Work must be submitted first' })
    }

    // Check if freelancer has connected their account (bank info OR Stripe)
    const user = application.user as any
    const freelancerHasPaymentSetup = 
      (user.bank_name && user.bank_account_no) || 
      user.stripeAccount?.onboarding_complete
    
    if (!freelancerHasPaymentSetup) {
      throw createError({ statusCode: 400, statusMessage: 'Freelancer has not set up payment account' })
    }

    const config = useRuntimeConfig()
    const appUrl = config.public.APP_URL
    const stripeSecretKey = config.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      throw createError({ statusCode: 500, statusMessage: 'Stripe is not configured' })
    }

    const stripe = new Stripe(stripeSecretKey)

    // Calculate amounts
    const feePercent = parseFloat(config.public.PLATFORM_FEE_PERCENT as string) || 10
    const amount = application.price_offered
    const amountCents = toCents(amount)
    const platformFeeCents = calculatePlatformFee(amountCents, feePercent)
    const freelancerAmountCents = amountCents - platformFeeCents

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: application.job.title,
              description: `Payment to ${application.user.name} for completed work`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        application_id: application.application_id.toString(),
        job_id: application.job_id.toString(),
        client_id: userId.toString(),
        freelancer_id: application.user_id.toString(),
        platform_fee: platformFeeCents.toString(),
        freelancer_amount: freelancerAmountCents.toString(),
      },
      success_url: `${appUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payments?cancelled=true`,
    })

    // Create pending payment record
    await prisma.payment.create({
      data: {
        application_id: application.application_id,
        client_id: userId as number,
        freelancer_id: application.user_id,
        freelancer_stripe_id: user.stripeAccount?.stripe_account_id || null,
        amount: amountCents,
        platform_fee: platformFeeCents,
        freelancer_amount: freelancerAmountCents,
        currency: 'myr',
        stripe_payment_intent_id: session.id, // Store session ID
        status: PaymentStatus.PENDING,
        description: `Payment for job: ${application.job.title}`
      }
    })

    return {
      success: true,
      checkoutUrl: session.url
    }
  } catch (error: any) {
    console.error('Checkout error:', error.message || error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to create checkout session'
    })
  }
})
