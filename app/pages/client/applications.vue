<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: "auth",
});

const jobs = ref<any[]>([])
const loading = ref(true)

const statusConfig = (status: string) => {
  switch (status) {
    case 'Pending':
      return { color: 'warning', icon: 'i-lucide-clock', bg: 'bg-amber-50', text: 'text-amber-600' }
    case 'Interview':
      return { color: 'info', icon: 'i-lucide-calendar', bg: 'bg-blue-50', text: 'text-blue-600' }
    case 'Hired':
      return { color: 'primary', icon: 'i-lucide-check-circle', bg: 'bg-green-50', text: 'text-green-600' }
    case 'Rejected':
      return { color: 'error', icon: 'i-lucide-x-circle', bg: 'bg-red-50', text: 'text-red-600' }
    default:
      return { color: 'neutral', icon: 'i-lucide-circle', bg: 'bg-gray-50', text: 'text-gray-600' }
  }
}

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
    loadApplications()
  } catch (err) {
    console.error('Failed to update status:', err)
  }
}

const totalApplications = computed(() => {
  return jobs.value.reduce((sum, job) => sum + job.applications.length, 0)
})

const pendingCount = computed(() => {
  return jobs.value.reduce((sum, job) => 
    sum + job.applications.filter((a: any) => a.status === 'Pending').length, 0)
})

const hiredCount = computed(() => {
  return jobs.value.reduce((sum, job) => 
    sum + job.applications.filter((a: any) => a.status === 'Hired').length, 0)
})

onMounted(loadApplications)
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-purple-50 via-white to-blue-50 pattern-dots">
      <div class="max-w-5xl mx-auto px-6 py-12">
        <!-- Header with animated icon -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-lg mb-4 animate-float">
            <UIcon name="i-lucide-users" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-4xl font-bold text-gradient mb-3">Applications Received</h1>
          <p class="text-gray-600 text-lg max-w-xl mx-auto">
            Review and manage all applications for your posted jobs.
          </p>
        </div>

        <!-- Stats Card -->
        <div class="card-modern p-6 mb-8">
          <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <!-- Stats -->
            <div class="flex items-center gap-8">
              <div class="text-center">
                <p class="text-3xl font-bold text-gray-900">{{ jobs.length }}</p>
                <p class="text-sm text-gray-500">Active Jobs</p>
              </div>
              <div class="w-px h-12 bg-gray-200 hidden sm:block"></div>
              <div class="text-center">
                <p class="text-3xl font-bold text-purple-600">{{ totalApplications }}</p>
                <p class="text-sm text-gray-500">Total Applications</p>
              </div>
              <div class="w-px h-12 bg-gray-200 hidden sm:block"></div>
              <div class="text-center">
                <p class="text-3xl font-bold text-amber-500">{{ pendingCount }}</p>
                <p class="text-sm text-gray-500">Pending</p>
              </div>
              <div class="w-px h-12 bg-gray-200 hidden sm:block"></div>
              <div class="text-center">
                <p class="text-3xl font-bold text-green-500">{{ hiredCount }}</p>
                <p class="text-sm text-gray-500">Hired</p>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center gap-3">
              <button 
                @click="loadApplications"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-medium hover:border-purple-300 hover:text-purple-600 transition-all"
              >
                <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" :class="{ 'animate-spin': loading }" />
                Refresh
              </button>
              <NuxtLink 
                to="/jobs/create"
                class="btn-gradient px-5 py-2.5 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <UIcon name="i-lucide-plus" class="w-4 h-4" />
                Post Job
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <!-- Section Header -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
          <UIcon name="i-lucide-briefcase" class="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">Your Job Listings</h2>
          <p class="text-sm text-gray-500">{{ jobs.length }} jobs with applications</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <div v-for="i in 2" :key="i" class="card-modern p-6 space-y-4">
          <USkeleton class="h-8 w-1/2 rounded-lg" />
          <USkeleton class="h-4 w-full rounded-lg" />
          <div class="flex gap-4">
            <USkeleton class="h-16 w-16 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-5 w-1/3 rounded-lg" />
              <USkeleton class="h-4 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!jobs.length" class="text-center py-16 card-modern">
        <div class="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-inbox" class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">No applications yet</h3>
        <p class="text-gray-500 text-sm max-w-sm mx-auto mb-6">
          When freelancers apply to your jobs, you'll see them here.
        </p>
        <NuxtLink 
          to="/jobs/create"
          class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <UIcon name="i-lucide-plus" class="w-5 h-5" />
          Post Your First Job
        </NuxtLink>
      </div>

      <!-- Jobs with Applications -->
      <div v-else class="space-y-6">
        <div v-for="job in jobs" :key="job.job_id" class="card-modern overflow-hidden">
          <!-- Job Header -->
          <div class="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <h2 class="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {{ job.title }}
                </h2>
                <p class="text-gray-600 mt-2 line-clamp-2">{{ job.description }}</p>
                <div class="flex flex-wrap items-center gap-4 mt-4">
                  <span class="flex items-center gap-1.5 text-sm text-gray-600">
                    <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-gray-400" />
                    {{ job.location }}
                  </span>
                  <span class="flex items-center gap-1.5 text-sm text-purple-600 font-medium">
                    <UIcon name="i-lucide-wallet" class="w-4 h-4" />
                    RM {{ job.budget }}
                  </span>
                  <span class="flex items-center gap-1.5 text-sm text-gray-600">
                    <UIcon name="i-lucide-calendar" class="w-4 h-4 text-gray-400" />
                    {{ useDateFormat(job.deadline, 'DD MMM YYYY') }}
                  </span>
                </div>
              </div>
              <div class="text-center px-4 py-3 rounded-xl bg-white shadow-sm">
                <p class="text-3xl font-bold text-purple-600">{{ job.applications.length }}</p>
                <p class="text-xs text-gray-500">Applicants</p>
              </div>
            </div>
          </div>

          <!-- Applicants List -->
          <div v-if="job.applications.length" class="divide-y divide-gray-100">
            <div
              v-for="app in job.applications"
              :key="app.application_id"
              class="p-6 hover:bg-gray-50/50 transition-colors"
            >
              <div class="flex items-start gap-4">
                <!-- Applicant Avatar -->
                <div class="relative flex-shrink-0">
                  <img 
                    :src="app.user.image_url || 'https://ui-avatars.com/api/?name=' + app.user.name" 
                    :alt="app.user.name"
                    class="w-14 h-14 rounded-xl object-cover ring-4 ring-purple-100"
                  />
                  <div 
                    :class="[statusConfig(app.status).bg, 'absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-white']"
                  >
                    <UIcon :name="statusConfig(app.status).icon" :class="['w-3.5 h-3.5', statusConfig(app.status).text]" />
                  </div>
                </div>

                <!-- Applicant Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <h3 class="font-bold text-gray-900">{{ app.user.name }}</h3>
                      <p class="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5" />
                        {{ app.user.location || 'Location not set' }}
                      </p>
                    </div>
                  </div>

                  <!-- Bio -->
                  <p v-if="app.user.bio" class="text-sm text-gray-600 mt-2 line-clamp-2">{{ app.user.bio }}</p>

                  <!-- Cover Letter -->
                  <div v-if="app.cover_letter" class="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p class="text-sm text-gray-600 line-clamp-2">{{ app.cover_letter }}</p>
                  </div>

                  <!-- Meta Info -->
                  <div class="flex flex-wrap items-center gap-3 mt-4">
                    <span class="text-xs text-gray-400 flex items-center gap-1">
                      <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
                      Applied {{ useDateFormat(app.created_at, 'DD MMM YYYY') }}
                    </span>
                    <span 
                      :class="[statusConfig(app.status).bg, statusConfig(app.status).text, 'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1']"
                    >
                      <UIcon :name="statusConfig(app.status).icon" class="w-3 h-3" />
                      {{ app.status }}
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col gap-2" @click.stop>
                  <button 
                    @click="viewApplication(app.application_id)"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:shadow-lg transition-all"
                  >
                    <UIcon name="i-lucide-eye" class="w-4 h-4" />
                    View
                  </button>
                  <button 
                    @click="messageApplicant(app.user.user_id, app.user.name)"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-purple-100 hover:text-purple-700 transition-all"
                  >
                    <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
                    Message
                  </button>
                  <button 
                    v-if="app.status === 'Pending'"
                    @click="updateStatus(app.application_id, 'Hired')"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition-all"
                  >
                    <UIcon name="i-lucide-check" class="w-4 h-4" />
                    Hire
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Applications for Job -->
          <div v-else class="p-8 text-center">
            <UIcon name="i-lucide-user-x" class="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p class="text-gray-500 text-sm">No applications for this job yet.</p>
          </div>
        </div>
      </div>

      <!-- Post More Jobs CTA -->
      <div v-if="jobs.length" class="flex justify-center pt-4">
        <NuxtLink 
          to="/jobs/create"
          class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <UIcon name="i-lucide-plus" class="w-5 h-5" />
          Post Another Job
          <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
