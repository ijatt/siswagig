<template>
  <div class="min-h-screen bg-gray-50/50 flex items-center justify-center">
    <div class="max-w-md mx-auto px-4">
      <div class="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div class="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-lucide-refresh-cw" class="w-10 h-10 text-blue-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Session Expired</h2>
        <p class="text-gray-600 mb-6">
          Your Stripe onboarding session has expired. Please restart the setup process.
        </p>
        <NuxtLink
          to="/payments/stripe-setup"
          class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2"
        >
          <UIcon name="i-lucide-arrow-right" class="w-5 h-5" />
          Restart Setup
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
