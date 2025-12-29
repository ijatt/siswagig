<template>
  <div class="min-h-screen bg-gradient-to-b">
    <!-- Hero Header -->
    <div class="bg-gradient-to-br from-violet-100 via-white to-blue-50 pattern-dots py-12">
      <UContainer class="max-w-5xl">
        <div class="card-modern p-8">
          <!-- Job Header -->
          <div class="flex flex-col lg:flex-row lg:items-start gap-6">
            <!-- Job Image -->
            <div v-if="jobs?.image_url?.length > 0" class="lg:w-48 flex-shrink-0">
              <img 
                :src="jobs?.image_url" 
                alt="Job image" 
                class="w-full h-48 lg:h-40 object-cover rounded-2xl ring-4 ring-violet-100"
              >
            </div>
            
            <!-- Job Info -->
            <div class="flex-1 space-y-4">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ jobs?.title }}</h1>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-4 py-1.5 rounded-full bg-gradient-primary text-white text-sm font-medium">
                      {{ jobs?.category }}
                    </span>
                    <span class="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                      RM {{ jobs?.budget }}
                    </span>
                  </div>
                </div>
                <div :class="[
                  'px-4 py-2 rounded-xl text-sm font-semibold',
                  jobs?.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                ]">
                  {{ jobs?.status?.toUpperCase() }}
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <UIcon name="i-lucide-calendar" class="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Deadline</p>
                    <p class="font-medium text-gray-700">{{ useDateFormat(jobs?.deadline, "DD MMM YYYY") }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Location</p>
                    <p class="font-medium text-gray-700">{{ jobs?.location || "Remote" }}</p>
                  </div>
                </div>
                <div v-if="jobDistance !== null" class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <UIcon name="i-lucide-navigation" class="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Distance</p>
                    <p class="font-medium text-gray-700">{{ jobDistance.toFixed(1) }} km · {{ distanceCategory }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Main Content -->
    <UContainer class="max-w-5xl py-8">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left Column - Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Description Card -->
          <div class="card-modern p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <UIcon name="i-lucide-file-text" class="w-5 h-5 text-white" />
              </div>
              <h2 class="text-lg font-bold text-gray-900">Description</h2>
            </div>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ jobs?.description }}</p>
          </div>

          <!-- Required Skills Card -->
          <div v-if="requiredSkillsList.length" class="card-modern p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                <UIcon name="i-lucide-zap" class="w-5 h-5 text-white" />
              </div>
              <h2 class="text-lg font-bold text-gray-900">Required Skills</h2>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(skill, idx) in requiredSkillsList"
                :key="idx"
                class="px-4 py-2 rounded-xl bg-violet-50 text-violet-700 text-sm font-medium border border-violet-100 hover:bg-violet-100 transition-colors"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="space-y-6">
          <!-- Client Card -->
          <div class="card-modern p-6">
            <h3 class="text-sm font-medium text-gray-500 mb-4">Posted by</h3>
            <div 
              class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-violet-50 cursor-pointer transition-colors group"
              @click="navigateTo(`/client/${jobs?.user?.user_id}`)"
            >
              <img 
                :src="jobs?.user?.image_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'" 
                alt="Client"
                class="w-14 h-14 rounded-xl object-cover ring-2 ring-white shadow-sm"
              />
              <div class="flex-1">
                <p class="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">{{ jobs?.user?.name }}</p>
                <p class="text-sm text-gray-500 flex items-center gap-1">
                  <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
                  {{ jobs?.user?.location || 'Location not set' }}
                </p>
              </div>
              <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-gray-300 group-hover:text-violet-500 transition-colors" />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="card-modern p-6 space-y-3">
            <template v-if="userStore().user?.user_id != jobs?.user?.user_id">
              <button
                class="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                <UIcon name="i-lucide-message-circle" class="w-5 h-5" />
                Message Client
              </button>

              <UModal title="Apply for this Job" size="lg">
                <button class="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl btn-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                  <UIcon name="i-lucide-send" class="w-5 h-5" />
                  Apply Now
                </button>
                <template #body>
                  <div class="p-6 space-y-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
                      <textarea
                        v-model="payload.cover_letter"
                        placeholder="Briefly describe why you're the right fit for this job..."
                        rows="5"
                        class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all outline-none resize-none"
                      ></textarea>
                    </div>

                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Proposed Budget (RM)</label>
                        <input
                          v-model="payload.price"
                          type="number"
                          placeholder="Enter your proposed price"
                          class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Estimated Completion</label>
                        <input
                          v-model="payload.duration"
                          type="date"
                          class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      @click="submitApplication"
                      class="w-full py-4 rounded-xl btn-gradient text-white font-semibold"
                    >
                      Submit Application
                    </button>
                  </div>
                </template>
              </UModal>
            </template>

            <template v-else>
              <button class="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-100 text-violet-700 font-medium hover:bg-violet-200 transition-colors">
                <UIcon name="i-lucide-pencil" class="w-5 h-5" />
                Edit Job
              </button>
              <button class="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors">
                <UIcon name="i-lucide-trash-2" class="w-5 h-5" />
                Delete Job
              </button>
            </template>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { Job } from '~/types/types'
import { calculateDistance, type Coordinate } from '~~/server/utils/geolocation'

useSeoMeta({
  title: 'Job Details | SiswaGig',
  description: 'View detailed information about the job, including description, requirements, and how to apply. Connect with UiTM student freelancers for your projects.',
  ogTitle: 'Job Details | SiswaGig',
  ogDescription: 'Explore job details and apply for freelance opportunities on SiswaGig.'
})

const route = useRoute();
const toast = useToast();

const { data } = useNuxtData(`job-${route.params.id}`);
const {
  data: job,
  error,
  refresh,
} = await useFetch(`/api/jobs/${route.params.id}`, {
  key: `job-${route.params.id}`,
  default() {
    return data.value as Job
  },
});
const jobs = ref<Job>(job.value as Job)

// Geolocation state
const userLocation = ref<Coordinate | null>(null)
const jobDistance = ref<number | null>(null)

const requiredSkillsList = computed(() => {
  if (!jobs.value?.requiredSkills) return []
  return jobs.value.requiredSkills
    .split('/')
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)
})

const distanceCategory = computed(() => {
  if (jobDistance.value === null || jobDistance.value === undefined) {
    return ''
  }

  if (jobDistance.value <= 5) return 'Very Close'
  if (jobDistance.value <= 15) return 'Close'
  if (jobDistance.value <= 30) return 'Moderate'
  if (jobDistance.value <= 50) return 'Far'
  return 'Very Far'
})

// Calculate distance on component mount
onMounted(async () => {
  try {
    // Fetch user location from API
    const user = await $fetch('/api/user', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${useMyTokenStore().accessToken}`
      }
    }).catch((err) => {
      console.error('Failed to fetch user location:', err)
      return null
    })

    if (user && (user as any).latitude && (user as any).longitude) {
      userLocation.value = {
        latitude: (user as any).latitude,
        longitude: (user as any).longitude
      }

      // Calculate distance if job has coordinates
      if (jobs.value?.latitude && jobs.value?.longitude) {
        const distance = calculateDistance(
          userLocation.value,
          {
            latitude: jobs.value.latitude,
            longitude: jobs.value.longitude
          }
        )
        jobDistance.value = distance
      }
    }
  } catch (err) {
    console.error('Error calculating distance:', err)
  }
})

const payload = reactive({
  cover_letter: "",
  price: jobs.value?.budget || 0,
  duration: "",
  job_id: Number(route.params.id),
  user_id: userStore().user?.user_id
})

const submitApplication = async () => {
  try {
    const application = await $fetch("/api/jobs/apply", {
      method: "POST",
      body: payload
    }).then( async (res) => {
      console.log(res);
      
      if (res) {
        toast.add({
          title: "Application Success",
          description: "Your application has been submitted successfully!",
          color: "success"
        })
      await navigateTo("/applications");
      } else {
        throw new Error("Application submission failed")
      }
    }).catch((error) => {
      toast.add({
        title: "Application Error",
        description: error.statusMessage,
        color: "error",
      })
    })
  } catch (error) {}
};
</script>
