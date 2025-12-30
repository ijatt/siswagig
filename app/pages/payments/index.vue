<template>
  <div class="min-h-screen bg-gray-50/50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Payments</h1>
            <p class="text-gray-500 mt-1">Manage your payments and transactions</p>
          </div>
          
          <!-- Stripe Connect for Freelancers -->
          <!-- <div v-if="userStoreInstance.user?.role === 'freelancer'" class="flex-shrink-0">
            <NuxtLink
              to="/payments/stripe-setup"
              class="btn-gradient px-5 py-2.5 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <UIcon name="i-lucide-credit-card" class="w-4 h-4" />
              Payment Setup
            </NuxtLink>
          </div> -->
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Create Payment Section (shown when application_id is provided) -->
      <div v-if="applicationId && pendingApplication" class="bg-white rounded-2xl border border-purple-200 p-6 mb-8">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-credit-card" class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-1">Complete Payment</h3>
            <p class="text-gray-600 mb-4">
              Pay for the completed work on: <span class="font-semibold">{{ pendingApplication.job?.title }}</span>
            </p>
            
            <div class="bg-gray-50 rounded-xl p-4 mb-4">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Freelancer</span>
                  <p class="font-medium text-gray-900">{{ pendingApplication.user?.name }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Amount</span>
                  <p class="font-medium text-gray-900">RM {{ pendingApplication.price_offered?.toFixed(2) }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Platform Fee (10%)</span>
                  <p class="font-medium text-gray-900">RM {{ (pendingApplication.price_offered * 0.1)?.toFixed(2) }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Freelancer Receives</span>
                  <p class="font-medium text-emerald-600">RM {{ (pendingApplication.price_offered * 0.9)?.toFixed(2) }}</p>
                </div>
              </div>
            </div>
            
            <div v-if="!freelancerHasPaymentInfo(pendingApplication.user)" class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div class="flex items-start gap-3">
                <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="text-sm font-medium text-amber-800">Freelancer hasn't added payment information</p>
                  <p class="text-sm text-amber-700 mt-1">The freelancer needs to add their bank account details before you can pay.</p>
                </div>
              </div>
            </div>
            
            <div v-else class="flex gap-3">
              <button
                @click="createPayment"
                :disabled="creatingPayment"
                class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                <UIcon v-if="creatingPayment" name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
                <UIcon v-else name="i-lucide-credit-card" class="w-5 h-5" />
                {{ creatingPayment ? 'Processing...' : 'Pay Now' }}
              </button>
              <NuxtLink
                to="/client/applications"
                class="px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancel
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Total Earned - Freelancer Only -->
        <div v-if="isFreelancer" class="bg-white rounded-2xl p-5 border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <UIcon name="i-lucide-wallet" class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">RM {{ totals.total_earned.toFixed(2) }}</p>
              <p class="text-sm text-gray-500">Total Earned</p>
            </div>
          </div>
        </div>

        <!-- Total Paid - Client Only -->
        <div v-if="isClient" class="bg-white rounded-2xl p-5 border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <UIcon name="i-lucide-credit-card" class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">RM {{ totals.total_paid.toFixed(2) }}</p>
              <p class="text-sm text-gray-500">Total Paid</p>
            </div>
          </div>
        </div>
        
        <!-- In Escrow - Both -->
        <div class="bg-white rounded-2xl p-5 border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <UIcon name="i-lucide-lock" class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">RM {{ totals.total_held.toFixed(2) }}</p>
              <p class="text-sm text-gray-500">In Escrow</p>
            </div>
          </div>
        </div>
        
        <!-- Pending - Both -->
        <div class="bg-white rounded-2xl p-5 border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200">
              <UIcon name="i-lucide-clock" class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">RM {{ totals.total_pending.toFixed(2) }}</p>
              <p class="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Sort -->
      <div class="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- Filter Tabs -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="filter in filters"
              :key="filter.value"
              @click="activeFilter = filter.value"
              :class="[
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                activeFilter === filter.value 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ filter.label }}
            </button>
          </div>
          
          <!-- Sort Dropdown -->
          <div class="relative">
            <button
              @click="showSortDropdown = !showSortDropdown"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-all"
            >
              <UIcon name="i-lucide-arrow-up-down" class="w-4 h-4" />
              {{ currentSortLabel }}
              <UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
            </button>
            
            <div 
              v-if="showSortDropdown" 
              class="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden"
            >
              <button
                v-for="option in sortOptions"
                :key="option.value"
                @click="selectSort(option.value)"
                :class="[
                  'w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2',
                  activeSort === option.value ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                ]"
              >
                <UIcon :name="option.icon" class="w-4 h-4" />
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredPayments.length === 0" class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-credit-card" class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No Payments Found</h3>
        <p class="text-gray-500">
          {{ activeFilter === 'all' ? 'You don\'t have any payments yet.' : `No ${activeFilter} payments found.` }}
        </p>
      </div>

      <!-- Payments List -->
      <div v-else class="grid gap-4 md:grid-cols-2">
        <PaymentCard
          v-for="payment in filteredPayments"
          :key="payment.payment_id"
          :payment="payment"
          :show-actions="true"
          @release="handleRelease"
          @refund="handleRefund"
          @retry="handleRetry"
        />
      </div>
    </div>

    <!-- Release Confirmation Modal -->
    <UModal v-model:open="showReleaseModal">
      <template #content>
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-lucide-send" class="w-8 h-8 text-emerald-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Release Payment</h3>
            <p class="text-gray-600">
              Are you sure you want to release 
              <span class="font-semibold">${{ selectedPayment?.freelancer_amount.toFixed(2) }}</span>
              to the freelancer?
            </p>
          </div>
          
          <div class="flex gap-3">
            <button
              @click="showReleaseModal = false"
              class="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              @click="confirmRelease"
              :disabled="releasing"
              class="flex-1 btn-gradient px-4 py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            >
              {{ releasing ? 'Releasing...' : 'Release Payment' }}
            </button>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Refund Confirmation Modal -->
    <UModal v-model:open="showRefundModal">
      <template #content>
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-lucide-rotate-ccw" class="w-8 h-8 text-amber-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Refund Payment</h3>
            <p class="text-gray-600">
              Are you sure you want to refund 
              <span class="font-semibold">${{ selectedPayment?.amount.toFixed(2) }}</span>?
              This action cannot be undone.
            </p>
          </div>
          
          <div class="flex gap-3">
            <button
              @click="showRefundModal = false"
              class="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              @click="confirmRefund"
              :disabled="refunding"
              class="flex-1 bg-amber-600 hover:bg-amber-700 px-4 py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition-all"
            >
              {{ refunding ? 'Processing...' : 'Confirm Refund' }}
            </button>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Payment, PaymentTotals } from '~/types/types'
import { useMyTokenStore } from '~/stores/token'
import { userStore } from '~/stores/user'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const tokenStore = useMyTokenStore()
const userStoreInstance = userStore()

// Role checks
const isFreelancer = computed(() => userStoreInstance.user?.role === 'freelancer')
const isClient = computed(() => userStoreInstance.user?.role === 'client')

const loading = ref(true)
const payments = ref<Payment[]>([])
const totals = ref<PaymentTotals>({
  total_earned: 0,
  total_pending: 0,
  total_held: 0,
  total_paid: 0
})

// For creating new payment
const applicationId = computed(() => route.query.application_id as string | undefined)
const pendingApplication = ref<any>(null)
const creatingPayment = ref(false)

// Check if freelancer has added their bank account info
const freelancerHasPaymentInfo = (user: any) => {
  if (!user) return false
  // Check if freelancer has bank account info OR has completed Stripe onboarding
  return (user.bank_name && user.bank_account_no) || user.stripeAccount?.onboarding_complete
}

const activeFilter = ref('all')
const filters = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Escrow', value: 'paid' },
  { label: 'Released', value: 'released' },
  { label: 'Refunded', value: 'refunded' }
]

// Sorting
const showSortDropdown = ref(false)
const activeSort = ref('newest')
const sortOptions = [
  { label: 'Newest First', value: 'newest', icon: 'i-lucide-arrow-down' },
  { label: 'Oldest First', value: 'oldest', icon: 'i-lucide-arrow-up' },
  { label: 'Highest Amount', value: 'amount-high', icon: 'i-lucide-trending-up' },
  { label: 'Lowest Amount', value: 'amount-low', icon: 'i-lucide-trending-down' }
]

const currentSortLabel = computed(() => {
  const option = sortOptions.find(o => o.value === activeSort.value)
  return option?.label || 'Sort'
})

const selectSort = (value: string) => {
  activeSort.value = value
  showSortDropdown.value = false
}

const showReleaseModal = ref(false)
const showRefundModal = ref(false)
const selectedPayment = ref<Payment | null>(null)
const releasing = ref(false)
const refunding = ref(false)

const filteredPayments = computed(() => {
  let result = [...payments.value]
  
  // Filter by status if not 'all'
  if (activeFilter.value !== 'all') {
    result = result.filter(p => p.status === activeFilter.value)
  }
  
  // Sort based on selected option
  result.sort((a, b) => {
    // In 'all' tab, pending payments always come first
    if (activeFilter.value === 'all') {
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (a.status !== 'pending' && b.status === 'pending') return 1
    }
    
    // Then apply selected sort
    switch (activeSort.value) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'amount-high':
        return b.amount - a.amount
      case 'amount-low':
        return a.amount - b.amount
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })
  
  return result
})

onMounted(async () => {
  await fetchPayments()
  if (applicationId.value) {
    await fetchApplication()
  }
})

// Watch for application_id query parameter changes
watch(applicationId, async (newVal) => {
  if (newVal) {
    await fetchApplication()
  } else {
    pendingApplication.value = null
  }
})

async function fetchApplication() {
  if (!applicationId.value) return
  
  try {
    const response = await $fetch<any>(`/api/applications/${applicationId.value}`, {
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    })
    pendingApplication.value = response
  } catch (error) {
    console.error('Failed to fetch application:', error)
  }
}

async function createPayment() {
  if (!applicationId.value) return
  
  creatingPayment.value = true
  
  try {
    // Try Stripe Checkout first (real payment UI)
    try {
      const checkoutResponse = await $fetch<any>('/api/payments/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenStore.accessToken}`
        },
        body: {
          application_id: parseInt(applicationId.value)
        }
      })
      
      // Redirect to Stripe Checkout page
      if (checkoutResponse.checkoutUrl) {
        window.location.href = checkoutResponse.checkoutUrl
        return
      }
    } catch (checkoutError: any) {
      // If Stripe not configured, fall back to demo mode
      if (checkoutError.data?.statusMessage?.includes('not configured')) {
        console.log('Stripe not configured, using demo mode')
      } else {
        throw checkoutError
      }
    }

    // Demo mode fallback - Create and confirm payment locally
    const createResponse = await $fetch<any>('/api/payments/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: {
        application_id: parseInt(applicationId.value)
      }
    })
    
    await $fetch('/api/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: {
        payment_id: createResponse.payment.payment_id
      }
    })
    
    // Remove query param and refresh payments
    router.replace('/payments')
    pendingApplication.value = null
    await fetchPayments()
    
    alert('[DEMO MODE] Payment successful! Funds are now held in escrow.')
  } catch (error: any) {
    console.error('Payment failed:', error)
    alert(error.data?.statusMessage || 'Failed to create payment')
  } finally {
    creatingPayment.value = false
  }
}

async function fetchPayments() {
  loading.value = true
  
  try {
    const response = await $fetch<any>('/api/payments', {
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    })
    
    payments.value = response.payments
    totals.value = response.totals
  } catch (error) {
    console.error('Failed to fetch payments:', error)
  } finally {
    loading.value = false
  }
}

function handleRelease(payment: Payment) {
  selectedPayment.value = payment
  showReleaseModal.value = true
}

function handleRefund(payment: Payment) {
  selectedPayment.value = payment
  showRefundModal.value = true
}

async function handleRetry(payment: Payment) {
  // Delete the pending payment and create a new checkout session
  try {
    // First, cancel/delete the pending payment
    await $fetch('/api/payments/cancel', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: {
        payment_id: payment.payment_id
      }
    })

    // Redirect to payment page with application ID to start fresh
    router.push(`/payments?application_id=${payment.application_id}`)
  } catch (error: any) {
    console.error('Retry failed:', error)
    alert(error.data?.statusMessage || 'Failed to retry payment')
  }
}

async function confirmRelease() {
  if (!selectedPayment.value) return
  
  releasing.value = true
  
  try {
    await $fetch('/api/payments/release', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: {
        payment_id: selectedPayment.value.payment_id
      }
    })
    
    showReleaseModal.value = false
    await fetchPayments()
  } catch (error: any) {
    console.error('Release failed:', error)
    alert(error.data?.statusMessage || 'Failed to release payment')
  } finally {
    releasing.value = false
  }
}

async function confirmRefund() {
  if (!selectedPayment.value) return
  
  refunding.value = true
  
  try {
    await $fetch('/api/payments/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: {
        payment_id: selectedPayment.value.payment_id
      }
    })
    
    showRefundModal.value = false
    await fetchPayments()
  } catch (error: any) {
    console.error('Refund failed:', error)
    alert(error.data?.statusMessage || 'Failed to refund payment')
  } finally {
    refunding.value = false
  }
}
</script>
