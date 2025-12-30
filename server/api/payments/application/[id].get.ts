import prisma from '~~/server/db/prisma'
import { verifyToken } from '~~/server/utils/verify-token'

// Get payment for a specific application
export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const userId = await checkAccessToken(event);

    if (!userId)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    const applicationId = parseInt(event.context.params?.id as string)

    if (isNaN(applicationId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid application ID' })
    }

    // Get the application to verify access
    const application = await prisma.application.findUnique({
      where: { application_id: applicationId },
      include: {
        job: true,
        user: true
      }
    })

    if (!application) {
      throw createError({ statusCode: 404, statusMessage: 'Application not found' })
    }

    // Verify user is either the client (job owner) or freelancer
    if (application.job.user_id !== userId && application.user_id !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Access denied' })
    }

    // Get the payment for this application
    const payment = await prisma.payment.findUnique({
      where: { application_id: applicationId },
      include: {
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
        },
        freelancerStripe: {
          select: {
            onboarding_complete: true,
            charges_enabled: true
          }
        }
      }
    })

    if (!payment) {
      // Check if freelancer has Stripe set up
      const freelancerStripe = await prisma.stripeAccount.findUnique({
        where: { user_id: application.user_id }
      })

      return {
        success: true,
        payment: null,
        canCreatePayment: application.job.user_id === userId,
        freelancerStripeReady: freelancerStripe?.charges_enabled ?? false,
        applicationStatus: application.status,
        priceOffered: application.price_offered
      }
    }

    return {
      success: true,
      payment: {
        payment_id: payment.payment_id,
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
        client: payment.client,
        freelancer: payment.freelancer
      },
      canCreatePayment: false,
      freelancerStripeReady: payment.freelancerStripe?.charges_enabled ?? false,
      applicationStatus: application.status,
      priceOffered: application.price_offered
    }
  } catch (error: any) {
    console.error('Get application payment error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to get payment'
    })
  }
})
