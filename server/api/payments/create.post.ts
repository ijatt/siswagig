import prisma from '~~/server/db/prisma'
import { toCents, calculatePlatformFee, PaymentStatus } from '~~/server/utils/stripe'

interface CreatePaymentBody {
  application_id: number
  amount?: number // Optional: override the application price
}

// Create a payment for a completed job (escrow-style) - DEMO MODE
export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const userId = await checkAccessToken(event);

    if (!userId)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    const body = await readBody<CreatePaymentBody>(event)

    if (!body.application_id) {
      throw createError({ statusCode: 400, statusMessage: 'Application ID is required' })
    }

    // Get the application with related data
    const application = await prisma.application.findUnique({
      where: { application_id: body.application_id },
      include: {
        job: {
          include: {
            user: true // Client who posted the job
          }
        },
        user: {
          include: {
            stripeAccount: true // Freelancer's Stripe account
          }
        },
        payment: true // Check if payment already exists
      }
    })

    if (!application) {
      throw createError({ statusCode: 404, statusMessage: 'Application not found' })
    }

    // Verify the user is the job owner (client)
    if (application.job.user_id !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the job owner can create a payment' })
    }

    // Check if payment already exists
    if (application.payment) {
      // Return existing payment if pending
      if (application.payment.status === PaymentStatus.PENDING) {
        return {
          success: true,
          payment: application.payment,
          clientSecret: null,
          message: 'Payment already exists'
        }
      }
      throw createError({ statusCode: 400, statusMessage: 'Payment already processed for this application' })
    }

    // Verify application status - must be Submitted or Completed
    if (!['Submitted', 'Completed'].includes(application.status)) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Payment can only be made for submitted or completed work' 
      })
    }

    // Check if freelancer has payment info (bank account OR Stripe)
    const freelancerHasPaymentSetup = 
      (application.user.bank_name && application.user.bank_account_no) || 
      application.user.stripeAccount?.charges_enabled

    if (!freelancerHasPaymentSetup) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Freelancer has not set up payment information yet' 
      })
    }

    // Calculate amounts
    const config = useRuntimeConfig()
    const feePercent = parseFloat(config.public.PLATFORM_FEE_PERCENT as string) || 10
    
    const amount = body.amount || application.price_offered
    const amountCents = toCents(amount)
    const platformFeeCents = calculatePlatformFee(amountCents, feePercent)
    const freelancerAmountCents = amountCents - platformFeeCents

    // DEMO MODE: Generate mock payment intent ID
    const mockPaymentIntentId = `pi_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        application_id: application.application_id,
        client_id: userId as number,
        freelancer_id: application.user_id,
        freelancer_stripe_id: application.user.stripeAccount?.stripe_account_id || null,
        amount: amountCents,
        platform_fee: platformFeeCents,
        freelancer_amount: freelancerAmountCents,
        currency: 'myr', // Malaysian Ringgit for demo
        stripe_payment_intent_id: mockPaymentIntentId,
        status: PaymentStatus.PENDING,
        description: `Payment for job: ${application.job.title}`
      }
    })

    // Log transaction
    await prisma.paymentTransaction.create({
      data: {
        payment_id: payment.payment_id,
        type: 'payment_created',
        amount: amountCents,
        status: 'pending',
        metadata: JSON.stringify({
          payment_intent_id: mockPaymentIntentId,
          platform_fee: platformFeeCents,
          freelancer_amount: freelancerAmountCents,
          demo_mode: true
        })
      }
    })

    return {
      success: true,
      payment: {
        payment_id: payment.payment_id,
        amount: amount,
        platform_fee: platformFeeCents / 100,
        freelancer_amount: freelancerAmountCents / 100,
        status: payment.status
      },
      clientSecret: null, // No real Stripe in demo mode
      demoMode: true,
      message: '[DEMO MODE] Payment created successfully'
    }
  } catch (error: any) {
    console.error('Create payment error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to create payment'
    })
  }
})
