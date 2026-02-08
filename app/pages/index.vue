<template>
  <div class="overflow-hidden">
    <!-- Hero Section -->
    <section class="relative min-h-[90vh] flex items-center bg-gradient-to-br from-violet-50 via-white to-blue-50 pattern-dots">
      <!-- Decorative Elements -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
      <div class="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style="animation-delay: 1s;"></div>
      
      <UContainer class="relative z-10">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left Content -->
          <div class="space-y-8">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium">
              <span class="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
              Built for UiTM Students
            </div>
            
            <h1 class="text-5xl lg:text-6xl font-bold leading-tight">
              <span class="text-gray-900">Connect.</span><br>
              <span class="text-gradient">Collaborate.</span><br>
              <span class="text-gray-900">Succeed.</span>
            </h1>
            
            <p class="text-xl text-gray-600 max-w-lg leading-relaxed">
              A freelance platform tailored by UiTM for UiTM. Turn your skills into income while studying.
            </p>
            
            <div class="flex flex-wrap gap-4">
              <NuxtLink to="/auth" class="btn-gradient px-8 py-4 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                <UIcon name="i-lucide-rocket" class="w-5 h-5" />
                Get Started Free
              </NuxtLink>
              <NuxtLink to="/explore" class="px-8 py-4 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-200 inline-flex items-center gap-2 hover:border-violet-300 hover:text-violet-600 transition-all">
                <UIcon name="i-lucide-compass" class="w-5 h-5" />
                Explore Jobs
              </NuxtLink>
            </div>
            
            <!-- Stats -->
            <div class="flex items-center gap-8 pt-4">
              <div>
                <p class="text-3xl font-bold text-gray-900">{{ formattedStats.activeJobs }}</p>
                <p class="text-sm text-gray-500">Active Jobs</p>
              </div>
              <div class="w-px h-12 bg-gray-200"></div>
              <div>
                <p class="text-3xl font-bold text-gray-900">{{ formattedStats.totalStudents }}</p>
                <p class="text-sm text-gray-500">Students</p>
              </div>
              <div class="w-px h-12 bg-gray-200"></div>
              <div>
                <p class="text-3xl font-bold text-gray-900">{{ formattedStats.satisfactionRate }}</p>
                <p class="text-sm text-gray-500">Satisfaction</p>
              </div>
            </div>
          </div>
          
          <!-- Right Image -->
          <div class="relative hidden lg:block">
            <div class="absolute inset-0 bg-gradient-primary rounded-3xl transform rotate-3 opacity-20"></div>
            <img
              src="https://ipsis.uitm.edu.my/images/landingicon/graduationexploreus.jpg"
              class="relative rounded-3xl shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500"
              alt="UiTM Students"
            />
            <!-- Floating Card -->
            <div class="absolute -bottom-6 -left-6 card-modern p-4 flex items-center gap-3 animate-float">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <UIcon name="i-lucide-check" class="w-6 h-6 text-white" />
              </div>
              <div>
                <p class="font-bold text-gray-900">AI-Matched</p>
                <p class="text-xs text-gray-500">Smart job recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-white">
      <UContainer>
        <div class="text-center max-w-2xl mx-auto mb-16">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <UIcon name="i-lucide-sparkles" class="w-4 h-4" />
            Features
          </div>
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Empowering UiTM Students</h2>
          <p class="text-lg text-gray-600">AI-driven job matching, location-based search, and secure collaboration — designed exclusively for you.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="(feature, i) in features" :key="i" class="card-modern p-8 text-center group">
            <div class="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <UIcon :name="feature.icon" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">{{ feature.title }}</h3>
            <p class="text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Jobs Preview Section -->
    <section class="py-24 bg-gradient-to-b from-gray-50 to-white">
      <UContainer>
        <div class="flex items-center justify-between mb-12">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Latest Opportunities</h2>
            <p class="text-gray-600">Fresh jobs posted by UiTM students and staff</p>
          </div>
          <NuxtLink to="/explore" class="text-violet-600 font-semibold hover:text-violet-700 flex items-center gap-2">
            View all
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
        
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="(job, i) in jobs" :key="i" @click="navigateTo(`/jobs/${job.id}`)" class="card-modern overflow-hidden group">
            <img :src="job.image" :alt="job.title" class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div class="p-6">
              <p class="text-xs text-violet-600 font-medium mb-2">{{ job.date }}</p>
              <h3 class="font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">{{ job.title }}</h3>
              <p class="text-sm text-gray-600 line-clamp-2">{{ job.description }}</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Freelancers Section -->
    <section class="py-24 bg-white">
      <UContainer>
        <div class="text-center max-w-2xl mx-auto mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Top Freelancers</h2>
          <p class="text-gray-600">Talented UiTM students ready to help with your projects</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div v-for="(freelancer, i) in freelancers" :key="i" class="card-modern p-6 flex items-center gap-6 group">
            <img 
              :src="freelancer.image" 
              :alt="freelancer.name"
              class="w-24 h-24 rounded-2xl object-cover ring-4 ring-violet-100 group-hover:ring-violet-300 transition-all" 
            />
            <div>
              <h3 class="font-bold text-gray-900 text-lg group-hover:text-violet-600 transition-colors">{{ freelancer.name }}</h3>
              <p class="text-violet-600 font-medium text-sm mb-2">{{ freelancer.skill }}</p>
              <p class="text-gray-600 text-sm">{{ freelancer.bio }}</p>
              <p class="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
                {{ freelancer.location }}
              </p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-gradient-primary relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full opacity-10">
        <div class="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full"></div>
        <div class="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full"></div>
        <div class="absolute top-1/2 left-1/2 w-80 h-80 border border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <UContainer class="relative z-10 text-center">
        <h2 class="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Start Earning?</h2>
        <p class="text-xl text-white/80 max-w-2xl mx-auto mb-10">
          Join SiswaGig today and connect with opportunities tailored for UiTM students.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <NuxtLink to="/auth" class="px-8 py-4 bg-white text-violet-700 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-xl">
            <UIcon name="i-lucide-user-plus" class="w-5 h-5" />
            Create Free Account
          </NuxtLink>
          <NuxtLink to="/explore" class="px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-white/20 transition-colors">
            <UIcon name="i-lucide-search" class="w-5 h-5" />
            Browse Jobs
          </NuxtLink>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: "guest"
})
useSeoMeta({
  title: 'SiswaGig - Freelance Platform for UiTM Students',
  description: 'Connect, collaborate, and succeed with SiswaGig - the freelance marketplace built by UiTM for UiTM students. Turn your skills into income while studying.',
  ogTitle: 'SiswaGig - Freelance Platform for UiTM Students',
  ogDescription: 'The freelance marketplace built by UiTM for UiTM students. Find gigs, hire talent, and grow your career.',
  ogType: 'website'
})

// Fetch dynamic data
const { data: stats } = await useFetch('/api/stats/public')
const { data: jobsData } = await useFetch<any[]>('/api/jobs')
const { data: freelancersData } = await useFetch<any[]>('/api/user/freelancers', {
  query: { limit: 4 }
})

// Format stats for display
const formattedStats = computed(() => ({
  activeJobs: formatNumber(stats.value?.activeJobs || 0),
  totalStudents: formatNumber(stats.value?.totalStudents || 0),
  satisfactionRate: `${stats.value?.satisfactionRate || 95}%`
}))

// Get latest 3 jobs
const jobs = computed(() => {
  if (!jobsData.value || !Array.isArray(jobsData.value)) return []
  return jobsData.value.slice(0, 3).map((job) => ({
    id: job.job_id,
    title: job.title,
    description: job.description,
    date: formatDate(job.created_at),
    image: job.image_url || 'https://picsum.photos/400/300'
  }))
})

// Get top freelancers
const freelancers = computed(() => {
  if (!freelancersData.value || !Array.isArray(freelancersData.value)) return []
  return freelancersData.value.slice(0, 4).map((f) => ({
    name: f.name,
    skill: f.userSkills?.[0]?.skill?.name || 'Freelancer',
    bio: f.bio || 'Ready to help with your projects.',
    location: f.location || 'UiTM',
    image: f.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=8b5cf6&color=fff`
  }))
})

// Helper functions
function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return num.toString() + '+'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const features = ref([
  {
    title: 'Smart Job Matching',
    description: 'AI recommends freelance jobs that fit your skills, preferences, and location for better matching.',
    icon: 'i-lucide-brain',
    to: '#'
  },
  {
    title: 'Location-Based Projects',
    description: 'Find nearby projects using geolocation to collaborate easily with clients in your area.',
    icon: 'i-lucide-map-pin',
    to: '#'
  },
  {
    title: 'Secure Collaboration',
    description: 'Built-in chat and project management tools help students and clients work together seamlessly.',
    icon: 'i-lucide-message-circle',
    to: '#'
  }
])
</script>
