<template>
  <div class="min-h-screen bg-gray-50/50 flex items-center justify-center">
    <div class="max-w-md mx-auto px-4">
      <div class="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <!-- Loading -->
        <div v-if="loading" class="py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Verifying your Stripe account...</p>
        </div>

        <!-- Success -->
        <div v-else-if="success">
          <div class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-check" class="w-10 h-10 text-emerald-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
          <p class="text-gray-600 mb-6">
            Your Stripe account is now connected. You can receive payments from clients.
          </p>
          <NuxtLink
            to="/payments"
            class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2"
          >
            <UIcon name="i-lucide-wallet" class="w-5 h-5" />
            View Payments
          </NuxtLink>
        </div>

        <!-- Incomplete -->
        <div v-else>
          <div class="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-alert-triangle" class="w-10 h-10 text-amber-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Setup Incomplete</h2>
          <p class="text-gray-600 mb-6">
            Your Stripe account setup is not complete. Please finish the onboarding process.
          </p>
          <NuxtLink
            to="/payments/stripe-setup"
            class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2"
          >
            <UIcon name="i-lucide-settings" class="w-5 h-5" />
            Complete Setup
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

const tokenStore = useMyTokenStore()

const loading = ref(true)
const success = ref(false)

onMounted(async () => {
  // Check account status
  try {
    const response = await $fetch<any>('/api/payments/stripe/status', {
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    })
    
    if (response.connected && response.onboardingComplete) {
      success.value = true
    }
  } catch (error) {
    console.error('Failed to check status:', error)
  } finally {
    loading.value = false
  }
})
</script>
