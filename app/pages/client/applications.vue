<script setup lang="ts">

definePageMeta({
  middleware: "auth",
});

useSeoMeta({
  title: 'Job Applications | SiswaGig',
  description: 'Manage and track all your job applications in one place. View application statuses, communicate with clients, and stay updated on your freelance opportunities.',
  ogTitle: 'Job Applications | SiswaGig',
  ogDescription: 'Keep track of your job applications and their statuses on SiswaGig.'
})

// State
const jobs = ref<any[]>([])
const loading = ref(true)
const activeTab = ref('all')
const selectedJob = ref<any>(null)
const isDrawerOpen = ref(false)
const searchQuery = ref('')

// Sorting
const showSortDropdown = ref(false)
const activeSort = ref('newest')
const sortOptions = [
  { label: 'Newest First', value: 'newest', icon: 'i-lucide-arrow-down' },
  { label: 'Oldest First', value: 'oldest', icon: 'i-lucide-arrow-up' },
  { label: 'Most Applications', value: 'applications-high', icon: 'i-lucide-users' },
  { label: 'Highest Budget', value: 'budget-high', icon: 'i-lucide-trending-up' },
  { label: 'Lowest Budget', value: 'budget-low', icon: 'i-lucide-trending-down' }
]

const currentSortLabel = computed(() => {
  const option = sortOptions.find(o => o.value === activeSort.value)
  return option?.label || 'Sort'
})

const selectSort = (value: string) => {
  activeSort.value = value
  showSortDropdown.value = false
}

// Application status configurations
const statusConfig = (status: string) => {
  switch (status) {
    case 'Pending':
      return { color: 'warning', icon: 'i-lucide-clock', bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200' }
    case 'Interview':
      return { color: 'info', icon: 'i-lucide-video', bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-200' }
    case 'Hired':
      return { color: 'primary', icon: 'i-lucide-user-check', bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-200' }
    case 'In Progress':
      return { color: 'info', icon: 'i-lucide-play-circle', bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-200' }
    case 'Submitted':
      return { color: 'warning', icon: 'i-lucide-send', bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-200' }
    case 'Completed':
      return { color: 'success', icon: 'i-lucide-check-circle', bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200' }
    case 'Revision':
      return { color: 'warning', icon: 'i-lucide-refresh-cw', bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'ring-yellow-200' }
    case 'Rejected':
      return { color: 'error', icon: 'i-lucide-x-circle', bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-200' }
    default:
      return { color: 'neutral', icon: 'i-lucide-circle', bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-200' }
  }
}

// Job status configurations
const jobStatusConfig = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return { icon: 'i-lucide-circle-dot', bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Open' }
    case 'in progress':
    case 'in_progress':
      return { icon: 'i-lucide-loader', bg: 'bg-blue-500', text: 'text-blue-600', label: 'In Progress' }
    case 'closed':
    case 'completed':
      return { icon: 'i-lucide-check-circle-2', bg: 'bg-gray-400', text: 'text-gray-600', label: 'Closed' }
    default:
      return { icon: 'i-lucide-circle', bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Open' }
  }
}

// Tabs configuration - more action-oriented
const tabs = [
  { key: 'all', label: 'All Jobs', icon: 'i-lucide-layout-grid' },
  { key: 'needs-review', label: 'Needs Review', icon: 'i-lucide-bell' },
  { key: 'work-submitted', label: 'Work Submitted', icon: 'i-lucide-file-check' },
  { key: 'ongoing', label: 'Ongoing', icon: 'i-lucide-play-circle' },
  { key: 'completed', label: 'Completed', icon: 'i-lucide-check-circle' }
]

// Priority action counts
const priorityActions = computed(() => {
  const pendingReview = jobs.value.reduce((sum, job) => 
    sum + (job.applications?.filter((a: any) => a.status === 'Pending').length || 0), 0)
  
  const workSubmitted = jobs.value.reduce((sum, job) => 
    sum + (job.applications?.filter((a: any) => a.status === 'Submitted').length || 0), 0)
  
  const paymentsPending = jobs.value.reduce((sum, job) => 
    sum + (job.applications?.filter((a: any) => 
      a.status === 'Completed' && (!a.payment || a.payment.status === 'pending')
    ).length || 0), 0)
  
  return { pendingReview, workSubmitted, paymentsPending }
})

// Get application status breakdown for a job
const getStatusBreakdown = (job: any) => {
  if (!job.applications?.length) return []
  
  const statusCounts: Record<string, number> = {}
  job.applications.forEach((app: any) => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1
  })
  
  const statusOrder = ['Pending', 'Submitted', 'In Progress', 'Hired', 'Completed', 'Rejected']
  return statusOrder
    .filter(status => statusCounts[status])
    .map(status => ({ status, count: statusCounts[status] }))
}

// Get primary action for a job
const getJobPrimaryAction = (job: any) => {
  const apps = job.applications || []
  
  // Check for submitted work first
  const submitted = apps.find((a: any) => a.status === 'Submitted')
  if (submitted) return { type: 'review-work', app: submitted, label: 'Review Work', icon: 'i-lucide-file-check' }
  
  // Check for completed with pending payment
  const needsPayment = apps.find((a: any) => 
    a.status === 'Completed' && (!a.payment || a.payment.status === 'pending')
  )
  if (needsPayment) return { type: 'pay', app: needsPayment, label: 'Pay Now', icon: 'i-lucide-credit-card' }
  
  // Check for pending applications
  const pending = apps.filter((a: any) => a.status === 'Pending').length
  if (pending) return { type: 'review-apps', count: pending, label: `Review ${pending} Applications`, icon: 'i-lucide-users' }
  
  return null
}

// Computed properties
const filteredJobs = computed(() => {
  let result = [...jobs.value]

  // Filter by tab
  if (activeTab.value === 'needs-review') {
    // Jobs with pending applications
    result = result.filter(job => 
      job.applications?.some((app: any) => app.status === 'Pending')
    )
  } else if (activeTab.value === 'work-submitted') {
    // Jobs with submitted work awaiting approval
    result = result.filter(job => 
      job.applications?.some((app: any) => app.status === 'Submitted')
    )
  } else if (activeTab.value === 'ongoing') {
    // Jobs with at least one application that is Hired, In Progress, or Revision
    result = result.filter(job => 
      job.applications?.some((app: any) => 
        ['Hired', 'In Progress', 'Revision'].includes(app.status)
      )
    )
  } else if (activeTab.value === 'completed') {
    result = result.filter(job => 
      job.status?.toLowerCase() === 'closed' || 
      job.status?.toLowerCase() === 'completed' ||
      job.applications?.some((app: any) => app.status === 'Completed')
    )
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(job => 
      job.title?.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  result.sort((a, b) => {
    // Prioritize jobs with pending applications
    const aPending = a.applications?.filter((app: any) => app.status === 'Pending').length || 0
    const bPending = b.applications?.filter((app: any) => app.status === 'Pending').length || 0
    if (aPending > 0 && bPending === 0) return -1
    if (aPending === 0 && bPending > 0) return 1
    
    // Then prioritize jobs with submitted work
    const aSubmitted = a.applications?.some((app: any) => app.status === 'Submitted')
    const bSubmitted = b.applications?.some((app: any) => app.status === 'Submitted')
    if (aSubmitted && !bSubmitted) return -1
    if (!aSubmitted && bSubmitted) return 1

    switch (activeSort.value) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'applications-high':
        return (b.applications?.length || 0) - (a.applications?.length || 0)
      case 'budget-high':
        return (b.budget || 0) - (a.budget || 0)
      case 'budget-low':
        return (a.budget || 0) - (b.budget || 0)
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return result
})

const totalApplications = computed(() => {
  return jobs.value.reduce((sum, job) => sum + (job.applications?.length || 0), 0)
})

const pendingCount = computed(() => {
  return jobs.value.reduce((sum, job) => 
    sum + (job.applications?.filter((a: any) => a.status === 'Pending').length || 0), 0)
})

const hiredCount = computed(() => {
  return jobs.value.reduce((sum, job) => 
    sum + (job.applications?.filter((a: any) => a.status === 'Hired').length || 0), 0)
})

const activeJobsCount = computed(() => {
  return jobs.value.filter(job => job.status?.toLowerCase() !== 'closed' && job.status?.toLowerCase() !== 'completed').length
})

const ongoingJobsCount = computed(() => {
  return jobs.value.filter(job => 
    job.applications?.some((app: any) => 
      ['Hired', 'In Progress', 'Submitted', 'Revision'].includes(app.status)
    )
  ).length
})

const tabCounts = computed(() => ({
  all: jobs.value.length,
  'needs-review': jobs.value.filter(job => 
    job.applications?.some((a: any) => a.status === 'Pending')
  ).length,
  'work-submitted': jobs.value.filter(job => 
    job.applications?.some((a: any) => a.status === 'Submitted')
  ).length,
  ongoing: ongoingJobsCount.value,
  completed: jobs.value.filter(job => 
    job.status?.toLowerCase() === 'closed' || 
    job.status?.toLowerCase() === 'completed' ||
    job.applications?.some((a: any) => a.status === 'Completed')
  ).length
}))

// Group applications by status in drawer
const groupedApplications = computed(() => {
  if (!selectedJob.value?.applications?.length) return {}
  
  const groups: Record<string, any[]> = {
    'Needs Action': [],
    'In Progress': [],
    'Completed': [],
    'Other': []
  }
  
  selectedJob.value.applications.forEach((app: any) => {
    if (['Pending', 'Submitted'].includes(app.status)) {
      groups['Needs Action']!.push(app)
    } else if (['Hired', 'In Progress', 'Revision', 'Interview'].includes(app.status)) {
      groups['In Progress']!.push(app)
    } else if (app.status === 'Completed') {
      groups['Completed']!.push(app)
    } else {
      groups['Other']!.push(app)
    }
  })
  
  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (!groups[key]?.length) delete groups[key]
  })
  
  return groups
})

// Methods
async function loadApplications() {
  loading.value = true
  try {
    const data = await $fetch('/api/jobs/client-applications', {
      method: "GET",
      headers: {
        authorization: `Bearer ${useMyTokenStore().accessToken}`,
      }
    })
    jobs.value = data as any[]
  } catch (err) {
    console.error('Failed to load applications:', err)
  } finally {
    loading.value = false
  }
}

const openApplicationsDrawer = (job: any) => {
  selectedJob.value = job
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
  setTimeout(() => {
    selectedJob.value = null
  }, 300)
}

const viewApplication = (appId: number) => {
  navigateTo(`/applications/${appId}`)
}

const messageApplicant = (userId: number, userName: string) => {
  navigateTo(`/inbox?userId=${userId}&name=${userName}`)
}

const updateStatus = async (appId: number, status: string) => {
  try {
    await $fetch(`/api/applications/${appId}`, {
      method: 'POST',
      body: { status }
    })
    await loadApplications()
    // Update selected job if drawer is open
    if (selectedJob.value) {
      selectedJob.value = jobs.value.find(j => j.job_id === selectedJob.value.job_id)
    }
  } catch (err) {
    console.error('Failed to update status:', err)
  }
}

const getTimeAgo = (date: string) => {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

// Close drawer on escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isDrawerOpen.value) {
    closeDrawer()
  }
}

onMounted(() => {
  loadApplications()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 max-w-7xl mx-auto">
    <!-- Header Section -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <!-- Top Row: Title and Actions -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-purple-200">
                <UIcon name="i-lucide-briefcase" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Job Dashboard</h1>
                <p class="text-sm text-gray-500">Manage your jobs and applications</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button 
                @click="loadApplications"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
                :disabled="loading"
              >
                <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" :class="{ 'animate-spin': loading }" />
                <span class="hidden sm:inline">Refresh</span>
              </button>
              <NuxtLink 
                to="/jobs/create"
                class="btn-gradient px-5 py-2.5 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <UIcon name="i-lucide-plus" class="w-4 h-4" />
                New Job
              </NuxtLink>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 border border-purple-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <UIcon name="i-lucide-briefcase" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-purple-700">{{ jobs.length }}</p>
                  <p class="text-xs text-purple-600/70">Total Jobs</p>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <UIcon name="i-lucide-users" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-blue-700">{{ totalApplications }}</p>
                  <p class="text-xs text-blue-600/70">Applications</p>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-4 border border-amber-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <UIcon name="i-lucide-clock" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-amber-700">{{ pendingCount }}</p>
                  <p class="text-xs text-amber-600/70">Pending</p>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <UIcon name="i-lucide-user-check" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-emerald-700">{{ hiredCount }}</p>
                  <p class="text-xs text-emerald-600/70">Hired</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Priority Action Banner - Compact -->
          <div 
            v-if="priorityActions.pendingReview > 0 || priorityActions.workSubmitted > 0 || priorityActions.paymentsPending > 0" 
            class="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl p-3 border border-amber-200/50 mb-4"
          >
            <div class="flex items-center gap-4 flex-wrap">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center">
                  <UIcon name="i-lucide-bell" class="w-3 h-3 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700">Actions:</span>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <button 
                  v-if="priorityActions.pendingReview > 0"
                  @click="activeTab = 'needs-review'"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-200 hover:border-amber-400 text-sm font-medium text-amber-700 hover:shadow-sm transition-all"
                >
                  <UIcon name="i-lucide-users" class="w-4 h-4" />
                  {{ priorityActions.pendingReview }} Pending
                </button>
                <button 
                  v-if="priorityActions.workSubmitted > 0"
                  @click="activeTab = 'work-submitted'"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-orange-200 hover:border-orange-400 text-sm font-medium text-orange-700 hover:shadow-sm transition-all"
                >
                  <UIcon name="i-lucide-file-check" class="w-4 h-4" />
                  {{ priorityActions.workSubmitted }} Submitted
                </button>
                <button 
                  v-if="priorityActions.paymentsPending > 0"
                  @click="navigateTo('/payments')"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-purple-200 hover:border-purple-400 text-sm font-medium text-purple-700 hover:shadow-sm transition-all"
                >
                  <UIcon name="i-lucide-credit-card" class="w-4 h-4" />
                  {{ priorityActions.paymentsPending }} Payments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Tabs and Search Bar -->
    <div class="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex flex-col gap-3">
          <!-- Tabs Row -->
          <div class="flex flex-wrap items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              :class="[
                'relative flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all',
                activeTab === tab.key 
                  ? 'bg-white text-purple-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <UIcon :name="tab.icon" class="w-4 h-4" />
              <span class="hidden sm:inline">{{ tab.label }}</span>
              <!-- Count Badge -->
              <span 
                v-if="tabCounts[tab.key as keyof typeof tabCounts] > 0"
                :class="[
                  'px-1.5 py-0.5 rounded-full text-xs font-semibold',
                  activeTab === tab.key ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600',
                  (tab.key === 'needs-review' || tab.key === 'work-submitted') && tabCounts[tab.key as keyof typeof tabCounts] > 0
                    ? '!bg-amber-100 !text-amber-700'
                    : ''
                ]"
              >
                {{ tabCounts[tab.key as keyof typeof tabCounts] }}
              </span>
              <!-- Notification Dot -->
              <span 
                v-if="(tab.key === 'needs-review' && priorityActions.pendingReview > 0) || (tab.key === 'work-submitted' && priorityActions.workSubmitted > 0)"
                class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"
              ></span>
            </button>
          </div>

          <!-- Search and Sort Row -->
          <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="relative flex-1">
              <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search jobs..."
                class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
              />
            </div>

            <!-- Sort Dropdown -->
            <div class="relative">
              <button
                @click="showSortDropdown = !showSortDropdown"
                class="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-all"
              >
                <UIcon name="i-lucide-arrow-up-down" class="w-4 h-4" />
                <span class="hidden sm:inline">{{ currentSortLabel }}</span>
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
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
          <div class="flex items-start justify-between">
            <USkeleton class="h-6 w-3/4 rounded-lg" />
            <USkeleton class="h-6 w-16 rounded-full" />
          </div>
          <USkeleton class="h-4 w-full rounded-lg" />
          <USkeleton class="h-4 w-2/3 rounded-lg" />
          <div class="flex gap-2 pt-2">
            <USkeleton class="h-8 w-20 rounded-lg" />
            <USkeleton class="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredJobs.length" class="flex flex-col items-center justify-center py-16">
        <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-6">
          <UIcon name="i-lucide-inbox" class="w-12 h-12 text-purple-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">
          {{ searchQuery ? 'No matching jobs found' : 'No jobs yet' }}
        </h3>
        <p class="text-gray-500 text-center max-w-md mb-6">
          {{ searchQuery 
            ? 'Try adjusting your search or filters to find what you\'re looking for.' 
            : 'Post your first job to start receiving applications from talented freelancers.' 
          }}
        </p>
        <NuxtLink 
          v-if="!searchQuery"
          to="/jobs/create"
          class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg"
        >
          <UIcon name="i-lucide-plus" class="w-5 h-5" />
          Post Your First Job
        </NuxtLink>
        <button 
          v-else
          @click="searchQuery = ''"
          class="px-6 py-3 rounded-xl font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all"
        >
          Clear Search
        </button>
      </div>

      <!-- Job Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="job in filteredJobs" 
          :key="job.job_id"
          class="group bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 overflow-hidden"
        >
          <!-- Card Header with Status -->
          <div class="p-5 pb-0">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 leading-snug">
                  {{ job.title }}
                </h3>
              </div>
              <div 
                :class="[
                  'flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                  jobStatusConfig(job.status).text,
                  'bg-opacity-10',
                  job.status?.toLowerCase() === 'closed' || job.status?.toLowerCase() === 'completed' 
                    ? 'bg-gray-100' 
                    : 'bg-emerald-50'
                ]"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', jobStatusConfig(job.status).bg]"></span>
                {{ jobStatusConfig(job.status).label }}
              </div>
            </div>
            
            <p class="text-sm text-gray-500 line-clamp-2 mb-4">{{ job.description }}</p>

            <!-- Job Meta -->
            <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5" />
                {{ job.location || 'Remote' }}
              </span>
              <span class="flex items-center gap-1 text-purple-600 font-medium">
                <UIcon name="i-lucide-wallet" class="w-3.5 h-3.5" />
                RM {{ job.budget }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
                {{ useDateFormat(job.deadline, 'DD MMM') }}
              </span>
            </div>
          </div>

          <!-- Applications Preview -->
          <div class="px-5 pb-5">
            <!-- Status Breakdown Badges -->
            <div v-if="getStatusBreakdown(job).length" class="flex flex-wrap gap-1.5 mb-3">
              <span 
                v-for="item in getStatusBreakdown(job)" 
                :key="item.status"
                :class="[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  statusConfig(item.status).bg,
                  statusConfig(item.status).text
                ]"
              >
                <UIcon :name="statusConfig(item.status).icon" class="w-3 h-3" />
                {{ item.count }} {{ item.status }}
              </span>
            </div>

            <!-- Application Avatars Stack -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div v-if="job.applications?.length" class="flex -space-x-2">
                  <div 
                    v-for="(app, index) in job.applications.slice(0, 4)" 
                    :key="app.application_id"
                    class="relative"
                    :style="{ zIndex: 4 - Number(index) }"
                  >
                    <img 
                      :src="app.user.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.user.name)}&background=random`"
                      :alt="app.user.name"
                      class="w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                  </div>
                  <div 
                    v-if="job.applications.length > 4"
                    class="w-8 h-8 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700"
                  >
                    +{{ job.applications.length - 4 }}
                  </div>
                </div>
                <span 
                  v-if="job.applications?.length"
                  class="ml-3 text-sm text-gray-600"
                >
                  {{ job.applications.length }} {{ job.applications.length === 1 ? 'applicant' : 'applicants' }}
                </span>
                <span v-else class="text-sm text-gray-400 italic">No applications yet</span>
              </div>

              <!-- Pending Badge -->
              <div 
                v-if="job.applications?.filter((a: any) => a.status === 'Pending').length"
                class="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {{ job.applications.filter((a: any) => a.status === 'Pending').length }} new
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="px-5 py-4 bg-gray-50/50 border-t border-gray-100">
            <!-- Quick Action Button (if available) -->
            <div v-if="getJobPrimaryAction(job)" class="mb-3">
              <button 
                v-if="getJobPrimaryAction(job)?.type === 'review-work'"
                @click="openApplicationsDrawer(job)"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-sm transition-all"
              >
                <UIcon :name="getJobPrimaryAction(job)!.icon" class="w-4 h-4" />
                {{ getJobPrimaryAction(job)!.label }}
              </button>
              <NuxtLink 
                v-else-if="getJobPrimaryAction(job)?.type === 'pay'"
                :to="`/payments?application_id=${getJobPrimaryAction(job)!.app.application_id}`"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-sm transition-all"
              >
                <UIcon :name="getJobPrimaryAction(job)!.icon" class="w-4 h-4" />
                {{ getJobPrimaryAction(job)!.label }}
              </NuxtLink>
              <button 
                v-else-if="getJobPrimaryAction(job)?.type === 'review-apps'"
                @click="openApplicationsDrawer(job)"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 shadow-sm transition-all"
              >
                <UIcon :name="getJobPrimaryAction(job)!.icon" class="w-4 h-4" />
                {{ getJobPrimaryAction(job)!.label }}
              </button>
            </div>

            <!-- Standard Actions -->
            <div class="flex items-center gap-2">
              <button
                @click="openApplicationsDrawer(job)"
                :disabled="!job.applications?.length"
                :class="[
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  job.applications?.length
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                ]"
              >
                <UIcon name="i-lucide-users" class="w-4 h-4" />
                All Applications
              </button>
              <NuxtLink
                :to="`/jobs/${job.job_id}`"
                class="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all"
              >
                <UIcon name="i-lucide-external-link" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Post CTA -->
      <div v-if="filteredJobs.length" class="mt-12 text-center">
        <div class="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
          <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <UIcon name="i-lucide-sparkles" class="w-5 h-5 text-white" />
          </div>
          <div class="text-left">
            <p class="font-medium text-gray-900">Need more candidates?</p>
            <p class="text-sm text-gray-500">Post another job to expand your reach</p>
          </div>
          <NuxtLink 
            to="/jobs/create"
            class="btn-gradient px-5 py-2.5 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg"
          >
            Post Job
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Applications Drawer/Slideover -->
    <Teleport to="body">
      <Transition name="drawer">
        <div 
          v-if="isDrawerOpen" 
          class="fixed inset-0 z-50 flex justify-end"
        >
          <!-- Backdrop -->
          <div 
            class="absolute inset-0 bg-black/30 backdrop-blur-sm"
            @click="closeDrawer"
          ></div>

          <!-- Drawer Panel -->
          <div class="relative w-full max-w-lg bg-white shadow-2xl flex flex-col drawer-panel">
            <!-- Drawer Header -->
            <div class="flex-shrink-0 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0 pr-4">
                  <div class="flex items-center gap-2 mb-1">
                    <span 
                      :class="[
                        'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                        jobStatusConfig(selectedJob?.status).text,
                        selectedJob?.status?.toLowerCase() === 'closed' ? 'bg-gray-100' : 'bg-emerald-50'
                      ]"
                    >
                      <span :class="['w-1.5 h-1.5 rounded-full', jobStatusConfig(selectedJob?.status).bg]"></span>
                      {{ jobStatusConfig(selectedJob?.status).label }}
                    </span>
                  </div>
                  <h2 class="text-xl font-bold text-gray-900 line-clamp-2">{{ selectedJob?.title }}</h2>
                  <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span class="flex items-center gap-1">
                      <UIcon name="i-lucide-users" class="w-4 h-4" />
                      {{ selectedJob?.applications?.length || 0 }} applicants
                    </span>
                    <span class="flex items-center gap-1 text-purple-600 font-medium">
                      <UIcon name="i-lucide-wallet" class="w-4 h-4" />
                      RM {{ selectedJob?.budget }}
                    </span>
                  </div>
                </div>
                <button 
                  @click="closeDrawer"
                  class="flex-shrink-0 w-10 h-10 rounded-xl bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
                >
                  <UIcon name="i-lucide-x" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Drawer Content -->
            <div class="flex-1 overflow-y-auto">
              <!-- No Applications -->
              <div v-if="!selectedJob?.applications?.length" class="flex flex-col items-center justify-center h-full py-12 px-6">
                <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <UIcon name="i-lucide-user-x" class="w-8 h-8 text-gray-400" />
                </div>
                <h3 class="text-lg font-medium text-gray-700 mb-2">No applications yet</h3>
                <p class="text-gray-500 text-sm text-center">Applications will appear here when freelancers apply.</p>
              </div>

              <!-- Grouped Applications List -->
              <div v-else>
                <div 
                  v-for="(apps, groupName) in groupedApplications" 
                  :key="groupName"
                  class="border-b border-gray-100 last:border-b-0"
                >
                  <!-- Group Header -->
                  <div 
                    :class="[
                      'sticky top-0 z-10 px-6 py-3 bg-gradient-to-r border-b',
                      groupName === 'Needs Action' ? 'from-amber-50 to-orange-50 border-amber-200' :
                      groupName === 'In Progress' ? 'from-blue-50 to-indigo-50 border-blue-200' :
                      groupName === 'Completed' ? 'from-emerald-50 to-green-50 border-emerald-200' :
                      'from-gray-50 to-gray-100 border-gray-200'
                    ]"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <UIcon 
                          :name="groupName === 'Needs Action' ? 'i-lucide-bell' : 
                                 groupName === 'In Progress' ? 'i-lucide-play-circle' : 
                                 groupName === 'Completed' ? 'i-lucide-check-circle' : 'i-lucide-circle'"
                          :class="[
                            'w-4 h-4',
                            groupName === 'Needs Action' ? 'text-amber-600' :
                            groupName === 'In Progress' ? 'text-blue-600' :
                            groupName === 'Completed' ? 'text-emerald-600' : 'text-gray-600'
                          ]"
                        />
                        <span 
                          :class="[
                            'font-semibold text-sm',
                            groupName === 'Needs Action' ? 'text-amber-800' :
                            groupName === 'In Progress' ? 'text-blue-800' :
                            groupName === 'Completed' ? 'text-emerald-800' : 'text-gray-700'
                          ]"
                        >
                          {{ groupName }}
                        </span>
                      </div>
                      <span 
                        :class="[
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          groupName === 'Needs Action' ? 'bg-amber-200 text-amber-800' :
                          groupName === 'In Progress' ? 'bg-blue-200 text-blue-800' :
                          groupName === 'Completed' ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-700'
                        ]"
                      >
                        {{ apps.length }}
                      </span>
                    </div>
                  </div>

                  <!-- Applications in Group -->
                  <div class="divide-y divide-gray-100">
                    <div 
                      v-for="app in apps" 
                      :key="app.application_id"
                      class="p-6 hover:bg-gray-50/50 transition-colors"
                    >
                      <!-- Applicant Header -->
                      <div class="flex items-start gap-4">
                        <div class="relative flex-shrink-0">
                          <img 
                            :src="app.user.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.user.name)}&background=random`"
                            :alt="app.user.name"
                            class="w-14 h-14 rounded-xl object-cover ring-2 ring-gray-100"
                          />
                          <div 
                            :class="[
                              'absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-white',
                              statusConfig(app.status).bg
                            ]"
                          >
                            <UIcon :name="statusConfig(app.status).icon" :class="['w-3.5 h-3.5', statusConfig(app.status).text]" />
                          </div>
                        </div>

                        <div class="flex-1 min-w-0">
                          <div class="flex items-start justify-between gap-2">
                            <div>
                              <h4 class="font-semibold text-gray-900">{{ app.user.name }}</h4>
                              <p class="text-sm text-gray-500 flex items-center gap-1">
                                <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5" />
                                {{ app.user.location || 'Location not set' }}
                              </p>
                            </div>
                            <span 
                              :class="[
                                'flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                                statusConfig(app.status).bg,
                                statusConfig(app.status).text
                              ]"
                            >
                              <UIcon :name="statusConfig(app.status).icon" class="w-3 h-3" />
                              {{ app.status }}
                            </span>
                          </div>

                          <!-- Bio -->
                          <p v-if="app.user.bio" class="text-sm text-gray-600 mt-2 line-clamp-2">{{ app.user.bio }}</p>

                          <!-- Cover Letter -->
                          <div v-if="app.cover_letter" class="mt-3 p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                            <p class="text-xs font-medium text-purple-600 mb-1">Cover Letter</p>
                            <p class="text-sm text-gray-600 line-clamp-3">{{ app.cover_letter }}</p>
                          </div>

                      <!-- Applied Time -->
                          <p class="text-xs text-gray-400 mt-3 flex items-center gap-1">
                            <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
                            Applied {{ getTimeAgo(app.created_at) }}
                          </p>

                          <!-- Action Buttons -->
                          <div class="flex flex-wrap items-center gap-2 mt-4">
                        <button 
                          @click="viewApplication(app.application_id)"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-all"
                        >
                          <UIcon name="i-lucide-eye" class="w-3.5 h-3.5" />
                          View Details
                        </button>
                        <button 
                          @click="messageApplicant(app.user.user_id, app.user.name)"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-all"
                        >
                          <UIcon name="i-lucide-message-circle" class="w-3.5 h-3.5" />
                          Message
                        </button>
                        <button 
                          v-if="app.status === 'Pending'"
                          @click="updateStatus(app.application_id, 'Interview')"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-all"
                        >
                          <UIcon name="i-lucide-video" class="w-3.5 h-3.5" />
                          Interview
                        </button>
                        <button 
                          v-if="app.status === 'Pending' || app.status === 'Interview'"
                          @click="updateStatus(app.application_id, 'Hired')"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium hover:bg-emerald-200 transition-all"
                        >
                          <UIcon name="i-lucide-check" class="w-3.5 h-3.5" />
                          Hire
                        </button>
                        <button 
                          v-if="app.status === 'Pending' || app.status === 'Interview'"
                          @click="updateStatus(app.application_id, 'Rejected')"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-all"
                        >
                          <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
                          Reject
                        </button>

                        <!-- Work in progress statuses -->
                        <span 
                          v-if="app.status === 'Hired'"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 text-purple-600 text-xs font-medium"
                        >
                          <UIcon name="i-lucide-hourglass" class="w-3.5 h-3.5" />
                          Waiting to start
                        </span>
                        <span 
                          v-if="app.status === 'In Progress'"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium"
                        >
                          <UIcon name="i-lucide-play-circle" class="w-3.5 h-3.5 animate-pulse" />
                          Work in progress
                        </span>

                        <!-- Submitted - Approve or Request Revision -->
                        <button 
                          v-if="app.status === 'Submitted'"
                          @click="updateStatus(app.application_id, 'Completed')"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-all shadow-sm"
                        >
                          <UIcon name="i-lucide-check-circle" class="w-3.5 h-3.5" />
                          Approve Work
                        </button>
                        <button 
                          v-if="app.status === 'Submitted'"
                          @click="updateStatus(app.application_id, 'Revision')"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-100 text-orange-700 text-xs font-medium hover:bg-orange-200 transition-all"
                        >
                          <UIcon name="i-lucide-refresh-cw" class="w-3.5 h-3.5" />
                          Request Revision
                        </button>

                        <!-- Revision - Waiting for freelancer -->
                        <span 
                          v-if="app.status === 'Revision'"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-medium"
                        >
                          <UIcon name="i-lucide-refresh-cw" class="w-3.5 h-3.5" />
                          Revision requested
                        </span>

                        <!-- Completed - Show Pay Now button only if no payment or payment is pending -->
                        <NuxtLink 
                          v-if="app.status === 'Completed' && (!app.payment || app.payment.status === 'pending')"
                          :to="`/payments?application_id=${app.application_id}`"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
                        >
                          <UIcon name="i-lucide-credit-card" class="w-3.5 h-3.5" />
                          {{ app.payment?.status === 'pending' ? 'Complete Payment' : 'Pay Now' }}
                        </NuxtLink>
                        
                        <!-- Payment in escrow -->
                        <NuxtLink
                          v-if="app.status === 'Completed' && app.payment?.status === 'paid'"
                          :to="`/payments`"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-all"
                        >
                          <UIcon name="i-lucide-lock" class="w-3.5 h-3.5" />
                          In Escrow
                        </NuxtLink>
                        
                        <!-- Payment released -->
                        <span 
                          v-if="app.status === 'Completed' && app.payment?.status === 'released'"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium"
                        >
                          <UIcon name="i-lucide-check-circle" class="w-3.5 h-3.5" />
                          Paid
                        </span>
                        
                        <span 
                          v-if="app.status === 'Completed'"
                          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium"
                        >
                          <UIcon name="i-lucide-trophy" class="w-3.5 h-3.5" />
                          Completed
                        </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Drawer Footer -->
            <div v-if="selectedJob?.applications?.length" class="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">
                  {{ selectedJob?.applications?.filter((a: any) => a.status === 'Pending').length || 0 }} pending review
                </span>
                <NuxtLink
                  :to="`/jobs/${selectedJob?.job_id}`"
                  class="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  View Job Details
                  <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Drawer animations */
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}

.drawer-panel {
  transition: transform 0.3s ease;
}

/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
