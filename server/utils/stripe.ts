import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const config = useRuntimeConfig()
    const secretKey = config.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// Payment status enum
export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  RELEASED: 'released',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus]

// Helper to calculate platform fee
export function calculatePlatformFee(amount: number, feePercent: number = 10): number {
  return Math.round(amount * (feePercent / 100))
}

// Helper to convert amount to cents
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

// Helper to convert cents to amount
export function fromCents(cents: number): number {
  return cents / 100
}

// Create a Stripe Connect account for a freelancer
// Using Standard accounts for Malaysia compatibility
export async function createConnectAccount(
  email: string,
  name: string,
  country: string = 'MY'
): Promise<Stripe.Account> {
  const stripe = getStripe()
  
  // Use Standard accounts - works in Malaysia and other restricted regions
  // Standard accounts are liable for their own losses (not platform-liable)
  const account = await stripe.accounts.create({
    type: 'standard',
    country,
    email,
    metadata: {
      platform: 'siswagig',
      user_name: name,
    },
  })
  
  return account
}

// Create OAuth link for Standard account onboarding
export function createOAuthLink(
  clientId: string,
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'read_write',
    redirect_uri: redirectUri,
    state: state,
  })
  
  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`
}

// Complete OAuth connection for Standard account
export async function completeOAuthConnection(
  code: string
): Promise<{ stripe_user_id: string; access_token: string }> {
  const stripe = getStripe()
  const config = useRuntimeConfig()
  
  const response = await stripe.oauth.token({
    grant_type: 'authorization_code',
    code,
  })
  
  return {
    stripe_user_id: response.stripe_user_id!,
    access_token: response.access_token!,
  }
}

// Create account link for onboarding (for Express/Custom accounts only)
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<Stripe.AccountLink> {
  const stripe = getStripe()
  
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })
  
  return accountLink
}

// Get account status
export async function getAccountStatus(accountId: string): Promise<Stripe.Account> {
  const stripe = getStripe()
  return await stripe.accounts.retrieve(accountId)
}

// Create a payment intent for escrow
export async function createPaymentIntent(
  amount: number, // Amount in cents
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe()
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    // Don't auto-capture - we want to hold the funds
    capture_method: 'manual',
    metadata: {
      ...metadata,
      platform: 'siswagig',
    },
  })
  
  return paymentIntent
}

// Capture a payment (move from authorized to captured)
export async function capturePayment(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe()
  return await stripe.paymentIntents.capture(paymentIntentId)
}

// Create a transfer to a connected account (release funds)
export async function createTransfer(
  amount: number, // Amount in cents
  connectedAccountId: string,
  transferGroup: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Transfer> {
  const stripe = getStripe()
  
  const transfer = await stripe.transfers.create({
    amount,
    currency: 'usd',
    destination: connectedAccountId,
    transfer_group: transferGroup,
    metadata: {
      ...metadata,
      platform: 'siswagig',
    },
  })
  
  return transfer
}

// Refund a payment
export async function refundPayment(
  paymentIntentId: string,
  amount?: number, // Optional: partial refund amount in cents
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> {
  const stripe = getStripe()
  
  const refundData: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  }
  
  if (amount) {
    refundData.amount = amount
  }
  
  if (reason) {
    refundData.reason = reason
  }
  
  return await stripe.refunds.create(refundData)
}

// Cancel a payment intent (before capture)
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe()
  return await stripe.paymentIntents.cancel(paymentIntentId)
}

// Get payment intent details
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe()
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

// Create a login link for connected account dashboard
export async function createLoginLink(accountId: string): Promise<Stripe.LoginLink> {
  const stripe = getStripe()
  return await stripe.accounts.createLoginLink(accountId)
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripe = getStripe()
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
