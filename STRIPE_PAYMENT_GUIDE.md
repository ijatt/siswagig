# Stripe Payment Gateway Integration Guide

This guide explains how to set up and use the Stripe payment system with escrow-style flow in your Siswagig application.

## Overview

The payment system implements an escrow-style flow where:

1. **Client posts a job and hires a freelancer**
2. **Freelancer completes the work**
3. **Client makes a payment** (funds are held by the platform)
4. **Client approves the work** (funds are released to the freelancer)

### Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        PAYMENT FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Freelancer completes work → Status: "Submitted"              │
│                          ↓                                       │
│  2. Client creates payment → Status: "Pending"                   │
│                          ↓                                       │
│  3. Stripe processes payment → Status: "Paid" (Escrow)           │
│                          ↓                                       │
│  4. Client marks job complete → Status: "Completed"              │
│                          ↓                                       │
│  5. Client releases payment → Status: "Released"                 │
│                          ↓                                       │
│  6. Freelancer receives funds via Stripe Connect                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...        # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_...   # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_...      # Webhook signing secret
STRIPE_CLIENT_ID=ca_...              # Stripe Connect Client ID (for OAuth)

# Platform Configuration
PLATFORM_FEE_PERCENT=10              # Platform fee percentage (default: 10%)
APP_URL=http://localhost:3000        # Your application URL
```

### 2. Stripe Dashboard Setup

1. **Create a Stripe Account**: Sign up at [stripe.com](https://stripe.com)

2. **Enable Stripe Connect** (Standard Accounts):
   - Go to Settings → Connect → Settings
   - Enable **Standard accounts** (required for Malaysia and other restricted regions)
   - Configure your platform profile
   - **Get your Client ID**:
     - Go to Settings → Connect → Settings
     - Copy the **Client ID** (starts with `ca_`)
     - Add it to your `.env` file as `STRIPE_CLIENT_ID`

   > **Note for Malaysia**: Express accounts are not available in Malaysia due to regulatory restrictions. This integration uses Standard accounts with OAuth, which are supported.

3. **Set up Webhooks** (Detailed Steps):

   Webhooks allow Stripe to notify your application when events happen (e.g., payment succeeded, transfer completed).

   **Step-by-step instructions:**

   a. **Go to the Stripe Dashboard**: Log in at [dashboard.stripe.com](https://dashboard.stripe.com)

   b. **Navigate to Webhooks**:
      - Click on **"Developers"** in the top menu bar
      - Select **"Webhooks"** from the dropdown menu

   c. **Add a new endpoint**:
      - Click the **"+ Add endpoint"** button
      - In the "Endpoint URL" field, enter your webhook URL:
        ```
        https://your-domain.com/api/payments/webhook
        ```
        (Replace `your-domain.com` with your actual domain)

   d. **Select events to listen to**:
      - Click **"Select events"** or **"+ Select events to send"**
      - Search for and check the following events:

      | Event Name | Purpose |
      |------------|---------|
      | `payment_intent.succeeded` | Notifies when a payment is successful |
      | `payment_intent.payment_failed` | Notifies when a payment fails |
      | `account.updated` | Notifies when a connected account is updated |
      | `transfer.created` | Notifies when a transfer to freelancer is created |
      | `charge.refunded` | Notifies when a refund is processed |

   e. **Save the endpoint**:
      - Click **"Add endpoint"** to save

   f. **Get your Webhook Secret**:
      - After creating the endpoint, click on it to view details
      - Look for **"Signing secret"** and click **"Reveal"**
      - Copy this secret (starts with `whsec_`)
      - Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

   **Example `.env` configuration:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
   ```

   **Testing Webhooks Locally (Development):**

   For local development, Stripe can't reach `localhost`. Use the Stripe CLI instead:

   ```bash
   # 1. Install Stripe CLI (Windows - using scoop)
   scoop install stripe

   # Or download from: https://stripe.com/docs/stripe-cli

   # 2. Login to Stripe
   stripe login

   # 3. Forward webhooks to your local server
   stripe listen --forward-to localhost:3000/api/payments/webhook

   # 4. Copy the webhook signing secret shown in the terminal
   #    (starts with whsec_) and add it to your .env file
   ```

   The CLI will display a webhook signing secret - use this for local testing.

4. **Get API Keys**:
   - Go to Developers → API Keys
   - Copy the publishable and secret keys

### 3. Database Migration

The payment system requires the following database tables:
- `StripeAccount` - Stores freelancer Stripe Connect accounts
- `Payment` - Stores payment records
- `PaymentTransaction` - Audit log for payment events

Run the migration:
```bash
npx prisma migrate dev
```

## Payment Status States

| Status | Description |
|--------|-------------|
| `pending` | Payment created, waiting for client to pay |
| `paid` | Payment captured, funds held in escrow |
| `released` | Payment transferred to freelancer |
| `refunded` | Payment refunded to client |
| `failed` | Payment failed |

## API Endpoints

### Stripe Connect (Freelancer)

#### Connect Stripe Account
```http
POST /api/payments/stripe/connect
Authorization: Bearer <token>
```

Returns an onboarding URL for the freelancer to complete Stripe setup.

#### Get Account Status
```http
GET /api/payments/stripe/status
Authorization: Bearer <token>
```

#### Refresh Onboarding Link
```http
POST /api/payments/stripe/refresh
Authorization: Bearer <token>
```

#### Get Stripe Dashboard Link
```http
GET /api/payments/stripe/dashboard
Authorization: Bearer <token>
```

### Payments

#### Create Payment
```http
POST /api/payments/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "application_id": 123
}
```

Returns a Stripe `client_secret` for client-side payment.

#### Confirm Payment (Capture)
```http
POST /api/payments/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_id": 456
}
```

#### Release Payment
```http
POST /api/payments/release
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_id": 456
}
```

#### Refund Payment
```http
POST /api/payments/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_id": 456,
  "reason": "Optional reason"
}
```

#### Get Payment Details
```http
GET /api/payments/:id
Authorization: Bearer <token>
```

#### List All Payments
```http
GET /api/payments?status=paid&role=client
Authorization: Bearer <token>
```

#### Get Payment for Application
```http
GET /api/payments/application/:applicationId
Authorization: Bearer <token>
```

## Frontend Components

### StripeConnect
Component for freelancers to connect their Stripe account.

```vue
<StripeConnect />
```

### PaymentButton
Component for clients to make payments.

```vue
<PaymentButton
  :application-id="123"
  :amount="500"
  :freelancer-stripe-ready="true"
  :application-status="'Submitted'"
  @success="handleSuccess"
  @error="handleError"
/>
```

### PaymentStatus
Badge showing payment status.

```vue
<PaymentStatus status="paid" />
```

### PaymentCard
Card displaying payment summary with actions.

```vue
<PaymentCard
  :payment="payment"
  :show-actions="true"
  @release="handleRelease"
  @refund="handleRefund"
/>
```

## Pages

| Route | Description |
|-------|-------------|
| `/payments` | Payment dashboard with list and stats |
| `/payments/:id` | Payment details page |
| `/payments/stripe-setup` | Stripe Connect setup for freelancers |
| `/payments/complete` | Payment completion redirect page |
| `/payments/stripe/complete` | Stripe onboarding completion page |
| `/payments/stripe/refresh` | Stripe session expired page |

## Integration with Application Flow

### When Freelancer Submits Work

The payment option becomes available when:
1. Application status is `Submitted` or `Completed`
2. Freelancer has a connected Stripe account with `charges_enabled: true`

### Client Payment Flow

1. Client views the application
2. Clicks "Make Payment" button
3. Stripe Elements form appears
4. Client enters payment details
5. Payment is authorized and captured
6. Funds are held in escrow

### Releasing Payment

1. Client marks the job as `Completed`
2. Client clicks "Release Payment"
3. Platform transfers funds to freelancer's Stripe account
4. Freelancer receives funds (minus platform fee)

## Platform Fee

The platform fee is configurable via the `PLATFORM_FEE_PERCENT` environment variable.

**Example calculation:**
- Job amount: $500
- Platform fee (10%): $50
- Freelancer receives: $450

## Testing

### Test Mode

Use Stripe test keys for development. Test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

### Testing Webhooks Locally

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
# Then run:
stripe listen --forward-to localhost:3000/api/payments/webhook
```

## Security Considerations

1. **Never expose secret keys** - Only use publishable keys on the client side
2. **Verify webhooks** - Always verify webhook signatures
3. **Authorization** - All endpoints verify user authentication
4. **Role-based access** - Clients can only manage their payments, freelancers can only view theirs
5. **Escrow protection** - Funds are held until explicit release

## Error Handling

Common errors and solutions:

| Error | Solution |
|-------|----------|
| "Freelancer has not connected a Stripe account" | Freelancer needs to complete Stripe Connect setup |
| "Payment can only be made for submitted work" | Application must be in Submitted or Completed status |
| "Cannot refund a released payment" | Funds already transferred; contact support |
| "Stripe onboarding not complete" | Freelancer needs to finish Stripe onboarding |

## Support

For payment-related issues:
1. Check the payment status in the dashboard
2. Review transaction history
3. Check Stripe Dashboard for detailed logs
4. Contact platform support if needed
