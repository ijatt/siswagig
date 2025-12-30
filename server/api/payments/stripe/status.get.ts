import prisma from '~~/server/db/prisma'

// Get Stripe account status for freelancer - DEMO MODE
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
      return {
        connected: false,
        message: 'No Stripe account connected'
      }
    }

    // DEMO MODE: Return stored status directly (no Stripe API call)
    return {
      connected: true,
      accountId: stripeAccount.stripe_account_code,
      chargesEnabled: stripeAccount.charges_enabled,
      payoutsEnabled: stripeAccount.payouts_enabled,
      onboardingComplete: stripeAccount.onboarding_complete,
      accountStatus: stripeAccount.account_status,
      demoMode: true
    }
  } catch (error: any) {
    console.error('Stripe status error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to get Stripe account status'
    })
  }
})
