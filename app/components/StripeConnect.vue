<template>
  <div class="bg-white rounded-2xl border border-gray-100 p-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
        <UIcon name="i-lucide-credit-card" class="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Payment Setup</h3>
        <p class="text-sm text-gray-500">Connect your Stripe account to receive payments</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>

    <!-- Not Connected State -->
    <div v-else-if="!accountStatus?.connected" class="space-y-4">
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-amber-800">Account Not Connected</p>
            <p class="text-sm text-amber-700 mt-1">
              You need to connect a Stripe account to receive payments from clients.
            </p>
          </div>
        </div>
      </div>
      
      <button
        @click="connectStripe"
        :disabled="connecting"
        class="w-full btn-gradient px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
      >
        <UIcon v-if="connecting" name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
        <UIcon v-else name="i-lucide-link" class="w-5 h-5" />
        {{ connecting ? 'Connecting...' : 'Connect Stripe Account' }}
      </button>
    </div>

    <!-- Onboarding Incomplete State -->
    <div v-else-if="!accountStatus.onboardingComplete" class="space-y-4">
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-info" class="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-blue-800">Complete Your Setup</p>
            <p class="text-sm text-blue-700 mt-1">
              Your Stripe account is connected but you need to complete the onboarding process.
            </p>
          </div>
        </div>
      </div>
      
      <button
        @click="continueOnboarding"
        :disabled="connecting"
        class="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        <UIcon v-if="connecting" name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
        <UIcon v-else name="i-lucide-external-link" class="w-5 h-5" />
        {{ connecting ? 'Loading...' : 'Complete Onboarding' }}
      </button>
    </div>

    <!-- Connected State -->
    <div v-else class="space-y-4">
      <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-600 mt-0.5" />
          <div class="flex-1">
            <p class="text-sm font-medium text-emerald-800">Account Connected</p>
            <p class="text-sm text-emerald-700 mt-1">
              Your Stripe account is ready to receive payments.
            </p>
          </div>
        </div>
      </div>

      <!-- Status Badges -->
      <div class="flex flex-wrap gap-2">
        <span 
          :class="[
            'px-3 py-1 rounded-full text-xs font-medium',
            accountStatus.chargesEnabled 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-gray-100 text-gray-600'
          ]"
        >
          <UIcon :name="accountStatus.chargesEnabled ? 'i-lucide-check' : 'i-lucide-x'" class="w-3 h-3 inline mr-1" />
          Charges {{ accountStatus.chargesEnabled ? 'Enabled' : 'Disabled' }}
        </span>
        <span 
          :class="[
            'px-3 py-1 rounded-full text-xs font-medium',
            accountStatus.payoutsEnabled 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-gray-100 text-gray-600'
          ]"
        >
          <UIcon :name="accountStatus.payoutsEnabled ? 'i-lucide-check' : 'i-lucide-x'" class="w-3 h-3 inline mr-1" />
          Payouts {{ accountStatus.payoutsEnabled ? 'Enabled' : 'Disabled' }}
        </span>
      </div>

      <!-- Dashboard Button -->
      <button
        @click="openDashboard"
        :disabled="loadingDashboard"
        class="w-full bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-xl font-medium text-gray-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        <UIcon v-if="loadingDashboard" name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
        <UIcon v-else name="i-lucide-external-link" class="w-5 h-5" />
        {{ loadingDashboard ? 'Loading...' : 'Open Stripe Dashboard' }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-600 mt-0.5" />
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StripeAccountStatus } from '~/types/types'
import { useMyTokenStore } from '~/stores/token'

const tokenStore = useMyTokenStore()
const config = useRuntimeConfig()

const loading = ref(true)
const connecting = ref(false)
const loadingDashboard = ref(false)
const error = ref('')
const accountStatus = ref<StripeAccountStatus | null>(null)

// Fetch account status on mount
onMounted(async () => {
  await fetchAccountStatus()
})

async function fetchAccountStatus() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch<StripeAccountStatus>('/api/payments/stripe/status', {
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    })
    accountStatus.value = response
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to fetch account status'
  } finally {
    loading.value = false
  }
}

async function connectStripe() {
  connecting.value = true
  error.value = ''
  
  try {
    const response = await $fetch<any>('/api/payments/stripe/connect', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    })
    
    if (response.onboardingUrl) {
      window.location.href = response.onboardingUrl
    } else {
      await fetchAccountStatus()
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to connect Stripe account'
  } finally {
    connecting.value = false
  }
}

async function continueOnboarding() {
  connecting.value = true
  error.value = ''
  
  try {
    const response = await $fetch<any>('/api/payments/stripe/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    })
    
    if (response.onboardingUrl) {
      window.location.href = response.onboardingUrl
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to get onboarding link'
  } finally {
    connecting.value = false
  }
}

async function openDashboard() {
  loadingDashboard.value = true
  error.value = ''
  
  try {
    const response = await $fetch<any>('/api/payments/stripe/dashboard', {
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    })
    
    if (response.dashboardUrl) {
      window.open(response.dashboardUrl, '_blank')
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to open dashboard'
  } finally {
    loadingDashboard.value = false
  }
}
</script>
