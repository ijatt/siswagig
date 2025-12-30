<template>
  <div class="min-h-screen bg-gray-50/50 flex items-center justify-center">
    <div class="max-w-md mx-auto px-4">
      <div class="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <!-- Loading -->
        <div v-if="loading" class="py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Processing your payment...</p>
        </div>

        <!-- Success -->
        <div v-else-if="success">
          <div class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-check" class="w-10 h-10 text-emerald-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p class="text-gray-600 mb-6">
            Your payment has been processed and funds are now held in escrow.
          </p>
          <NuxtLink
            to="/payments"
            class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2"
          >
            <UIcon name="i-lucide-wallet" class="w-5 h-5" />
            View Payments
          </NuxtLink>
        </div>

        <!-- Error -->
        <div v-else>
          <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-x" class="w-10 h-10 text-red-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p class="text-gray-600 mb-6">{{ errorMessage || 'Something went wrong with your payment.' }}</p>
          <NuxtLink
            to="/payments"
            class="bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-xl font-medium text-gray-700 inline-flex items-center gap-2 transition-all"
          >
            <UIcon name="i-lucide-arrow-left" class="w-5 h-5" />
            Go Back
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()

const loading = ref(true)
const success = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  // Check for Stripe redirect parameters
  const paymentIntent = route.query.payment_intent as string
  const paymentIntentClientSecret = route.query.payment_intent_client_secret as string
  const redirectStatus = route.query.redirect_status as string

  if (redirectStatus === 'succeeded') {
    success.value = true
  } else if (redirectStatus === 'failed') {
    errorMessage.value = 'Your payment was not successful. Please try again.'
  } else if (!paymentIntent && !redirectStatus) {
    // No payment info, redirect to payments
    navigateTo('/payments')
    return
  }

  loading.value = false
})
</script>
