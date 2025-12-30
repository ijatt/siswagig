<template>
  <div class="min-h-screen bg-gray-50/50">
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
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Stripe Account Setup</h1>
        <p class="text-gray-500 mt-1">Connect your Stripe account to receive payments</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="font-medium text-red-800">Connection Failed</h4>
            <p class="text-sm text-red-600 mt-1">{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stripe Connect Component -->
      <StripeConnect class="mb-8" />

      <!-- How It Works -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">How Payments Work</h3>
        
        <div class="space-y-6">
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span class="text-purple-600 font-bold">1</span>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">Complete Your Work</h4>
              <p class="text-sm text-gray-600 mt-1">
                Deliver high-quality work and submit it for the client's review.
              </p>
            </div>
          </div>
          
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span class="text-purple-600 font-bold">2</span>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">Client Makes Payment</h4>
              <p class="text-sm text-gray-600 mt-1">
                The client pays for the completed work. Funds are held securely by the platform.
              </p>
            </div>
          </div>
          
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span class="text-purple-600 font-bold">3</span>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">Funds Held in Escrow</h4>
              <p class="text-sm text-gray-600 mt-1">
                Payment is securely held until the job is marked as complete.
              </p>
            </div>
          </div>
          
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span class="text-emerald-600 font-bold">4</span>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">Payment Released</h4>
              <p class="text-sm text-gray-600 mt-1">
                Once the client approves, funds are automatically transferred to your Stripe account.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
        
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-gray-900">What is Stripe Connect?</h4>
            <p class="text-sm text-gray-600 mt-1">
              Stripe Connect allows you to receive payments directly to your bank account through our platform.
            </p>
          </div>
          
          <div>
            <h4 class="font-medium text-gray-900">What fees are charged?</h4>
            <p class="text-sm text-gray-600 mt-1">
              A small platform fee is deducted from each payment. Standard Stripe processing fees also apply.
            </p>
          </div>
          
          <div>
            <h4 class="font-medium text-gray-900">How long until I receive my money?</h4>
            <p class="text-sm text-gray-600 mt-1">
              Once payment is released, funds typically arrive in your bank account within 2-7 business days.
            </p>
          </div>
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
const errorMessage = computed(() => {
  const error = route.query.error
  return error ? decodeURIComponent(error as string) : null
})
</script>
