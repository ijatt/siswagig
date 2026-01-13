<template>
  <div>
    <NuxtLayout name="admin">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Jobs Management</h1>
          <p class="text-slate-500 mt-1">Approve, reject, and manage all job listings</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <Icon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Search jobs by title or description..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                @input="debouncedSearch"
              />
            </div>
          </div>
          
          <!-- Status Filter -->
          <select 
            v-model="statusFilter"
            @change="fetchJobs"
            class="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all bg-white"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          
          <!-- Category Filter -->
          <select 
            v-model="categoryFilter"
            @change="fetchJobs"
            class="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all bg-white"
          >
            <option value="all">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <!-- Jobs Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Job</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Budget</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Applications</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Posted</th>
                <th class="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="job in jobs" :key="job.job_id" class="hover:bg-slate-50 transition-colors">
                <!-- Job Info -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="job.image_url || 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=100&h=100&fit=crop'"
                      class="w-12 h-12 rounded-xl object-cover"
                      :alt="job.title"
                    />
                    <div class="max-w-xs">
                      <p class="font-medium text-slate-800 truncate">{{ job.title }}</p>
                      <p class="text-sm text-slate-500">by {{ job.user?.name }}</p>
                    </div>
                  </div>
                </td>
                
                <!-- Category -->
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm">
                    {{ job.category }}
                  </span>
                </td>
                
                <!-- Budget -->
                <td class="px-6 py-4">
                  <p class="font-semibold text-slate-800">RM{{ job.budget }}</p>
                </td>
                
                <!-- Status -->
                <td class="px-6 py-4">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                    job.status === 'open' ? 'bg-green-100 text-green-700' :
                    job.status === 'closed' ? 'bg-slate-100 text-slate-700' :
                    job.status === 'in progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  ]">
                    {{ job.status }}
                  </span>
                </td>
                
                <!-- Applications Count -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1.5">
                    <Icon name="i-lucide-users" class="text-slate-400" />
                    <span class="text-slate-600">{{ job._count?.applications || 0 }}</span>
                  </div>
                </td>
                
                <!-- Posted Date -->
                <td class="px-6 py-4">
                  <p class="text-sm text-slate-600 whitespace-nowrap">{{ formatDate(job.created_at) }}</p>
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <!-- Change Status -->
                    <UDropdownMenu :items="getStatusActions(job)">
                      <button class="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="Change Status">
                        <Icon name="i-lucide-settings" />
                      </button>
                    </UDropdownMenu>
                    
                    <!-- View -->
                    <button 
                      @click="viewJob(job)"
                      class="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                      title="View Details"
                    >
                      <Icon name="i-lucide-eye" />
                    </button>
                    
                    <!-- Delete -->
                    <button 
                      @click="confirmDelete(job)"
                      class="p-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                      title="Delete Job"
                    >
                      <Icon name="i-lucide-trash-2" />
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr v-if="jobs.length === 0 && !pending">
                <td colspan="7" class="px-6 py-12 text-center">
                  <Icon name="i-lucide-briefcase" class="text-4xl text-slate-300 mb-3" />
                  <p class="text-slate-500">No jobs found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="pagination" class="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p class="text-sm text-slate-600">
            Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} jobs
          </p>
          <div class="flex items-center gap-2">
            <button 
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button 
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Job Details Modal -->
      <UModal v-model:open="showDetailsModal">
        <template #content>
          <div class="p-6 max-h-[80vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-slate-800">Job Details</h3>
              <button @click="showDetailsModal = false" class="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <Icon name="i-lucide-x" />
              </button>
            </div>
            
            <div v-if="selectedJob" class="space-y-6">
              <!-- Job Image -->
              <img 
                :src="selectedJob.image_url || 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=200&fit=crop'"
                class="w-full h-48 rounded-xl object-cover"
              />
              
              <!-- Title & Status -->
              <div class="flex items-start justify-between gap-4">
                <h2 class="text-xl font-bold text-slate-800">{{ selectedJob.title }}</h2>
                <span :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                  selectedJob.status === 'open' ? 'bg-green-100 text-green-700' :
                  selectedJob.status === 'closed' ? 'bg-slate-100 text-slate-700' :
                  'bg-blue-100 text-blue-700'
                ]">{{ selectedJob.status }}</span>
              </div>
              
              <!-- Posted By -->
              <div class="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                <img 
                  :src="selectedJob.user?.image_url || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'"
                  class="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <p class="font-medium text-slate-800">{{ selectedJob.user?.name }}</p>
                  <p class="text-sm text-slate-500">{{ selectedJob.user?.email }}</p>
                </div>
              </div>
              
              <!-- Description -->
              <div>
                <p class="text-sm font-medium text-slate-500 mb-2">Description</p>
                <p class="text-slate-700 whitespace-pre-wrap">{{ selectedJob.description }}</p>
              </div>
              
              <!-- Details Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded-xl bg-slate-50">
                  <p class="text-sm font-medium text-slate-500">Budget</p>
                  <p class="text-lg font-semibold text-slate-800">RM{{ selectedJob.budget }}</p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50">
                  <p class="text-sm font-medium text-slate-500">Category</p>
                  <p class="text-lg font-semibold text-slate-800">{{ selectedJob.category }}</p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50">
                  <p class="text-sm font-medium text-slate-500">Location</p>
                  <p class="text-lg font-semibold text-slate-800">{{ selectedJob.location || 'Not specified' }}</p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50">
                  <p class="text-sm font-medium text-slate-500">Deadline</p>
                  <p class="text-lg font-semibold text-slate-800">{{ formatDate(selectedJob.deadline) }}</p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50">
                  <p class="text-sm font-medium text-slate-500">Applications</p>
                  <p class="text-lg font-semibold text-slate-800">{{ selectedJob._count?.applications || 0 }}</p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50">
                  <p class="text-sm font-medium text-slate-500">Reviews</p>
                  <p class="text-lg font-semibold text-slate-800">{{ selectedJob._count?.reviews || 0 }}</p>
                </div>
              </div>
              
              <!-- Required Skills -->
              <div v-if="selectedJob.requiredSkills">
                <p class="text-sm font-medium text-slate-500 mb-2">Required Skills</p>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="skill in selectedJob.requiredSkills.split(',')" 
                    :key="skill"
                    class="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm"
                  >
                    {{ skill.trim() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Delete Confirmation Modal -->
      <UModal v-model:open="showDeleteModal">
        <template #content>
          <div class="p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Icon name="i-lucide-alert-triangle" class="text-2xl text-red-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-800">Delete Job</h3>
                <p class="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p class="text-slate-600 mb-6">
              Are you sure you want to delete <strong>{{ jobToDelete?.title }}</strong>? All related applications and reviews will also be removed.
            </p>
            <div class="flex justify-end gap-3">
              <button 
                @click="showDeleteModal = false"
                class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="deleteJob"
                class="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Delete Job
              </button>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Loading State -->
      <div v-if="pending" class="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          <p class="text-slate-600 font-medium">Loading jobs...</p>
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
  title: 'Jobs Management | SiswaGig Admin',
  description: 'Manage all job listings'
})

const toast = useToast()
const tokenStore = useMyTokenStore()

// State
const searchQuery = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const currentPage = ref(1)
const showDetailsModal = ref(false)
const showDeleteModal = ref(false)
const selectedJob = ref<any>(null)
const jobToDelete = ref<any>(null)

// Fetch jobs
const { data, pending, refresh } = await useFetch('/api/admin/jobs', {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  },
  query: {
    page: currentPage,
    status: statusFilter,
    category: categoryFilter,
    search: searchQuery
  }
})

const jobs = computed(() => data.value?.jobs || [])
const categories = computed(() => data.value?.categories || [])
const pagination = computed(() => data.value?.pagination)

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchJobs()
  }, 300)
}

// Fetch jobs
const fetchJobs = async () => {
  await refresh()
}

// Go to page
const goToPage = (page: number) => {
  currentPage.value = page
  fetchJobs()
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// View job details
const viewJob = (job: any) => {
  selectedJob.value = job
  showDetailsModal.value = true
}

// Get status actions
const getStatusActions = (job: any) => [
  [
    {
      label: 'Set as Open',
      icon: 'i-lucide-check-circle',
      disabled: job.status === 'open',
      onSelect: () => changeStatus(job.job_id, 'open')
    },
    {
      label: 'Set as In Progress',
      icon: 'i-lucide-loader',
      disabled: job.status === 'in progress',
      onSelect: () => changeStatus(job.job_id, 'in progress')
    },
    {
      label: 'Set as Closed',
      icon: 'i-lucide-x-circle',
      disabled: job.status === 'closed',
      onSelect: () => changeStatus(job.job_id, 'closed')
    }
  ]
]

// Change status
const changeStatus = async (jobId: number, status: string) => {
  try {
    await $fetch(`/api/admin/jobs/${jobId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: { status }
    })
    
    toast.add({
      title: 'Success',
      description: 'Job status updated successfully',
      color: 'success'
    })
    
    await fetchJobs()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.statusMessage || 'Failed to update job status',
      color: 'error'
    })
  }
}

// Confirm delete
const confirmDelete = (job: any) => {
  jobToDelete.value = job
  showDeleteModal.value = true
}

// Delete job
const deleteJob = async () => {
  if (!jobToDelete.value) return
  
  try {
    await $fetch(`/api/admin/jobs/${jobToDelete.value.job_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    })
    
    toast.add({
      title: 'Success',
      description: 'Job deleted successfully',
      color: 'success'
    })
    
    showDeleteModal.value = false
    jobToDelete.value = null
    await fetchJobs()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.statusMessage || 'Failed to delete job',
      color: 'error'
    })
  }
}
</script>
