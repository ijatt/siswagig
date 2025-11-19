<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
    <UContainer class="max-w-5xl mx-auto py-4 px-4">
      <!-- Hero Profile Section -->
      <div class="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-3xl shadow-lg overflow-hidden mb-12">
        <div class="px-8 py-12 md:px-12 md:py-16">
          <div class="flex flex-col md:flex-row items-start md:items-center gap-8">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div class="relative">
                <UAvatar
                  :src="client?.image_url || 'https://i.pravatar.cc/150?img=13'"
                  size="3xl"
                  class="ring-4 ring-white shadow-lg"
                />
              </div>
            </div>

            <!-- Profile Info -->
            <div class="flex-1">
              <h1 class="text-4xl font-bold text-white">{{ client?.name }}</h1>
              <p class="text-blue-100 mt-2 text-lg">{{ client?.email }}</p>
              <p class="text-blue-50 mt-4 max-w-2xl leading-relaxed">
                {{ client?.bio || 'A valued client on SiswaGig.' }}
              </p>

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-3 mt-6">
                <template v-if="id == userStore().user?.user_id">
                  <UButton
                    color="primary"
                    icon="i-heroicons-pencil"
                    @click="navigateTo('/profile/edit')"
                  >
                    Edit Profile
                  </UButton>
                </template>
                <template v-else>
                  <UButton
                    color="primary"
                    icon="i-heroicons-chat-bubble-left"
                    @click="navigateTo('/inbox')"
                  >
                    Message
                  </UButton>
                </template>
              </div>

              <!-- Location Badge -->
              <div class="mt-4">
                <UBadge color="info" variant="solid" class="text-sm">
                  <UIcon name="i-heroicons-map-pin" class="w-4 h-4 mr-1" />
                  {{ client?.location || 'Somewhere on Earth' }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div class="bg-blue-50 rounded-lg p-3">
              <UIcon name="i-heroicons-briefcase" class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p class="text-gray-500 text-sm">Jobs Posted</p>
              <p class="text-2xl font-bold text-gray-900">{{ jobPosted }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div class="bg-green-50 rounded-lg p-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p class="text-gray-500 text-sm">Completed</p>
              <p class="text-2xl font-bold text-gray-900">{{ jobCompleted }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div class="bg-purple-50 rounded-lg p-3">
              <UIcon name="i-heroicons-users" class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p class="text-gray-500 text-sm">Freelancers Hired</p>
              <p class="text-2xl font-bold text-gray-900">{{ jobPosted }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div class="bg-yellow-50 rounded-lg p-3">
              <UIcon name="i-heroicons-star" class="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p class="text-gray-500 text-sm">Rating</p>
              <p class="text-2xl font-bold text-gray-900">4.9★</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Jobs Posted Section -->
      <div>
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Posted Jobs</h2>
          <p class="text-gray-500 mt-2">Browse all jobs from this client</p>
        </div>

        <div v-if="client?.jobs?.length" class="space-y-4">
          <div
            v-for="job in client?.jobs"
            :key="job.job_id"
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group"
            @click="navigateTo(`/jobs/${job.job_id}`)"
          >
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <!-- Job Details -->
              <div class="flex-1">
                <div class="flex items-start gap-3 mb-3">
                  <div class="bg-blue-50 rounded-lg p-2">
                    <UIcon name="i-heroicons-briefcase" class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">{{ job.title }}</h3>
                    <p class="text-sm text-gray-500">{{ job.category }}</p>
                  </div>
                </div>

                <p class="text-gray-600 line-clamp-2">
                  {{ job.description }}
                </p>

                <!-- Job meta -->
                <div class="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                  <span v-if="job.location" class="flex items-center gap-1">
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                    {{ job.location }}
                  </span>
                </div>
              </div>

              <!-- Job Stats -->
              <div class="md:text-right flex flex-col gap-4 md:flex-col md:items-end">
                <div>
                  <p class="text-gray-500 text-sm">Budget</p>
                  <p class="text-2xl font-bold text-blue-600">RM{{ job.budget }}</p>
                </div>
                <UBadge
                  :color="job.status === 'Open' ? 'primary' : job.status === 'Completed' ? 'success' : 'neutral'"
                  variant="soft"
                >
                  {{ job.status }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg">No jobs posted yet</p>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { Client } from '~/types/types';

const route = useRoute()
const id = route.params.id
const { data } = useNuxtData(`client-${route.params.id}`);
const {
  data: user,
  error,
  refresh,
} = await useFetch(`/api/client/${route.params.id}`, {
  key: `client-${route.params.id}`,
  default() {
    return data.value as Client
  },
});

const client = ref<Client>(user.value as Client)

const jobPosted = computed(() => {
  return client.value.jobs.length
})

const jobCompleted = computed(() => {
  return client.value.jobs.filter(job => job.status === 'Completed').length
})

// const client = ref({
//   name: "Aisyah Rahman",
//   username: "aisyah.dev",
//   bio: "I run a small digital agency focused on UI/UX and web apps. Always looking for creative and reliable freelancers!",
//   location: "Shah Alam, Malaysia",
//   stats: {
//     jobsPosted: 12,
//     jobsCompleted: 8,
//     hires: 10,
//     rating: "4.9 ★",
//   },
//   jobs: [
//     {
//       id: 1,
//       title: "Landing Page Design for Startup",
//       category: "UI/UX Design",
//       description:
//         "Looking for a talented designer to create a modern, responsive landing page for a SaaS product.",
//       budget: 600,
//       status: "Open",
//     },
//     {
//       id: 2,
//       title: "Flutter Mobile App for eCommerce",
//       category: "Mobile Development",
//       description:
//         "Need a developer to build a small Flutter app for an online clothing shop with Firebase backend.",
//       budget: 1500,
//       status: "Completed",
//     },
//   ],
// });
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
