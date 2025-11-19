<template>
<UContainer class="max-w-4xl bg-white mx-auto py-12 rounded-lg shadow-md">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Applications received</h1>
        <p class="text-gray-500 mt-2">Manage all applications for your posted jobs.</p>
      </div>

      <!-- Empty state -->
      <div v-if="!jobs.length" class="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl">
        <UIcon name="i-heroicons-inbox" class="text-gray-300 w-20 h-20 mb-4" />
        <h3 class="text-lg font-medium text-gray-700">No applications yet</h3>
        <p class="text-sm text-gray-500 mt-2">When freelancers apply to your jobs, you'll see them here.</p>
      </div>

      <!-- Jobs with applications -->
      <div v-else class="space-y-6">
        <div v-for="job in jobs" :key="job.job_id" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Job header -->
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <h2 class="text-2xl font-semibold text-gray-900">{{ job.title }}</h2>
                <p class="text-gray-600 mt-2">{{ job.description }}</p>
                <div class="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                  <span class="flex items-center gap-1">
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                    {{ job.location }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4" />
                    RM{{ job.budget }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                    {{ useDateFormat(job.deadline, 'DD MMM YYYY') }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500">Applications</div>
                <div class="text-3xl font-bold text-purple-600">{{ job.applications.length }}</div>
              </div>
            </div>
          </div>

          <!-- Applicants list -->
          <div v-if="job.applications.length" class="divide-y divide-gray-100">
            <div
              v-for="app in job.applications"
              :key="app.application_id"
              class="p-6 hover:bg-gray-50 transition"
            >
              <div class="flex items-start gap-4">
                <!-- Applicant info -->
                <UAvatar :src="app.user.image_url || undefined" size="lg" />
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{{ app.user.name }}</h3>
                  <p class="text-sm text-gray-500">{{ app.user.location }}</p>
                  <p class="text-sm text-gray-700 mt-2">{{ app.user.bio }}</p>

                  <!-- Cover letter snippet -->
                  <div v-if="app.cover_letter" class="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p class="text-sm text-gray-600 line-clamp-2">{{ app.cover_letter }}</p>
                  </div>

                  <!-- Status and dates -->
                  <div class="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span>Applied {{ useDateFormat(app.created_at, 'DD MMM YYYY') }}</span>
                    <UBadge :color="statusColor(app.status)" variant="soft">{{ app.status }}</UBadge>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col gap-2">
                  <UButton
                    color="primary"
                    size="sm"
                    icon="i-heroicons-eye"
                    @click="viewApplication(app.application_id)"
                  >
                    View
                  </UButton>
                  <UButton
                    v-if="app.status === 'Pending'"
                    color="neutral"
                    variant="soft"
                    size="sm"
                    icon="i-heroicons-chat-bubble-left"
                    @click="updateStatus(app.application_id, 'Interview')"
                  >
                    Message
                  </UButton>
                </div>
              </div>
            </div>
          </div>

          <!-- No applications for this job -->
          <div v-else class="p-6 text-center text-gray-500">
            <p>No applications for this job yet.</p>
          </div>
        </div>
      </div>
    </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const jobs = ref<any[]>([])
const loading = ref(false)

const statusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'warning'
    case 'Interview': return 'info'
    case 'Hired': return 'primary'
    case 'Rejected': return 'error'
    default: return 'neutral'
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

const updateStatus = async (appId: number, status: string) => {
  try {
    await $fetch(`/api/applications/${appId}`, {
      method: 'POST',
      body: { status }
    })
    // Reload applications
    loadApplications()
  } catch (err) {
    console.error('Failed to update status:', err)
  }
}

onMounted(loadApplications)
</script>
