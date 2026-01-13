<template>
  <div>
    <NuxtLayout name="admin">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Reviews Management</h1>
          <p class="text-slate-500 mt-1">Monitor and manage all user reviews</p>
        </div>
      </div>

      <!-- Rating Filter -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <Icon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Search reviews by comment or user name..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                @input="debouncedSearch"
              />
            </div>
          </div>
          
          <!-- Rating Filter -->
          <select 
            v-model="ratingFilter"
            @change="fetchReviews"
            class="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all bg-white"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      <!-- Rating Stats -->
      <div class="grid grid-cols-5 gap-4 mb-6">
        <div 
          v-for="n in 5" 
          :key="n"
          class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"
        >
          <div class="flex items-center justify-center gap-1 mb-2">
            <Icon 
              v-for="star in n" 
              :key="star"
              name="i-lucide-star" 
              class="text-lg text-amber-400" 
            />
          </div>
          <p class="text-2xl font-bold text-slate-800">{{ ratingCounts?.[n] || 0 }}</p>
          <p class="text-sm text-slate-500">reviews</p>
        </div>
      </div>

      <!-- Reviews List -->
      <div class="space-y-4">
        <div 
          v-for="review in reviews" 
          :key="review.review_id"
          class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col lg:flex-row lg:items-start gap-6">
            <!-- Review Content -->
            <div class="flex-1">
              <!-- Rating Stars -->
              <div class="flex items-center gap-1 mb-3">
                <Icon 
                  v-for="n in 5" 
                  :key="n"
                  name="i-lucide-star" 
                  :class="['text-lg', n <= review.rating ? 'text-amber-400' : 'text-slate-200']" 
                />
                <span class="ml-2 text-sm font-medium text-slate-600">{{ review.rating }}/5</span>
              </div>
              
              <!-- Review Comment -->
              <p class="text-slate-700 mb-4">{{ review.comment }}</p>
              
              <!-- Users Info -->
              <div class="flex flex-wrap items-center gap-6">
                <!-- From User -->
                <div class="flex items-center gap-3">
                  <img 
                    :src="review.fromUser?.image_url || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'"
                    class="w-8 h-8 rounded-lg object-cover"
                    :alt="review.fromUser?.name"
                  />
                  <div>
                    <p class="text-xs text-slate-500">From</p>
                    <p class="text-sm font-medium text-slate-700">{{ review.fromUser?.name }}</p>
                  </div>
                </div>
                
                <Icon name="i-lucide-arrow-right" class="text-slate-300" />
                
                <!-- To User -->
                <div class="flex items-center gap-3">
                  <img 
                    :src="review.toUser?.image_url || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'"
                    class="w-8 h-8 rounded-lg object-cover"
                    :alt="review.toUser?.name"
                  />
                  <div>
                    <p class="text-xs text-slate-500">To</p>
                    <p class="text-sm font-medium text-slate-700">{{ review.toUser?.name }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Job Info -->
              <div class="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p class="text-sm text-slate-600">
                  <span class="font-medium">Job:</span> {{ review.job?.title }}
                </p>
              </div>
              
              <!-- Date -->
              <p class="text-xs text-slate-400 mt-3">
                Posted on {{ formatDate(review.created_at) }}
              </p>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center gap-2 lg:flex-col">
              <button 
                @click="confirmDelete(review)"
                class="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Icon name="i-lucide-trash-2" />
                Delete Review
              </button>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="reviews.length === 0 && !pending" class="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
          <Icon name="i-lucide-star" class="text-5xl text-slate-300 mb-4" />
          <p class="text-lg font-medium text-slate-600">No reviews found</p>
          <p class="text-slate-500 mt-1">Try adjusting your filters or search query</p>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination && reviews.length > 0" class="flex items-center justify-between mt-6 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-600">
          Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} reviews
        </p>
        <div class="flex items-center gap-2">
          <button 
            @click="goToPage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button 
            @click="goToPage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <UModal v-model:open="showDeleteModal">
        <template #content>
          <div class="p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Icon name="i-lucide-alert-triangle" class="text-2xl text-red-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-800">Delete Review</h3>
                <p class="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p class="text-slate-600 mb-4">
              Are you sure you want to delete this review?
            </p>
            <div v-if="reviewToDelete" class="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
              <div class="flex items-center gap-1 mb-2">
                <Icon 
                  v-for="n in 5" 
                  :key="n"
                  name="i-lucide-star" 
                  :class="['text-sm', n <= reviewToDelete.rating ? 'text-amber-400' : 'text-slate-200']" 
                />
              </div>
              <p class="text-sm text-slate-600 line-clamp-2">{{ reviewToDelete.comment }}</p>
              <p class="text-xs text-slate-400 mt-2">By {{ reviewToDelete.fromUser?.name }}</p>
            </div>
            <div class="flex justify-end gap-3">
              <button 
                @click="showDeleteModal = false"
                class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="deleteReview"
                class="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Delete Review
              </button>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Loading State -->
      <div v-if="pending" class="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          <p class="text-slate-600 font-medium">Loading reviews...</p>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: false
})

useSeoMeta({
  title: 'Reviews Management | SiswaGig Admin',
  description: 'Manage all user reviews'
})

const toast = useToast()
const tokenStore = useMyTokenStore()

// State
const searchQuery = ref('')
const ratingFilter = ref('all')
const currentPage = ref(1)
const showDeleteModal = ref(false)
const reviewToDelete = ref<any>(null)

// Fetch reviews
const { data, pending, refresh } = await useFetch('/api/admin/reviews', {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  },
  query: {
    page: currentPage,
    rating: ratingFilter,
    search: searchQuery
  }
})

const reviews = computed(() => data.value?.reviews || [])
const pagination = computed(() => data.value?.pagination)
const ratingCounts = computed(() => data.value?.ratingCounts || {})

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchReviews()
  }, 300)
}

// Fetch reviews
const fetchReviews = async () => {
  await refresh()
}

// Go to page
const goToPage = (page: number) => {
  currentPage.value = page
  fetchReviews()
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Confirm delete
const confirmDelete = (review: any) => {
  reviewToDelete.value = review
  showDeleteModal.value = true
}

// Delete review
const deleteReview = async () => {
  if (!reviewToDelete.value) return
  
  try {
    await $fetch(`/api/admin/reviews/${reviewToDelete.value.review_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    })
    
    toast.add({
      title: 'Success',
      description: 'Review deleted successfully',
      color: 'success'
    })
    
    showDeleteModal.value = false
    reviewToDelete.value = null
    await fetchReviews()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.statusMessage || 'Failed to delete review',
      color: 'error'
    })
  }
}
</script>
