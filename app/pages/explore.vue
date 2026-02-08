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

// Location state
const isUpdatingLocation = ref(false);
const locationUpdateSuccess = ref(false);
const locationUpdateError = ref('');

// Job recommendation composable
const {
  recommendations,
  isLoading: recommendationsLoading,
  error: recommendationsError,
  getAdvancedRecommendations,
  formatScore
} = useJobRecommendations();

// Freelancers state (for clients to browse)
interface Freelancer {
  user_id: number;
  name: string;
  bio: string | null;
  location: string | null;
  image_url: string | null;
  skills: string[];
  rating: number;
  reviewCount: number;
  completedJobs: number;
  joinedAt: string;
}

const freelancers = ref<Freelancer[]>([]);
const freelancersLoading = ref(false);
const freelancersError = ref<string | null>(null);

async function loadFreelancers() {
  freelancersLoading.value = true;
  freelancersError.value = null;
  try {
    const tokenStore = useMyTokenStore();
    const data = await $fetch('/api/user/freelancers', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${tokenStore.accessToken}`,
      },
      query: searchQuery.value ? { search: searchQuery.value } : undefined
    });
    freelancers.value = (data as unknown as Freelancer[]) || [];
  } catch (err: any) {
    console.error('Failed to load freelancers:', err);
    freelancersError.value = err?.message || 'Failed to load freelancers';
    freelancers.value = [];
  } finally {
    freelancersLoading.value = false;
  }
}

interface User {
  user_id: number | null;
  name: string | null;
  email: string | null;
  role: string | null;
  imageUrl: string | null;
  profile_completed: boolean | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

const user = ref<User>({
  user_id: null,
  name: null,
  email: null,
  role: null,
  imageUrl: null,
  profile_completed: null,
  location: null,
  latitude: null,
  longitude: null,
});

// Computed property to determine which jobs to display
const displayedJobs = computed(() => {
  let jobsList = useRecommendations.value && recommendations.value.length > 0
    ? recommendations.value
    : jobs.value || [];
  
  // Filter by search query if present
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    jobsList = jobsList.filter(job => 
      job.title?.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query)
    );
  }
  
  return jobsList;
});

// Debounce timer for search
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// Watch search query and trigger search with debounce
watch(searchQuery, (newVal) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  
  searchDebounceTimer = setTimeout(() => {
    if (user.value?.role === 'client') {
      loadFreelancers();
    }
    // For freelancers, the computed property handles filtering
  }, 300);
});

async function loadJobs() {
  jobsLoading.value = true;
  jobsError.value = null;
  try {
    const data = await $fetch('/api/jobs', {
      method: 'GET',
    });
    jobs.value = (data as unknown as Job[]) || [];
  } catch (err: any) {
    console.error('Failed to load jobs:', err);
    jobsError.value = err?.message || 'Failed to load jobs';
    jobs.value = [];
  } finally {
    jobsLoading.value = false;
  }
}

// Update location to current GPS position
async function updateToCurrentLocation() {
  if (!navigator.geolocation) {
    locationUpdateError.value = 'Geolocation is not supported by your browser'
    return
  }

  isUpdatingLocation.value = true
  locationUpdateError.value = ''
  locationUpdateSuccess.value = false

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      
      // Get location name via reverse geocoding
      let locationName = user.value.location || ''
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        )
        const data = await response.json()
        if (data.address) {
          const { city, town, village, state, suburb } = data.address
          locationName = [suburb, city || town || village, state].filter(Boolean).join(', ')
        }
      } catch (err) {
        console.error('Reverse geocoding failed:', err)
      }

      // Save to database
      try {
        const tokenStore = useMyTokenStore()
        await $fetch(`/api/user/${user.value.user_id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${tokenStore.accessToken}`
          },
          body: {
            location: locationName,
            latitude,
            longitude
          }
        })

        // Update local user state
        user.value.location = locationName
        user.value.latitude = latitude
        user.value.longitude = longitude
        userStore().user = user.value

        locationUpdateSuccess.value = true
        setTimeout(() => { locationUpdateSuccess.value = false }, 3000)

        // Refresh recommendations with new location
        await getAdvancedRecommendations({ 
          minSimilarity: minSimilarity.value,
          limit: 20 
        })
      } catch (err) {
        console.error('Failed to save location:', err)
        locationUpdateError.value = 'Failed to save location'
      }

      isUpdatingLocation.value = false
    },
    (error) => {
      const errorMessages: Record<number, string> = {
        1: 'Location permission denied. Please enable it in browser settings.',
        2: 'Location unavailable.',
        3: 'Location request timed out.'
      }
      locationUpdateError.value = errorMessages[error.code] || 'Failed to get location'
      isUpdatingLocation.value = false
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

onMounted(async () => {
  try {
    const tokenStore = useMyTokenStore();
    if (!tokenStore.accessToken) {
      navigateTo('/auth');
      return;
    }

    user.value = await $fetch<User>("/api/user", {
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

    // Load different content based on user role
    if (user.value?.role === 'client') {
      // Clients browse freelancers
      await loadFreelancers();
    } else {
      // Freelancers browse jobs
      await Promise.all([
        loadJobs(),
        getAdvancedRecommendations({ 
          minSimilarity: minSimilarity.value,
          limit: 20 
        })
      ]);
    }
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
            <UIcon :name="user.role === 'client' ? 'i-lucide-users' : 'i-lucide-compass'" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-4xl font-bold text-gradient mb-3">
            {{ user.role === 'client' ? 'Find Talented Freelancers' : 'Explore Opportunities' }}
          </h1>
          <p class="text-gray-600 text-lg max-w-xl mx-auto">
            {{ user.role === 'client' 
              ? 'Discover skilled UiTM students ready to bring your projects to life.'
              : 'Find freelance jobs matched to your skills or discover talented UiTM students.' }}
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
                  :placeholder="user.role === 'client' ? 'Search freelancers by name or skills...' : 'Search jobs, skills, or freelancers...'"
                  class="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-700"
                  @keyup.enter="user.role === 'client' ? loadFreelancers() : null"
                />
              </div>
            </div>
            
            <!-- AI Toggle (only for freelancers) -->
            <div v-if="user.role === 'freelancer'" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
              <USwitch v-model="useRecommendations" color="primary" />
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-purple-600" />
                <span class="text-sm font-semibold text-purple-700">AI Recommendations</span>
              </div>
            </div>

            <!-- Search Button (for clients) -->
            <button 
              v-if="user.role === 'client'"
              @click="loadFreelancers"
              class="btn-gradient px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
            >
              <UIcon name="i-lucide-search" class="w-4 h-4" />
              Search
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <!-- Location Banner -->
      <div v-if="user.role === 'freelancer'" class="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Your Location</p>
              <p class="font-semibold text-gray-900">{{ user.location || 'Not set' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Success Message -->
            <Transition name="fade">
              <span v-if="locationUpdateSuccess" class="text-sm text-green-600 flex items-center gap-1">
                <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                Updated!
              </span>
            </Transition>
            <!-- Error Message -->
            <span v-if="locationUpdateError" class="text-sm text-red-600">{{ locationUpdateError }}</span>
            <!-- Update Button -->
            <button
              @click="updateToCurrentLocation"
              :disabled="isUpdatingLocation"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all disabled:opacity-50"
            >
              <UIcon v-if="isUpdatingLocation" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
              <UIcon v-else name="i-lucide-refresh-cw" class="w-4 h-4" />
              {{ isUpdatingLocation ? 'Updating...' : 'Use Current Location' }}
            </button>
          </div>
        </div>
      </div>

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
        v-if="recommendationsError || jobsError || freelancersError"
        class="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm flex items-center gap-3"
      >
        <UIcon name="i-lucide-alert-circle" class="w-5 h-5 flex-shrink-0" />
        {{ recommendationsError || jobsError || freelancersError }}
      </div>

      <!-- ============ CLIENT VIEW: Browse Freelancers ============ -->
      <template v-if="user.role === 'client'">
        <section>
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                <UIcon name="i-lucide-users" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Available Freelancers</h2>
                <p class="text-sm text-gray-500">{{ freelancers.length }} talented UiTM students</p>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="freelancersLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="card-modern p-6 space-y-4">
              <div class="flex items-center gap-4">
                <USkeleton class="w-16 h-16 rounded-2xl" />
                <div class="flex-1 space-y-2">
                  <USkeleton class="h-5 w-3/4 rounded-lg" />
                  <USkeleton class="h-4 w-1/2 rounded-lg" />
                </div>
              </div>
              <USkeleton class="h-4 w-full rounded-lg" />
              <div class="flex gap-2">
                <USkeleton class="h-6 w-20 rounded-full" />
                <USkeleton class="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>

          <!-- Freelancers Grid -->
          <div v-else-if="freelancers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="freelancer in freelancers"
              :key="freelancer.user_id"
              class="card-modern p-6 cursor-pointer group hover:shadow-lg transition-all"
              @click="navigateTo(`/freelancer/${freelancer.user_id}`)"
            >
              <!-- Header with Avatar -->
              <div class="flex items-center gap-4 mb-4">
                <img 
                  :src="freelancer.image_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(freelancer.name) + '&background=8b5cf6&color=fff'" 
                  :alt="freelancer.name"
                  class="w-16 h-16 rounded-2xl object-cover ring-4 ring-purple-100 group-hover:ring-purple-300 transition-all"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                    {{ freelancer.name }}
                  </h3>
                  <div class="flex items-center gap-1 text-sm text-gray-500">
                    <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 flex-shrink-0" />
                    <span class="truncate">{{ freelancer.location || 'Malaysia' }}</span>
                  </div>
                </div>
              </div>

              <!-- Bio -->
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                {{ freelancer.bio || 'No bio provided' }}
              </p>

              <!-- Skills -->
              <div class="flex flex-wrap gap-1.5 mb-4">
                <span 
                  v-for="skill in freelancer.skills.slice(0, 3)" 
                  :key="skill"
                  class="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700"
                >
                  {{ skill }}
                </span>
                <span 
                  v-if="freelancer.skills.length > 3"
                  class="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
                >
                  +{{ freelancer.skills.length - 3 }}
                </span>
              </div>

              <!-- Stats Footer -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div class="flex items-center gap-4 text-sm">
                  <!-- Rating -->
                  <div class="flex items-center gap-1">
                    <UIcon name="i-lucide-star" class="w-4 h-4 text-yellow-500" />
                    <span class="font-semibold text-gray-900">{{ freelancer.rating.toFixed(1) }}</span>
                    <span class="text-gray-400">({{ freelancer.reviewCount }})</span>
                  </div>
                  <!-- Completed Jobs -->
                  <div class="flex items-center gap-1 text-gray-500">
                    <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                    <span>{{ freelancer.completedJobs }} jobs</span>
                  </div>
                </div>
                <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-16 card-modern">
            <div class="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-lucide-users" class="w-10 h-10 text-gray-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">No freelancers found</h3>
            <p class="text-gray-500 text-sm max-w-sm mx-auto">
              Try adjusting your search or check back later for new talent
            </p>
          </div>
        </section>

        <!-- Post Job CTA -->
        <div class="flex justify-center">
          <UButton
            to="/client/jobs/post"
            class="btn-gradient px-6 py-3 rounded-xl font-semibold"
            trailing-icon="i-lucide-plus"
          >
            Post a new job
          </UButton>
        </div>
      </template>

      <!-- ============ FREELANCER VIEW: Browse Jobs ============ -->
      <template v-else>
        <!-- AI Info Banner -->
        

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
      </template>
    </div>
  </div>
</template>
