<template>
  <div 
    :class="[
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
      statusStyles[status]?.bg || 'bg-gray-100',
      statusStyles[status]?.text || 'text-gray-600'
    ]"
  >
    <UIcon :name="statusStyles[status]?.icon || 'i-lucide-circle'" class="w-3.5 h-3.5" />
    {{ statusStyles[status]?.label || status }}
  </div>
</template>

<script setup lang="ts">
import type { PaymentStatusType } from '~/types/types'

interface Props {
  status: PaymentStatusType
}

defineProps<Props>()

const statusStyles: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    icon: 'i-lucide-clock',
    label: 'Pending'
  },
  paid: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: 'i-lucide-lock',
    label: 'Held in Escrow'
  },
  released: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    icon: 'i-lucide-check-circle',
    label: 'Released'
  },
  refunded: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    icon: 'i-lucide-rotate-ccw',
    label: 'Refunded'
  },
  failed: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: 'i-lucide-x-circle',
    label: 'Failed'
  }
}
</script>
