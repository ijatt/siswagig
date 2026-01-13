<template>
  <div>
    <NuxtLayout name="admin">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Applications Management</h1>
          <p class="text-slate-500 mt-1">View and manage all job applications</p>
        </div>
      </div>

      <!-- Status Tabs -->
      <div class="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 mb-6">
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="status in statusTabs" 
            :key="status.value"
            @click="statusFilter = status.value; fetchApplications()"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              statusFilter === status.value 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' 
                : 'text-slate-600 hover:bg-slate-100'
            ]"
          >
            {{ status.label }}
            <span v-if="statusCounts?.[status.value]" class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
              {{ statusCounts[status.value] }}
            </span>
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div class="relative">
          <Icon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search by applicant name, job title, or cover letter..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
            @input="debouncedSearch"
          />
        </div>
      </div>

      <!-- Applications List -->
      <div class="space-y-4">
        <div 
          v-for="application in applications" 
          :key="application.application_id"
          class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col lg:flex-row lg:items-start gap-6">
            <!-- Applicant Info -->
            <div class="flex items-start gap-4 flex-1">
              <img 
                :src="application.user?.image_url || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'"
                class="w-12 h-12 rounded-xl object-cover"
                :alt="application.user?.name"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-1">
                  <h3 class="font-semibold text-slate-800">{{ application.user?.name }}</h3>
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    application.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    application.status === 'Interview' ? 'bg-blue-100 text-blue-700' :
                    application.status === 'Hired' ? 'bg-purple-100 text-purple-700' :
                    application.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    application.status === 'Submitted' ? 'bg-orange-100 text-orange-700' :
                    application.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    application.status === 'Revision' ? 'bg-yellow-100 text-yellow-700' :
                    application.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  ]">
                    {{ application.status }}
                  </span>
                </div>
                <p class="text-sm text-slate-500">{{ application.user?.email }}</p>
                
                <!-- Job Info -->
                <div class="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p class="text-sm font-medium text-slate-700">Applied for: {{ application.job?.title }}</p>
                  <div class="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span>Budget: RM{{ application.job?.budget }}</span>
                    <span>•</span>
                    <span>Posted by: {{ application.job?.user?.name }}</span>
                  </div>
                </div>
                
                <!-- Cover Letter -->
                <div class="mt-3">
                  <p class="text-sm text-slate-600 line-clamp-2">{{ application.cover_letter }}</p>
                </div>
                
                <!-- Application Details -->
                <div class="flex items-center gap-4 mt-3 text-sm text-slate-500">
                  <span class="flex items-center gap-1">
                    <Icon name="i-lucide-banknote" class="text-slate-400" />
                    RM{{ application.price_offered }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon name="i-lucide-calendar" class="text-slate-400" />
                    {{ formatDate(application.estimated_completion) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon name="i-lucide-clock" class="text-slate-400" />
                    {{ formatDate(application.created_at) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center gap-2 lg:flex-col">
              <UDropdownMenu :items="getStatusActions(application)">
                <button class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors flex items-center gap-2">
                  <Icon name="i-lucide-settings" />
                  Change Status
                </button>
              </UDropdownMenu>
              
              <button 
                @click="viewDetails(application)"
                class="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Icon name="i-lucide-eye" />
                View Details
              </button>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="applications.length === 0 && !pending" class="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
          <Icon name="i-lucide-file-text" class="text-5xl text-slate-300 mb-4" />
          <p class="text-lg font-medium text-slate-600">No applications found</p>
          <p class="text-slate-500 mt-1">Try adjusting your filters or search query</p>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination && applications.length > 0" class="flex items-center justify-between mt-6 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-600">
          Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} applications
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

      <!-- Application Details Modal -->
      <UModal v-model:open="showDetailsModal">
        <template #content>
          <div class="p-6 max-h-[80vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-slate-800">Application Details</h3>
              <button @click="showDetailsModal = false" class="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <Icon name="i-lucide-x" />
              </button>
            </div>
            
            <div v-if="selectedApplication" class="space-y-6">
              <!-- Applicant -->
              <div class="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                <img 
                  :src="selectedApplication.user?.image_url || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'"
                  class="w-14 h-14 rounded-xl object-cover"
                />
                <div>
                  <p class="font-semibold text-slate-800">{{ selectedApplication.user?.name }}</p>
                  <p class="text-sm text-slate-500">{{ selectedApplication.user?.email }}</p>
                </div>
              </div>
              
              <!-- Job -->
              <div>
                <p class="text-sm font-medium text-slate-500 mb-2">Applied For</p>
                <p class="font-semibold text-slate-800">{{ selectedApplication.job?.title }}</p>
                <p class="text-sm text-slate-600">Budget: RM{{ selectedApplication.job?.budget }}</p>
              </div>
              
              <!-- Cover Letter -->
              <div>
                <p class="text-sm font-medium text-slate-500 mb-2">Cover Letter</p>
                <p class="text-slate-700 whitespace-pre-wrap">{{ selectedApplication.cover_letter }}</p>
              </div>
              
              <!-- Details Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded-xl bg-slate-50">
                  <p class="text-sm font-medium text-slate-500">Price Offered</p>
                  <p class="text-lg font-semibold text-slate-800">RM{{ selectedApplication.price_offered }}</p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50">
                  <p class="text-sm font-medium text-slate-500">Estimated Completion</p>
                  <p class="text-lg font-semibold text-slate-800">{{ formatDate(selectedApplication.estimated_completion) }}</p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50">
                  <p class="text-sm font-medium text-slate-500">Status</p>
                  <p class="text-lg font-semibold" :class="[
                    selectedApplication.status === 'Pending' ? 'text-amber-600' :
                    selectedApplication.status === 'Interview' ? 'text-blue-600' :
                    selectedApplication.status === 'Hired' ? 'text-purple-600' :
                    selectedApplication.status === 'In Progress' ? 'text-blue-600' :
                    selectedApplication.status === 'Submitted' ? 'text-orange-600' :
                    selectedApplication.status === 'Completed' ? 'text-green-600' :
                    selectedApplication.status === 'Rejected' ? 'text-red-600' :
                    'text-slate-800'
                  ]">{{ selectedApplication.status }}</p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50">
                  <p class="text-sm font-medium text-slate-500">Applied On</p>
                  <p class="text-lg font-semibold text-slate-800">{{ formatDate(selectedApplication.created_at) }}</p>
                </div>
              </div>
              
              <!-- Payment Info -->
              <div v-if="selectedApplication.payment" class="p-4 rounded-xl border border-slate-200">
                <p class="text-sm font-medium text-slate-500 mb-2">Payment Information</p>
                <div class="flex items-center justify-between">
                  <span class="text-slate-700">Amount: RM{{ selectedApplication.payment.amount }}</span>
                  <span :class="[
                    'px-2.5 py-0.5 rounded-full text-xs font-medium',
                    selectedApplication.payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                    selectedApplication.payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  ]">{{ selectedApplication.payment.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Loading State -->
      <div v-if="pending" class="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          <p class="text-slate-600 font-medium">Loading applications...</p>
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
  title: 'Applications Management | SiswaGig Admin',
  description: 'Manage all job applications'
})

const toast = useToast()
const tokenStore = useMyTokenStore()

// State
const searchQuery = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const showDetailsModal = ref(false)
const selectedApplication = ref<any>(null)

// Status tabs
const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Interview', value: 'Interview' },
  { label: 'Hired', value: 'Hired' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Submitted', value: 'Submitted' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Rejected', value: 'Rejected' }
]

// Fetch applications
const { data, pending, refresh } = await useFetch('/api/admin/applications', {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  },
  query: {
    page: currentPage,
    status: statusFilter,
    search: searchQuery
  }
})

const applications = computed(() => data.value?.applications || [])
const pagination = computed(() => data.value?.pagination)
const statusCounts = computed(() => data.value?.statusCounts || {})

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchApplications()
  }, 300)
}

// Fetch applications
const fetchApplications = async () => {
  await refresh()
}

// Go to page
const goToPage = (page: number) => {
  currentPage.value = page
  fetchApplications()
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// View details
const viewDetails = (application: any) => {
  selectedApplication.value = application
  showDetailsModal.value = true
}

// Get status actions
const getStatusActions = (application: any) => [
  [
    {
      label: 'Set as Pending',
      icon: 'i-lucide-clock',
      disabled: application.status === 'Pending',
      onSelect: () => changeStatus(application.application_id, 'Pending')
    },
    {
      label: 'Set as Interview',
      icon: 'i-lucide-video',
      disabled: application.status === 'Interview',
      onSelect: () => changeStatus(application.application_id, 'Interview')
    },
    {
      label: 'Set as Hired',
      icon: 'i-lucide-user-check',
      disabled: application.status === 'Hired',
      onSelect: () => changeStatus(application.application_id, 'Hired')
    },
    {
      label: 'Set as In Progress',
      icon: 'i-lucide-loader',
      disabled: application.status === 'In Progress',
      onSelect: () => changeStatus(application.application_id, 'In Progress')
    },
    {
      label: 'Set as Submitted',
      icon: 'i-lucide-send',
      disabled: application.status === 'Submitted',
      onSelect: () => changeStatus(application.application_id, 'Submitted')
    },
    {
      label: 'Set as Completed',
      icon: 'i-lucide-check-check',
      disabled: application.status === 'Completed',
      onSelect: () => changeStatus(application.application_id, 'Completed')
    },
    {
      label: 'Set as Rejected',
      icon: 'i-lucide-x-circle',
      disabled: application.status === 'Rejected',
      onSelect: () => changeStatus(application.application_id, 'Rejected')
    }
  ]
]

// Change status
const changeStatus = async (applicationId: number, status: string) => {
  try {
    await $fetch(`/api/admin/applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: { status }
    })
    
    toast.add({
      title: 'Success',
      description: 'Application status updated successfully',
      color: 'success'
    })
    
    await fetchApplications()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.statusMessage || 'Failed to update application status',
      color: 'error'
    })
  }
}
</script>
