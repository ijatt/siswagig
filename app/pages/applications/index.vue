<template>
  <UContainer class="max-w-4xl mx-auto py-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">My Applications</h1>
        <p class="text-gray-500 text-sm mt-1">Manage applications you submitted — review proposals, message freelancers, or update statuses.</p>
      </div>
      <div class="flex items-center gap-3">
        <UButton color="neutral" variant="soft" size="sm" icon="i-heroicons-filter">Filters</UButton>
        <UButton color="primary" icon="i-heroicons-arrow-path" size="sm" @click="refreshList">Refresh</UButton>
      </div>
    </div>

    <div v-if="applications.length" class="grid gap-4">
      <UCard v-for="app in applications" :key="app.application_id" class="p-5 hover:shadow-lg transition-shadow duration-200">
        <div class="md:flex md:items-start md:justify-between gap-4">
          <div class="flex items-start gap-4 md:flex-1">
            <UAvatar :src="app.job.user.image_url" size="lg" />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-800">{{ app.job.title }}</h2>
                  <p class="text-sm text-gray-500">by {{ app.job.user.name }}</p>
                </div>
                
              </div>

              <p class="mt-2 text-sm text-gray-700 line-clamp-3">{{ app.cover_letter }}</p>

              <div class="mt-3 flex flex-wrap items-center gap-2">
                <UBadge color="primary" variant="soft">{{ app.job.category }}</UBadge>
                <UBadge color="secondary" variant="soft">RM {{ app.job.budget }}</UBadge>
                <UBadge :color="statusColor(app.status)" variant="soft">{{ app.status }}</UBadge>
              </div>
            </div>
          </div>

          <div class="mt-4 md:mt-0 md:w-48 md:flex md:flex-col md:items-end md:gap-2">
            <div class="text-right ">
              <div class="text-sm text-gray-500">Applied</div>
              <div class="text-sm font-medium text-gray-900">{{ useDateFormat(app.created_at, 'DD MMM YYYY') }}</div>
            </div>

            <div class="flex gap-2 mt-2 md:flex-col">
              <UButton color="primary" size="sm" icon="tabler-briefcase-filled" @click="viewJob(app.job.job_id)">View Job</UButton>
              <UButton color="neutral" variant="soft" size="sm" icon="i-heroicons-chat-bubble-left" @click="messageClient(app.job.user.name)">Message</UButton>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-24 text-center">
      <UIcon name="i-heroicons-clipboard-document-list" class="text-gray-300 w-20 h-20 mb-4" />
      <h3 class="text-lg font-medium text-gray-700">No applications yet</h3>
      <p class="text-sm text-gray-500 mt-2">When you apply to jobs, they'll appear here.</p>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { Application } from '~/types/types';
const route = useRoute()
const id = userStore().user?.user_id

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

const statusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'warning'
    case 'Interview':
      return 'info'
    case 'Hired':
      return 'primary'
    case 'Rejected':
      return 'error'
    default:
      return 'neutral'
  }
}

const viewJob = (id: string) => {
  navigateTo(`/jobs/${id}`)
}

const messageClient = (name: string) => {
  alert(`Opening chat with ${name}...`)
}

const refreshList = () => {
  alert('Application list refreshed!')
}
</script>
