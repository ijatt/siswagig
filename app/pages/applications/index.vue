<script setup lang="ts">
import type { Application } from '~/types/types';

definePageMeta({
  middleware: "auth",
});

const route = useRoute()
const id = userStore().user?.user_id
const isLoading = ref(true)

const { data } = useNuxtData(`user-application-${id}`);
const {
  data: application,
  error,
  refresh,
} = await useFetch(`/api/jobs/application/${id}`, {
  key: `user-application-${id}`,
  default() {
    return data.value as Application[]
  },
});
const applications = ref<Application[]>(application.value as Application[])

onMounted(() => {
  isLoading.value = false
})

const statusConfig = (status: string) => {
  switch (status) {
    case 'Pending':
      return { color: 'warning', icon: 'i-lucide-clock', bg: 'bg-white', text: 'text-amber-600' }
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

const viewJob = (id: string) => {
  navigateTo(`/jobs/${id}`)
}

const messageClient = async (userId: number, userName: string) => {
  // Navigate to inbox with query to start conversation
  navigateTo(`/inbox?userId=${userId}&name=${userName}`)
}

const refreshList = async () => {
  isLoading.value = true
  await refresh()
  applications.value = application.value as Application[]
  isLoading.value = false
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-purple-50 via-white to-blue-50 pattern-dots">
      <div class="max-w-5xl mx-auto px-6 py-12">
        <!-- Header with animated icon -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-lg mb-4 animate-float">
            <UIcon name="i-lucide-file-text" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-4xl font-bold text-gradient mb-3">My Applications</h1>
          <p class="text-gray-600 text-lg max-w-xl mx-auto">
            Track and manage all your job applications in one place.
          </p>
        </div>

        <!-- Stats & Actions Card -->
        <div class="card-modern p-6 mb-8">
          <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <!-- Stats -->
            <div class="flex items-center gap-8">
              <div class="text-center">
                <p class="text-3xl font-bold text-gray-900">{{ applications.length }}</p>
                <p class="text-sm text-gray-500">Total Applications</p>
              </div>
              <div class="w-px h-12 bg-gray-200 hidden sm:block"></div>
              <div class="text-center">
                <p class="text-3xl font-bold text-amber-500">{{ applications.filter(a => a.status === 'Pending').length }}</p>
                <p class="text-sm text-gray-500">Pending</p>
              </div>
              <div class="w-px h-12 bg-gray-200 hidden sm:block"></div>
              <div class="text-center">
                <p class="text-3xl font-bold text-green-500">{{ applications.filter(a => a.status === 'Hired').length }}</p>
                <p class="text-sm text-gray-500">Hired</p>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center gap-3">
              <button 
                @click="refreshList"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-medium hover:border-purple-300 hover:text-purple-600 transition-all"
              >
                <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
                Refresh
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <!-- Section Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
          <UIcon name="i-lucide-folder-open" class="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">Application History</h2>
          <p class="text-sm text-gray-500">{{ applications.length }} applications submitted</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="card-modern p-6 space-y-4">
          <div class="flex items-start gap-4">
            <USkeleton class="w-14 h-14 rounded-xl" />
            <div class="flex-1 space-y-3">
              <USkeleton class="h-5 w-3/4 rounded-lg" />
              <USkeleton class="h-4 w-1/2 rounded-lg" />
              <USkeleton class="h-4 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <!-- Applications Grid -->
      <div v-else-if="applications.length" class="space-y-4">
        <div 
          v-for="app in applications" 
          :key="app.application_id" 
          class="card-modern p-6 group cursor-pointer"
          @click="viewJob(app.job.job_id)"
        >
          <div class="flex flex-col lg:flex-row lg:items-start gap-6">
            <!-- Left: Job Info -->
            <div class="flex items-start gap-4 flex-1">
              <!-- Client Avatar -->
              <div class="relative flex-shrink-0">
                <img 
                  :src="app.job.user.image_url || 'https://ui-avatars.com/api/?name=' + app.job.user.name" 
                  :alt="app.job.user.name"
                  class="w-14 h-14 rounded-xl object-cover ring-4 ring-purple-100 group-hover:ring-purple-300 transition-all"
                />
                <div 
                  :class="[statusConfig(app.status).bg, 'absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-white']"
                >
                  <UIcon :name="statusConfig(app.status).icon" :class="['w-3.5 h-3.5', statusConfig(app.status).text]" />
                </div>
              </div>

              <!-- Job Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h3 class="font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                      {{ app.job.title }}
                    </h3>
                    <p class="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <UIcon name="i-lucide-user" class="w-3.5 h-3.5" />
                      {{ app.job.user.name }}
                    </p>
                  </div>
                </div>

                <!-- Cover Letter Preview -->
                <p class="mt-3 text-sm text-gray-600 line-clamp-2">{{ app.cover_letter }}</p>

                <!-- Tags -->
                <div class="mt-4 flex flex-wrap items-center gap-2">
                  <span class="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                    {{ app.job.category }}
                  </span>
                  <span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                    <UIcon name="i-lucide-wallet" class="w-3 h-3" />
                    RM {{ app.job.budget }}
                  </span>
                  <span 
                    :class="[statusConfig(app.status).bg, statusConfig(app.status).text, 'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1']"
                  >
                    <UIcon :name="statusConfig(app.status).icon" class="w-3 h-3" />
                    {{ app.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Actions & Date -->
            <div class="flex lg:flex-col items-center lg:items-end gap-4">
              <!-- Date -->
              <div class="text-right">
                <p class="text-xs text-gray-400 uppercase tracking-wide">Applied</p>
                <p class="text-sm font-medium text-gray-700">{{ useDateFormat(app.created_at, 'DD MMM YYYY') }}</p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2" @click.stop>
                <button 
                  @click="viewJob(app.job.job_id)"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:shadow-lg transition-all"
                >
                  <UIcon name="i-lucide-briefcase" class="w-4 h-4" />
                  View Job
                </button>
                <button 
                  @click="messageClient(app.job.user.user_id, app.job.user.name)"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-purple-100 hover:text-purple-700 transition-all"
                >
                  <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 card-modern">
        <div class="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-file-x" class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">No applications yet</h3>
        <p class="text-gray-500 text-sm max-w-sm mx-auto mb-6">
          Start exploring opportunities and apply to jobs that match your skills.
        </p>
        <NuxtLink 
          to="/explore"
          class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <UIcon name="i-lucide-compass" class="w-5 h-5" />
          Explore Jobs
        </NuxtLink>
      </div>

      <!-- View More Jobs -->
      <div v-if="applications.length" class="flex justify-center pt-4">
        <NuxtLink 
          to="/explore"
          class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <UIcon name="i-lucide-search" class="w-5 h-5" />
          Discover More Jobs
          <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
