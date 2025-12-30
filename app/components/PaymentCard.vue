<template>
  <div class="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-purple-200 transition-all">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <!-- Job Image -->
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
          <img 
            v-if="payment.job?.image_url"
            :src="payment.job.image_url"
            :alt="payment.job.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-lucide-briefcase" class="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div>
          <h4 class="font-semibold text-gray-900 line-clamp-1">{{ payment.job?.title || 'Unknown Job' }}</h4>
          <p class="text-sm text-gray-500">{{ formatDate(payment.created_at) }}</p>
        </div>
      </div>
      <PaymentStatus :status="payment.status" />
    </div>

    <!-- Amount Info -->
    <div class="bg-gray-50 rounded-xl p-4 mb-4">
      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-500">
          {{ payment.is_freelancer ? 'You will receive' : 'Total amount' }}
        </span>
        <span class="text-xl font-bold text-gray-900">
          ${{ payment.is_freelancer ? payment.freelancer_amount.toFixed(2) : payment.amount.toFixed(2) }}
        </span>
      </div>
      <div v-if="payment.is_client && payment.platform_fee > 0" class="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span>Platform fee</span>
        <span>${{ payment.platform_fee.toFixed(2) }}</span>
      </div>
    </div>

    <!-- Parties -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <img 
          :src="payment.client?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(payment.client?.name || 'C')}&size=32&background=667eea&color=fff`"
          class="w-8 h-8 rounded-full"
        />
        <div>
          <p class="text-xs text-gray-500">Client</p>
          <p class="text-sm font-medium text-gray-900">{{ payment.client?.name }}</p>
        </div>
      </div>
      <UIcon name="i-lucide-arrow-right" class="w-5 h-5 text-gray-300" />
      <div class="flex items-center gap-2">
        <img 
          :src="payment.freelancer?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(payment.freelancer?.name || 'F')}&size=32&background=10b981&color=fff`"
          class="w-8 h-8 rounded-full"
        />
        <div>
          <p class="text-xs text-gray-500">Freelancer</p>
          <p class="text-sm font-medium text-gray-900">{{ payment.freelancer?.name }}</p>
        </div>
      </div>
    </div>

    <!-- Timeline -->
    <div v-if="payment.paid_at || payment.released_at" class="border-t border-gray-100 pt-4 space-y-2">
      <div v-if="payment.paid_at" class="flex items-center gap-2 text-xs text-gray-500">
        <UIcon name="i-lucide-credit-card" class="w-4 h-4" />
        <span>Paid on {{ formatDate(payment.paid_at) }}</span>
      </div>
      <div v-if="payment.released_at" class="flex items-center gap-2 text-xs text-emerald-600">
        <UIcon name="i-lucide-send" class="w-4 h-4" />
        <span>Released on {{ formatDate(payment.released_at) }}</span>
      </div>
      <div v-if="payment.refunded_at" class="flex items-center gap-2 text-xs text-purple-600">
        <UIcon name="i-lucide-rotate-ccw" class="w-4 h-4" />
        <span>Refunded on {{ formatDate(payment.refunded_at) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="showActions" class="border-t border-gray-100 pt-4 mt-4 flex gap-2">
      <!-- Client Actions -->
      <template v-if="payment.is_client">
        <!-- Retry Payment for pending status -->
        <button
          v-if="payment.status === 'pending'"
          @click="$emit('retry', payment)"
          class="flex-1 btn-gradient px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
        >
          <UIcon name="i-lucide-credit-card" class="w-4 h-4" />
          Complete Payment
        </button>
        <button
          v-if="payment.status === 'paid' && payment.application_status === 'Completed'"
          @click="$emit('release', payment)"
          class="flex-1 btn-gradient px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
        >
          <UIcon name="i-lucide-send" class="w-4 h-4" />
          Release Payment
        </button>
        <button
          v-if="payment.status === 'pending' || payment.status === 'paid'"
          @click="$emit('refund', payment)"
          class="flex-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-2 transition-all"
        >
          <UIcon name="i-lucide-rotate-ccw" class="w-4 h-4" />
          {{ payment.status === 'pending' ? 'Cancel' : 'Refund' }}
        </button>
      </template>
      
      <!-- View Details -->
      <NuxtLink
        :to="`/payments/${payment.payment_id}`"
        class="flex-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-2 transition-all"
      >
        <UIcon name="i-lucide-eye" class="w-4 h-4" />
        View Details
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Payment } from '~/types/types'

interface Props {
  payment: Payment
  showActions?: boolean
}

defineProps<Props>()
defineEmits<{
  release: [payment: Payment]
  refund: [payment: Payment]
  retry: [payment: Payment]
}>()

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>
