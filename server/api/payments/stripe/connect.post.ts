import prisma from '~~/server/db/prisma'

// Mock Stripe Connect for FYP demo - no real Stripe needed
export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const userId = await checkAccessToken(event);

    if (!userId)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });

    // Get user details
    const user = await prisma.user.findUnique({
      where: { user_id: userId as number },
      include: { stripeAccount: true }
    })

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // Only freelancers can connect Stripe accounts
    if (user.role !== 'freelancer') {
      throw createError({ statusCode: 403, statusMessage: 'Only freelancers can connect Stripe accounts' })
    }

    // Check if user already has a connected Stripe account
    if (user.stripeAccount && user.stripeAccount.onboarding_complete) {
      return {
        success: true,
        accountId: user.stripeAccount.stripe_account_code,
        onboardingComplete: true,
        chargesEnabled: user.stripeAccount.charges_enabled,
        payoutsEnabled: user.stripeAccount.payouts_enabled
      }
    }

    // MOCK: Create a simulated Stripe account for demo purposes
    const mockAccountId = `acct_demo_${userId}_${Date.now()}`

    // Check if user already has a stripe account record
    if (user.stripeAccount) {
      // Update existing record to complete onboarding
      await prisma.stripeAccount.update({
        where: { user_id: userId as number },
        data: {
          stripe_account_code: mockAccountId,
          account_status: 'active',
          charges_enabled: true,
          payouts_enabled: true,
          onboarding_complete: true,
          updated_at: new Date()
        }
      })
    } else {
      // Create new mock account
      await prisma.stripeAccount.create({
        data: {
          user_id: userId as number,
          stripe_account_code: mockAccountId,
          account_status: 'active',
          charges_enabled: true,
          payouts_enabled: true,
          onboarding_complete: true
        }
      })
    }

    return {
      success: true,
      accountId: mockAccountId,
      onboardingComplete: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      message: '[DEMO MODE] Stripe account connected successfully!'
    }
  } catch (error: any) {
    console.error('Stripe connect error:', error.message || error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to create Stripe account'
    })
  }
})
