import prisma from '~~/server/db/prisma'
import { completeOAuthConnection, getAccountStatus } from '~~/server/utils/stripe'

// Handle Stripe OAuth callback for Standard accounts
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { code, state, error, error_description } = query

    const config = useRuntimeConfig()
    const appUrl = config.public.APP_URL

    // Handle OAuth errors
    if (error) {
      console.error('Stripe OAuth error:', error, error_description)
      return sendRedirect(
        event, 
        `${appUrl}/payments/stripe-setup?error=${encodeURIComponent(error_description as string || error as string)}`
      )
    }

    if (!code || !state) {
      return sendRedirect(
        event,
        `${appUrl}/payments/stripe-setup?error=${encodeURIComponent('Missing authorization code')}`
      )
    }

    // Decode state to get user ID
    let stateData: { userId: number; timestamp: number }
    try {
      stateData = JSON.parse(Buffer.from(state as string, 'base64').toString())
    } catch {
      return sendRedirect(
        event,
        `${appUrl}/payments/stripe-setup?error=${encodeURIComponent('Invalid state parameter')}`
      )
    }

    // Verify timestamp (OAuth state should be recent - within 1 hour)
    const oneHour = 60 * 60 * 1000
    if (Date.now() - stateData.timestamp > oneHour) {
      return sendRedirect(
        event,
        `${appUrl}/payments/stripe-setup?error=${encodeURIComponent('OAuth session expired')}`
      )
    }

    // Complete the OAuth connection
    const { stripe_user_id, access_token } = await completeOAuthConnection(code as string)

    // Get account details
    const accountDetails = await getAccountStatus(stripe_user_id)

    // Check if user already has a stripe account record
    const existingAccount = await prisma.stripeAccount.findUnique({
      where: { user_id: stateData.userId }
    })

    if (existingAccount) {
      // Update existing record
      await prisma.stripeAccount.update({
        where: { user_id: stateData.userId },
        data: {
          stripe_account_code: stripe_user_id,
          account_status: 'active',
          charges_enabled: accountDetails.charges_enabled || false,
          payouts_enabled: accountDetails.payouts_enabled || false,
          onboarding_complete: true,
          updated_at: new Date()
        }
      })
    } else {
      // Create new record
      await prisma.stripeAccount.create({
        data: {
          user_id: stateData.userId,
          stripe_account_code: stripe_user_id,
          account_status: 'active',
          charges_enabled: accountDetails.charges_enabled || false,
          payouts_enabled: accountDetails.payouts_enabled || false,
          onboarding_complete: true
        }
      })
    }

    // Redirect to success page
    return sendRedirect(event, `${appUrl}/payments/stripe/complete?success=true`)

  } catch (error: any) {
    console.error('OAuth callback error:', error.message || error)
    
    const config = useRuntimeConfig()
    const appUrl = config.public.APP_URL
    
    return sendRedirect(
      event,
      `${appUrl}/payments/stripe-setup?error=${encodeURIComponent(error.message || 'Failed to connect Stripe account')}`
    )
  }
})
