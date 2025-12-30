<template>
  <div>
    <!-- Payment Not Available -->
    <div v-if="!canPay" class="bg-gray-50 rounded-xl p-4 text-center">
      <UIcon name="i-lucide-info" class="w-6 h-6 text-gray-400 mx-auto mb-2" />
      <p class="text-sm text-gray-600">{{ disabledReason }}</p>
    </div>

    <!-- Payment Form -->
    <div v-else class="space-y-4">
      <!-- Amount Summary -->
      <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-600">Job Amount</span>
          <span class="font-semibold text-gray-900">${{ amount.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between items-center text-sm text-gray-500">
          <span>Platform Fee ({{ platformFeePercent }}%)</span>
          <span>${{ platformFee.toFixed(2) }}</span>
        </div>
        <div class="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
          <span class="font-medium text-gray-700">Total</span>
          <span class="text-xl font-bold text-purple-600">${{ amount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Stripe Elements Container -->
      <div v-if="clientSecret" class="space-y-4">
        <div id="payment-element" class="min-h-[200px]"></div>
        
        <button
          @click="handlePayment"
          :disabled="processing"
          class="w-full btn-gradient px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          <UIcon v-if="processing" name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
          <UIcon v-else name="i-lucide-lock" class="w-5 h-5" />
          {{ processing ? 'Processing...' : `Pay $${amount.toFixed(2)}` }}
        </button>
      </div>

      <!-- Create Payment Button -->
      <button
        v-else
        @click="createPayment"
        :disabled="creatingPayment"
        class="w-full btn-gradient px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
      >
        <UIcon v-if="creatingPayment" name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
        <UIcon v-else name="i-lucide-credit-card" class="w-5 h-5" />
        {{ creatingPayment ? 'Setting up payment...' : 'Proceed to Payment' }}
      </button>

      <!-- Security Note -->
      <p class="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
        <UIcon name="i-lucide-shield-check" class="w-4 h-4" />
        Secure payment powered by Stripe
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-600 mt-0.5" />
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="success" class="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-600 mt-0.5" />
        <div>
          <p class="text-sm font-medium text-emerald-800">Payment Successful!</p>
          <p class="text-sm text-emerald-700 mt-1">
            Funds are now held in escrow and will be released when you mark the job as complete.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'
import { useMyTokenStore } from '~/stores/token'

interface Props {
  applicationId: number
  amount: number
  freelancerStripeReady?: boolean
  applicationStatus?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  success: [paymentId: number]
  error: [message: string]
}>()

const tokenStore = useMyTokenStore()
const config = useRuntimeConfig()

const creatingPayment = ref(false)
const processing = ref(false)
const error = ref('')
const success = ref(false)
const clientSecret = ref('')
const paymentId = ref<number | null>(null)

let stripe: Stripe | null = null
let elements: StripeElements | null = null

const platformFeePercent = computed(() => parseInt(config.public.PLATFORM_FEE_PERCENT as string) || 10)
const platformFee = computed(() => props.amount * (platformFeePercent.value / 100))

const canPay = computed(() => {
  return props.freelancerStripeReady && 
         ['Submitted', 'Completed'].includes(props.applicationStatus || '')
})

const disabledReason = computed(() => {
  if (!props.freelancerStripeReady) {
    return 'The freelancer has not set up their payment account yet.'
  }
  if (!['Submitted', 'Completed'].includes(props.applicationStatus || '')) {
    return 'Payment is only available after work has been submitted.'
  }
  return ''
})

async function createPayment() {
  creatingPayment.value = true
  error.value = ''
  
  try {
    const response = await $fetch<any>('/api/payments/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: {
        application_id: props.applicationId
      }
    })

    if (response.success) {
      clientSecret.value = response.clientSecret
      paymentId.value = response.payment.payment_id
      
      // Initialize Stripe
      await initializeStripe(response.publishableKey)
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to create payment'
    emit('error', error.value)
  } finally {
    creatingPayment.value = false
  }
}

async function initializeStripe(publishableKey: string) {
  try {
    stripe = await loadStripe(publishableKey)
    
    if (!stripe) {
      throw new Error('Failed to load Stripe')
    }

    elements = stripe.elements({
      clientSecret: clientSecret.value,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#7c3aed',
          borderRadius: '12px'
        }
      }
    })

    const paymentElement = elements.create('payment')
    paymentElement.mount('#payment-element')
  } catch (err: any) {
    error.value = 'Failed to initialize payment form'
    console.error('Stripe init error:', err)
  }
}

async function handlePayment() {
  if (!stripe || !elements) {
    error.value = 'Payment form not initialized'
    return
  }

  processing.value = true
  error.value = ''

  try {
    const { error: submitError } = await elements.submit()
    if (submitError) {
      throw new Error(submitError.message)
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payments/complete`
      },
      redirect: 'if_required'
    })

    if (confirmError) {
      throw new Error(confirmError.message)
    }

    if (paymentIntent?.status === 'requires_capture' || paymentIntent?.status === 'succeeded') {
      // Confirm payment on backend
      await $fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenStore.accessToken}`
        },
        body: {
          payment_id: paymentId.value
        }
      })

      success.value = true
      emit('success', paymentId.value!)
    }
  } catch (err: any) {
    error.value = err.message || 'Payment failed'
    emit('error', error.value)
  } finally {
    processing.value = false
  }
}
</script>
