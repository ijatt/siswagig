<template>
  <div class="min-h-screen bg-gray-50/50 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <!-- Loading -->
        <div v-if="loading" class="py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Verifying payment...</p>
        </div>

        <!-- Success -->
        <div v-else-if="success">
          <div class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-check-circle" class="w-10 h-10 text-emerald-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p class="text-gray-600 mb-6">
            Your payment of <span class="font-semibold">RM {{ amount }}</span> has been processed. 
            The funds are now held in escrow until you release them to the freelancer.
          </p>
          
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-info" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div class="text-sm">
                <p class="font-medium text-blue-800">What's next?</p>
                <p class="text-blue-700 mt-1">
                  Go to your Payments page and click "Release Payment" when you're satisfied with the work.
                </p>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <NuxtLink
              to="/payments"
              class="flex-1 btn-gradient px-6 py-3 rounded-xl font-semibold text-white text-center"
            >
              View Payments
            </NuxtLink>
            <NuxtLink
              to="/client/applications"
              class="flex-1 px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-center"
            >
              Applications
            </NuxtLink>
          </div>
        </div>

        <!-- Error -->
        <div v-else>
          <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-x-circle" class="w-10 h-10 text-red-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
          <p class="text-gray-600 mb-6">{{ error || 'Something went wrong with your payment.' }}</p>
          
          <NuxtLink
            to="/payments"
            class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2"
          >
            <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
            Back to Payments
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMyTokenStore } from '~/stores/token'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const tokenStore = useMyTokenStore()

const loading = ref(true)
const success = ref(false)
const error = ref('')
const amount = ref('')

onMounted(async () => {
  const sessionId = route.query.session_id as string
  
  if (!sessionId) {
    error.value = 'No session ID provided'
    loading.value = false
    return
  }

  try {
    const response = await $fetch<any>('/api/payments/verify-checkout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: {
        session_id: sessionId
      }
    })

    success.value = true
    amount.value = (response.amount / 100).toFixed(2)
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to verify payment'
  } finally {
    loading.value = false
  }
})
</script>
