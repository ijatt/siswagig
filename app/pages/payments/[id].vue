<template>
  <div class="min-h-screen bg-gray-50/50">
    <!-- Loading -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-alert-circle" class="w-8 h-8 text-red-600" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Payment Not Found</h2>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <NuxtLink to="/payments" class="text-purple-600 hover:underline">
          Back to Payments
        </NuxtLink>
      </div>
    </div>

    <div v-else-if="payment">
      <!-- Header -->
      <div class="bg-white border-b border-gray-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NuxtLink 
            to="/payments" 
            class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
            Back to Payments
          </NuxtLink>
          
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Payment Details</h1>
              <p class="text-gray-500 mt-1">Payment #{{ payment.payment_id }}</p>
            </div>
            <PaymentStatus :status="payment.status" />
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Amount Card -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          
          <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
            <div class="text-center">
              <p class="text-sm text-gray-500 mb-1">Total Amount</p>
              <p class="text-4xl font-bold text-gray-900">${{ payment.amount.toFixed(2) }}</p>
              <p class="text-sm text-gray-500 mt-1 uppercase">{{ payment.currency }}</p>
            </div>
            
            <div class="border-t border-gray-200 mt-6 pt-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Freelancer receives</span>
                <span class="font-medium text-gray-900">${{ payment.freelancer_amount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Platform fee</span>
                <span class="text-gray-500">${{ payment.platform_fee.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Job Info -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
          
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden flex-shrink-0">
              <img 
                v-if="payment.job?.image_url"
                :src="payment.job.image_url"
                :alt="payment.job.title"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-lucide-briefcase" class="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900">{{ payment.job?.title }}</h4>
              <p class="text-sm text-gray-500">{{ payment.description }}</p>
            </div>
            <NuxtLink
              :to="`/jobs/${payment.job?.job_id}`"
              class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-all"
            >
              View Job
            </NuxtLink>
          </div>
        </div>

        <!-- Parties -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Parties</h3>
          
          <div class="grid sm:grid-cols-2 gap-4">
            <!-- Client -->
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-500 mb-2">Client</p>
              <div class="flex items-center gap-3">
                <img 
                  :src="payment.client?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(payment.client?.name || 'C')}&size=48&background=667eea&color=fff`"
                  class="w-12 h-12 rounded-xl"
                />
                <div>
                  <p class="font-medium text-gray-900">{{ payment.client?.name }}</p>
                  <p class="text-sm text-gray-500">{{ payment.client?.email }}</p>
                </div>
              </div>
            </div>
            
            <!-- Freelancer -->
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-500 mb-2">Freelancer</p>
              <div class="flex items-center gap-3">
                <img 
                  :src="payment.freelancer?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(payment.freelancer?.name || 'F')}&size=48&background=10b981&color=fff`"
                  class="w-12 h-12 rounded-xl"
                />
                <div>
                  <p class="font-medium text-gray-900">{{ payment.freelancer?.name }}</p>
                  <p class="text-sm text-gray-500">{{ payment.freelancer?.email }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
          
          <div class="space-y-4">
            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-plus" class="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">Payment Created</p>
                <p class="text-sm text-gray-500">{{ formatDateTime(payment.created_at) }}</p>
              </div>
            </div>
            
            <div v-if="payment.paid_at" class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-lock" class="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">Payment Captured</p>
                <p class="text-sm text-gray-500">{{ formatDateTime(payment.paid_at) }}</p>
              </div>
            </div>
            
            <div v-if="payment.released_at" class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-send" class="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">Payment Released</p>
                <p class="text-sm text-gray-500">{{ formatDateTime(payment.released_at) }}</p>
              </div>
            </div>
            
            <div v-if="payment.refunded_at" class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-rotate-ccw" class="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">Payment Refunded</p>
                <p class="text-sm text-gray-500">{{ formatDateTime(payment.refunded_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="canTakeAction" class="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          
          <div class="flex flex-wrap gap-3">
            <button
              v-if="isClient && payment.status === 'paid' && payment.application_status === 'Completed'"
              @click="releasePayment"
              :disabled="processing"
              class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 disabled:opacity-50"
            >
              <UIcon name="i-lucide-send" class="w-5 h-5" />
              Release Payment
            </button>
            
            <button
              v-if="isClient && (payment.status === 'pending' || payment.status === 'paid')"
              @click="refundPayment"
              :disabled="processing"
              class="bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-xl font-medium text-gray-700 flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              <UIcon name="i-lucide-rotate-ccw" class="w-5 h-5" />
              Refund Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Payment } from '~/types/types'
import { useMyTokenStore } from '~/stores/token'
import { userStore } from '~/stores/user'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const tokenStore = useMyTokenStore()
const userStoreInstance = userStore()

const loading = ref(true)
const error = ref('')
const processing = ref(false)
const payment = ref<Payment | null>(null)

const isClient = computed(() => payment.value?.client?.user_id === userStoreInstance.user?.user_id)
const isFreelancer = computed(() => payment.value?.freelancer?.user_id === userStoreInstance.user?.user_id)

const canTakeAction = computed(() => {
  if (!payment.value) return false
  if (isClient.value) {
    return payment.value.status === 'paid' || payment.value.status === 'pending'
  }
  return false
})

onMounted(async () => {
  await fetchPayment()
})

async function fetchPayment() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch<any>(`/api/payments/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    })
    
    payment.value = response.payment
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to load payment'
  } finally {
    loading.value = false
  }
}

async function releasePayment() {
  if (!payment.value) return
  
  if (!confirm('Are you sure you want to release this payment to the freelancer?')) return
  
  processing.value = true
  
  try {
    await $fetch('/api/payments/release', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: {
        payment_id: payment.value.payment_id
      }
    })
    
    await fetchPayment()
  } catch (err: any) {
    alert(err.data?.statusMessage || 'Failed to release payment')
  } finally {
    processing.value = false
  }
}

async function refundPayment() {
  if (!payment.value) return
  
  if (!confirm('Are you sure you want to refund this payment? This action cannot be undone.')) return
  
  processing.value = true
  
  try {
    await $fetch('/api/payments/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: {
        payment_id: payment.value.payment_id
      }
    })
    
    await fetchPayment()
  } catch (err: any) {
    alert(err.data?.statusMessage || 'Failed to refund payment')
  } finally {
    processing.value = false
  }
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>
