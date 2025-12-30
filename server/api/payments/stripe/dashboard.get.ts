import prisma from '~~/server/db/prisma'
import { verifyToken } from '~~/server/utils/verify-token'
import { createLoginLink } from '~~/server/utils/stripe'

// Get Stripe dashboard link for connected account
export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const userId = await checkAccessToken(event);

    if (!userId)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });

    // Get user's Stripe account
    const stripeAccount = await prisma.stripeAccount.findUnique({
      where: { user_id: userId as number }
    })

    if (!stripeAccount) {
      throw createError({ statusCode: 404, statusMessage: 'No Stripe account found' })
    }

    if (!stripeAccount.onboarding_complete) {
      throw createError({ statusCode: 400, statusMessage: 'Stripe onboarding not complete' })
    }

    // Create login link
    const loginLink = await createLoginLink(stripeAccount.stripe_account_code)

    return {
      success: true,
      dashboardUrl: loginLink.url
    }
  } catch (error: any) {
    console.error('Stripe dashboard error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to create dashboard link'
    })
  }
})
