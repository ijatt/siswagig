<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

useSeoMeta({
  title: 'Explore Opportunities | SiswaGig',
  description: 'Find freelance jobs matched to your skills or discover talented UiTM students ready to work on your projects.',
  ogTitle: 'Explore Opportunities | SiswaGig',
  ogDescription: 'Discover freelance jobs and talented UiTM student freelancers on SiswaGig.'
});

import type { Job } from "~/types/types";

const route = useRoute();

const jobs = ref<Job[]>([]);
const jobsLoading = ref(true);
const jobsError = ref<string | null>(null);
const searchQuery = ref("");
const useRecommendations = ref(true);
const minSimilarity = ref(0.35);

// Job recommendation composable
const {
  recommendations,
  isLoading: recommendationsLoading,
  error: recommendationsError,
  getAdvancedRecommendations,
  formatScore
} = useJobRecommendations();

const freelancers = [
  {
    name: "Aina Rahman",
    skill: "Graphic Designer",
    bio: "Experienced in poster and banner design. Canva, Figma, Photoshop.",
    location: "UiTM Puncak Alam",
    image:
      "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww",
  },
  {
    name: "Hakim Aiman",
    skill: "Web Developer",
    bio: "Frontend dev familiar with Nuxt, Tailwind, and Firebase.",
    location: "UiTM Shah Alam",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D-focus-photography-of-woman-outdoor-during-day-rDEOVtE7vOs",
  },
];

interface User {
  user_id: number | null;
  name: string | null;
  email: string | null;
  role: string | null;
  imageUrl: string | null;
  profile_completed: boolean | null;
}

const user = ref<User>({
  user_id: null,
  name: null,
  email: null,
  role: null,
  imageUrl: null,
  profile_completed: null,
});

// Computed property to determine which jobs to display
const displayedJobs = computed(() => {
  if (useRecommendations.value && recommendations.value.length > 0) {
    return recommendations.value;
  }
  return jobs.value || [];
});

async function loadJobs() {
  jobsLoading.value = true;
  jobsError.value = null;
  try {
    const data = await $fetch('/api/jobs', {
      method: 'GET',
    });
    jobs.value = (data as Job[]) || [];
  } catch (err: any) {
    console.error('Failed to load jobs:', err);
    jobsError.value = err?.message || 'Failed to load jobs';
    jobs.value = [];
  } finally {
    jobsLoading.value = false;
  }
}

onMounted(async () => {
  try {
    const tokenStore = useMyTokenStore();
    if (!tokenStore.accessToken) {
      navigateTo('/auth');
      return;
    }

    user.value = await $fetch("/api/user", {
      method: "GET",
      headers: {
        authorization: `Bearer ${tokenStore.accessToken}`,
      },
    });

    if (user.value) {
      userStore().user = user.value;
    }
    
    if (!user.value?.profile_completed && user.value?.role === "freelancer") {
      navigateTo("/complete-profile");
      return;
    }

    // Load jobs and AI recommendations in parallel
    await Promise.all([
      loadJobs(),
      getAdvancedRecommendations({ 
        minSimilarity: minSimilarity.value,
        limit: 20 
      })
    ]);
  } catch (err) {
    console.error('Failed to initialize explore page:', err);
  }
});
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-purple-50 via-white to-blue-50 pattern-dots">
      <div class="max-w-5xl mx-auto px-6 py-12">
        <!-- Header with animated icon -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-lg mb-4 animate-float">
            <UIcon name="i-lucide-compass" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-4xl font-bold text-gradient mb-3">Explore Opportunities</h1>
          <p class="text-gray-600 text-lg max-w-xl mx-auto">
            Find freelance jobs matched to your skills or discover talented UiTM students.
          </p>
        </div>

        <!-- Search & Toggle Card -->
        <div class="card-modern p-6">
          <div class="flex flex-col lg:flex-row gap-4 items-center">
            <!-- Search Input -->
            <div class="flex-1 w-full">
              <div class="relative">
                <UIcon name="i-lucide-search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="searchQuery"
                  placeholder="Search jobs, skills, or freelancers..."
                  class="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-700"
                />
              </div>
            </div>
            
            <!-- AI Toggle -->
            <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
              <USwitch v-model="useRecommendations" color="primary" />
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-purple-600" />
                <span class="text-sm font-semibold text-purple-700">AI Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <!-- AI Info Banner -->
      <div
        v-if="useRecommendations && recommendations.length > 0"
        class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white shadow-xl"
      >
        <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="relative flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-brain" class="w-6 h-6" />
          </div>
          <div>
            <p class="font-bold text-lg mb-1">AI-Powered Recommendations</p>
            <p class="text-white/90 text-sm">
              Showing {{ recommendations.length }} jobs matched using TF-IDF, Cosine Similarity, and geolocation.
              Higher percentages mean better matches for your skills and location.
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="recommendationsError || jobsError"
        class="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm flex items-center gap-3"
      >
        <UIcon name="i-lucide-alert-circle" class="w-5 h-5 flex-shrink-0" />
        {{ recommendationsError || jobsError }}
      </div>

      <!-- Jobs Section -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <UIcon name="i-lucide-briefcase" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">
                {{ useRecommendations ? "Recommended Jobs" : "Discover Jobs" }}
              </h2>
              <p class="text-sm text-gray-500">{{ displayedJobs.length }} opportunities available</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="recommendationsLoading || jobsLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="card-modern p-6 space-y-4">
            <USkeleton class="h-6 w-3/4 rounded-lg" />
            <USkeleton class="h-4 w-full rounded-lg" />
            <USkeleton class="h-4 w-2/3 rounded-lg" />
            <div class="flex gap-2">
              <USkeleton class="h-6 w-20 rounded-full" />
              <USkeleton class="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>

        <!-- Jobs Grid -->
        <div v-else-if="displayedJobs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(job, i) in displayedJobs"
            :key="i"
            class="card-modern p-6 cursor-pointer group"
            @click="navigateTo(`jobs/${job.job_id}`)"
          >
            <!-- Match Score Badge -->
            <div v-if="useRecommendations && 'matchScore' in job" class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold shadow-sm">
                  {{ formatScore((job as any).matchScore) }} match
                </div>
              </div>
              <div 
                v-if="(job as any).distance !== undefined && (job as any).distance !== null"
                class="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
              >
                <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
                {{ ((job as any).distance as number).toFixed(1) }} km
              </div>
            </div>

            <!-- Job Title -->
            <h3 class="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
              {{ job.title }}
            </h3>

            <!-- Description -->
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ job.description }}</p>

            <!-- Match Reasons -->
            <div v-if="useRecommendations && 'matchReasons' in job" class="space-y-1.5 mb-4">
              <p
                v-for="(reason, idx) in (job as any).matchReasons?.slice(0, 2)"
                :key="idx"
                class="text-xs text-gray-500 flex items-center gap-1.5"
              >
                <UIcon name="i-lucide-check-circle-2" class="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                {{ reason }}
              </p>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <span class="text-sm font-semibold text-purple-600">RM {{ job.budget }}</span>
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16 card-modern">
          <div class="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-lucide-briefcase" class="w-10 h-10 text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">No jobs found</h3>
          <p class="text-gray-500 text-sm max-w-sm mx-auto">
            {{ useRecommendations
              ? "Try updating your skills or profile to get better recommendations"
              : "Check back later for new opportunities" }}
          </p>
        </div>
      </section>

      <!-- View More Button -->
      <div class="flex justify-center">
        <UButton
          to="/jobs"
          class="btn-gradient px-6 py-3 rounded-xl font-semibold"
          trailing-icon="i-lucide-arrow-right"
        >
          Discover more jobs
        </UButton>
      </div>

      <!-- Freelancers Section -->
      <section>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
            <UIcon name="i-lucide-users" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Discover Freelancers</h2>
            <p class="text-sm text-gray-500">Talented UiTM students ready to help</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="(freelancer, i) in freelancers"
            :key="i"
            class="card-modern p-6 flex items-center gap-4 group cursor-pointer"
          >
            <img 
              :src="freelancer.image" 
              :alt="freelancer.name"
              class="w-20 h-20 rounded-2xl object-cover ring-4 ring-purple-100 group-hover:ring-purple-300 transition-all"
            />
            <div class="flex-1">
              <h3 class="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                {{ freelancer.name }}
              </h3>
              <p class="text-sm text-purple-600 font-medium mb-1">{{ freelancer.skill }}</p>
              <p class="text-sm text-gray-500 line-clamp-2">{{ freelancer.bio }}</p>
            </div>
            <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
