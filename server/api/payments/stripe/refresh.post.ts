import prisma from '~~/server/db/prisma'
import { verifyToken } from '~~/server/utils/verify-token'
import { createAccountLink } from '~~/server/utils/stripe'

// Refresh onboarding link for Stripe Connect
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

    const config = useRuntimeConfig()
    const appUrl = config.public.APP_URL

    // Create new onboarding link
    const accountLink = await createAccountLink(
      stripeAccount.stripe_account_code,
      `${appUrl}/payments/stripe/refresh`,
      `${appUrl}/payments/stripe/complete`
    )

    return {
      success: true,
      onboardingUrl: accountLink.url
    }
  } catch (error: any) {
    console.error('Stripe refresh error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to refresh onboarding link'
    })
  }
})
