<template>
  <div class="min-h-screen bg-gradient-to-b from-violet-50/50 to-white">
    <!-- Profile Hero -->
    <div class="bg-gradient-to-br from-violet-100 via-white to-blue-50 pattern-dots">
      <UContainer class="max-w-5xl py-12">
        <div class="card-modern p-8">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
            <!-- Profile Image -->
            <div class="relative">
              <img 
                :src="user?.image_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'" 
                alt="Profile"
                class="w-32 h-32 rounded-2xl object-cover ring-4 ring-violet-200 shadow-xl"
              />
              <div class="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <UIcon name="i-lucide-verified" class="w-5 h-5 text-white" />
              </div>
            </div>

            <!-- Profile Info -->
            <div class="flex-1 text-center md:text-left">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ user?.name }}</h1>
              <p class="text-gray-500 mb-4">{{ user?.email }}</p>
              
              <!-- Rating -->
              <div class="flex items-center justify-center md:justify-start gap-2 mb-6">
                <div class="flex items-center gap-1">
                  <UIcon 
                    v-for="n in 5" 
                    :key="n" 
                    name="i-lucide-star" 
                    :class="[
                      'w-5 h-5',
                      n <= Math.round(portfolio.averageRating) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'
                    ]" 
                  />
                </div>
                <span class="text-sm font-medium text-gray-600">{{ portfolio.averageRating.toFixed(1) }}</span>
                <span class="text-sm text-gray-400">({{ portfolio.totalReviews }} reviews)</span>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap justify-center md:justify-start gap-3">
                <template v-if="id == userStore().user?.user_id">
                  <button 
                    @click="navigateTo('/profile/edit')"
                    class="flex items-center gap-2 px-6 py-3 rounded-xl btn-gradient text-white font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <UIcon name="i-lucide-pencil" class="w-5 h-5" />
                    Edit Profile
                  </button>
                </template>
                <template v-else>
                  <button 
                    @click="messageFreelancer"
                    class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                  >
                    <UIcon name="i-lucide-message-circle" class="w-5 h-5" />
                    Message
                  </button>
                  <button 
                    @click="hireFreelancer"
                    class="flex items-center gap-2 px-6 py-3 rounded-xl btn-gradient text-white font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <UIcon name="i-lucide-briefcase" class="w-5 h-5" />
                    Hire Now
                  </button>
                </template>
              </div>
            </div>

            <!-- Stats -->
            <div class="flex md:flex-col gap-6 md:gap-4 text-center">
              <div class="card-modern px-6 py-4">
                <p class="text-2xl font-bold text-gradient">{{ portfolio.totalCompleted }}</p>
                <p class="text-xs text-gray-500">Jobs Completed</p>
              </div>
              <div class="card-modern px-6 py-4">
                <p class="text-2xl font-bold text-gradient">100%</p>
                <p class="text-xs text-gray-500">Completion</p>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Main Content -->
    <UContainer class="max-w-5xl py-8">
      <!-- Tabs Navigation -->
      <div class="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-8">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all',
            activeTab === tab.key 
              ? 'bg-white text-purple-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          <UIcon :name="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- About Card (show when About tab active) -->
          <div v-if="activeTab === 'about'" class="card-modern p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <UIcon name="i-lucide-user" class="w-5 h-5 text-white" />
              </div>
              <h2 class="text-lg font-bold text-gray-900">About</h2>
            </div>
            <p class="text-gray-600 leading-relaxed">
              {{ user?.bio || "No bio available yet. This freelancer hasn't added their bio." }}
            </p>
          </div>

          <!-- Portfolio Section (show when Portfolio tab active) -->
          <div v-if="activeTab === 'portfolio'" class="space-y-6">
            <!-- Portfolio Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                  <UIcon name="i-lucide-folder-open" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 class="text-lg font-bold text-gray-900">Portfolio</h2>
                  <p class="text-sm text-gray-500">{{ portfolio.totalCompleted }} completed projects</p>
                </div>
              </div>
            </div>

            <!-- Portfolio Loading -->
            <div v-if="portfolioLoading" class="grid md:grid-cols-2 gap-4">
              <div v-for="i in 4" :key="i" class="card-modern p-5">
                <USkeleton class="h-6 w-3/4 rounded-lg mb-3" />
                <USkeleton class="h-4 w-1/2 rounded-lg mb-2" />
                <USkeleton class="h-16 w-full rounded-lg mb-3" />
                <div class="flex gap-2">
                  <USkeleton class="h-6 w-20 rounded-full" />
                  <USkeleton class="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>

            <!-- Portfolio Grid -->
            <div v-else-if="portfolio.items.length > 0" class="grid md:grid-cols-2 gap-4">
              <div
                v-for="item in portfolio.items"
                :key="item.application_id"
                @click="openPortfolioModal(item)"
                class="group card-modern p-5 hover:border-purple-200 hover:shadow-lg cursor-pointer transition-all"
              >
                <!-- Job Header -->
                <div class="flex items-start gap-3 mb-3">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img 
                      v-if="item.job.image_url" 
                      :src="item.job.image_url" 
                      :alt="item.job.title"
                      class="w-full h-full object-cover"
                    />
                    <UIcon v-else name="i-lucide-briefcase" class="w-6 h-6 text-purple-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                      {{ item.job.title }}
                    </h3>
                    <p class="text-sm text-gray-500">{{ item.job.category }}</p>
                  </div>
                </div>

                <!-- Description Preview -->
                <p class="text-sm text-gray-600 line-clamp-2 mb-3">
                  {{ item.portfolio_reflection || item.job.description }}
                </p>

                <!-- Meta Info -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium flex items-center gap-1">
                      <UIcon name="i-lucide-check-circle" class="w-3 h-3" />
                      Completed
                    </span>
                    <span v-if="item.job.reviews?.length > 0" class="flex items-center gap-1 text-xs text-amber-600">
                      <UIcon name="i-lucide-star" class="w-3 h-3 fill-amber-400" />
                      {{ item.job.reviews[0].rating }}.0
                    </span>
                  </div>
                  <span class="text-xs text-gray-400">
                    {{ formatDate(item.completed_at || item.created_at) }}
                  </span>
                </div>

                <!-- Client Info -->
                <div class="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <img 
                    :src="item.job.user.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.job.user.name)}&size=32&background=random`"
                    :alt="item.job.user.name"
                    class="w-6 h-6 rounded-full object-cover"
                  />
                  <span class="text-xs text-gray-500">Client: {{ item.job.user.name }}</span>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-16 card-modern">
              <div class="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <UIcon name="i-lucide-folder" class="w-10 h-10 text-gray-400" />
              </div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">No portfolio items yet</h3>
              <p class="text-gray-500 text-sm max-w-sm mx-auto">
                Completed projects will appear here to showcase this freelancer's work.
              </p>
            </div>
          </div>

          <!-- Reviews Section (show when Reviews tab active) -->
          <div v-if="activeTab === 'reviews'" class="space-y-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                <UIcon name="i-lucide-star" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-gray-900">Reviews</h2>
                <p class="text-sm text-gray-500">{{ portfolio.totalReviews }} total reviews</p>
              </div>
            </div>

            <!-- Reviews from portfolio items -->
            <div v-if="allReviews.length > 0" class="space-y-4">
              <div 
                v-for="review in allReviews" 
                :key="review.created_at"
                class="card-modern p-5"
              >
                <div class="flex items-start gap-4">
                  <img 
                    :src="review.fromUser.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.fromUser.name)}&size=48&background=random`"
                    :alt="review.fromUser.name"
                    class="w-12 h-12 rounded-xl object-cover"
                  />
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-semibold text-gray-900">{{ review.fromUser.name }}</h4>
                      <div class="flex items-center gap-1">
                        <UIcon 
                          v-for="n in 5" 
                          :key="n" 
                          name="i-lucide-star" 
                          :class="['w-4 h-4', n <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200']" 
                        />
                      </div>
                    </div>
                    <p class="text-gray-600 text-sm">{{ review.comment }}</p>
                    <p class="text-xs text-gray-400 mt-2">{{ formatDate(review.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Reviews -->
            <div v-else class="text-center py-16 card-modern">
              <div class="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <UIcon name="i-lucide-message-square" class="w-10 h-10 text-gray-400" />
              </div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">No reviews yet</h3>
              <p class="text-gray-500 text-sm">Reviews from clients will appear here.</p>
            </div>
          </div>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="space-y-6">
          <!-- Skills Card -->
          <div class="card-modern p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <UIcon name="i-lucide-zap" class="w-5 h-5 text-white" />
              </div>
              <h2 class="text-lg font-bold text-gray-900">Skills</h2>
            </div>

            <div v-if="user?.userSkills?.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="(skill, i) in user?.userSkills"
                :key="i"
                class="px-4 py-2 rounded-xl bg-violet-50 text-violet-700 text-sm font-medium border border-violet-100"
              >
                {{ skill.name }}
              </span>
            </div>
            <p v-else class="text-gray-500 text-sm">No skills added yet</p>
          </div>

          <!-- Stats Card -->
          <div class="card-modern p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Statistics</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Projects Completed</span>
                <span class="font-semibold text-gray-900">{{ portfolio.totalCompleted }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Average Rating</span>
                <span class="font-semibold text-gray-900 flex items-center gap-1">
                  <UIcon name="i-lucide-star" class="w-4 h-4 text-amber-400 fill-amber-400" />
                  {{ portfolio.averageRating.toFixed(1) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Total Reviews</span>
                <span class="font-semibold text-gray-900">{{ portfolio.totalReviews }}</span>
              </div>
            </div>
          </div>

          <!-- Contact Card -->
          <div class="card-modern p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Quick Contact</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <UIcon name="i-lucide-mail" class="w-5 h-5 text-blue-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-400">Email</p>
                  <p class="text-sm font-medium text-gray-700 truncate">{{ user?.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <UIcon name="i-lucide-clock" class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-400">Response Time</p>
                  <p class="text-sm font-medium text-gray-700">Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UContainer>

    <!-- Portfolio Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showPortfolioModal && selectedPortfolioItem" 
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <!-- Backdrop -->
          <div 
            class="absolute inset-0 bg-black/40 backdrop-blur-sm"
            @click="closePortfolioModal"
          ></div>

          <!-- Modal Content -->
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <!-- Header Image -->
            <div class="h-48 bg-gradient-to-br from-purple-100 to-blue-100 relative">
              <img 
                v-if="selectedPortfolioItem.job.image_url"
                :src="selectedPortfolioItem.job.image_url"
                :alt="selectedPortfolioItem.job.title"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-lucide-briefcase" class="w-16 h-16 text-purple-300" />
              </div>
              
              <!-- Close Button -->
              <button 
                @click="closePortfolioModal"
                class="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/90 hover:bg-white flex items-center justify-center text-gray-600 shadow-lg"
              >
                <UIcon name="i-lucide-x" class="w-5 h-5" />
              </button>

              <!-- Badges -->
              <div class="absolute bottom-4 left-4 flex items-center gap-2">
                <span class="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-medium flex items-center gap-1.5 shadow-lg">
                  <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                  Completed
                </span>
                <span v-if="selectedPortfolioItem.job.reviews?.length > 0" class="px-3 py-1.5 rounded-full bg-amber-500 text-white text-sm font-medium flex items-center gap-1.5 shadow-lg">
                  <UIcon name="i-lucide-star" class="w-4 h-4" />
                  Verified Work
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
              <!-- Title and Category -->
              <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ selectedPortfolioItem.job.title }}</h2>
                <div class="flex flex-wrap items-center gap-3">
                  <span class="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                    {{ selectedPortfolioItem.job.category }}
                  </span>
                  <span class="text-sm text-gray-500">
                    Completed {{ formatDate(selectedPortfolioItem.completed_at || selectedPortfolioItem.created_at) }}
                  </span>
                </div>
              </div>

              <!-- Client Info -->
              <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 mb-6">
                <img 
                  :src="selectedPortfolioItem.job.user.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPortfolioItem.job.user.name)}&size=48&background=random`"
                  :alt="selectedPortfolioItem.job.user.name"
                  class="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <p class="text-sm text-gray-500">Client</p>
                  <p class="font-semibold text-gray-900">{{ selectedPortfolioItem.job.user.name }}</p>
                </div>
                <div class="ml-auto text-right">
                  <p class="text-sm text-gray-500">Budget</p>
                  <p class="font-semibold text-emerald-600">RM {{ selectedPortfolioItem.price_offered }}</p>
                </div>
              </div>

              <!-- Reflection/Summary -->
              <div v-if="selectedPortfolioItem.portfolio_reflection" class="mb-6">
                <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <UIcon name="i-lucide-file-text" class="w-5 h-5 text-purple-600" />
                  Work Summary
                </h3>
                <p class="text-gray-600 leading-relaxed">{{ selectedPortfolioItem.portfolio_reflection }}</p>
              </div>

              <!-- Job Description -->
              <div class="mb-6">
                <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <UIcon name="i-lucide-list" class="w-5 h-5 text-purple-600" />
                  Project Description
                </h3>
                <p class="text-gray-600 leading-relaxed">{{ selectedPortfolioItem.job.description }}</p>
              </div>

              <!-- Review if exists -->
              <div v-if="selectedPortfolioItem.job.reviews?.length > 0" class="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div class="flex items-center gap-2 mb-3">
                  <UIcon name="i-lucide-star" class="w-5 h-5 text-amber-500" />
                  <h3 class="font-semibold text-amber-800">Client Review</h3>
                </div>
                <div class="flex items-center gap-1 mb-2">
                  <UIcon 
                    v-for="n in 5" 
                    :key="n" 
                    name="i-lucide-star" 
                    :class="['w-5 h-5', n <= selectedPortfolioItem.job.reviews[0].rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200']" 
                  />
                  <span class="ml-2 font-semibold text-amber-800">{{ selectedPortfolioItem.job.reviews[0].rating }}.0</span>
                </div>
                <p class="text-amber-700">{{ selectedPortfolioItem.job.reviews[0].comment }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface User {
  user_id: number;
  name: string | null;
  email: string | null;
  bio: string | null;
  image_url: string | null;
  userSkills: { name: string }[];
  jobs: { job_id: number; title: string }[];
}

interface PortfolioItem {
  application_id: number;
  portfolio_reflection: string | null;
  completed_at: string | null;
  created_at: string;
  price_offered: number;
  job: {
    job_id: number;
    title: string;
    description: string;
    category: string;
    image_url: string | null;
    user: {
      user_id: number;
      name: string;
      image_url: string | null;
    };
    reviews: {
      rating: number;
      comment: string;
      created_at: string;
      fromUser: {
        name: string;
        image_url: string | null;
      };
    }[];
  };
}

interface Portfolio {
  items: PortfolioItem[];
  totalCompleted: number;
  averageRating: number;
  totalReviews: number;
}

useSeoMeta({
  title: 'Freelancer Profile | SiswaGig',
  description: 'View freelancer profile, skills, portfolio, and reviews. Hire talented UiTM students for your projects.',
  ogTitle: 'Freelancer Profile | SiswaGig',
  ogDescription: 'Discover talented UiTM freelancers and their skills on SiswaGig.'
})

const route = useRoute();
const id = route.params.id;

// Tabs configuration
const tabs = [
  { key: 'about', label: 'About', icon: 'i-lucide-user' },
  { key: 'portfolio', label: 'Portfolio', icon: 'i-lucide-folder-open' },
  { key: 'reviews', label: 'Reviews', icon: 'i-lucide-star' },
]
const activeTab = ref('portfolio')

// User data
const { data } = useNuxtData(`user-${route.params.id}`);
const {
  data: freelancer,
  error,
  refresh,
} = await useFetch(`/api/user/${route.params.id}`, {
  key: `user-${route.params.id}`,
  default() {
    return data.value as User
  },
});
const user = ref<User>(freelancer.value as User)

// Portfolio data
const portfolioLoading = ref(true)
const portfolio = ref<Portfolio>({
  items: [],
  totalCompleted: 0,
  averageRating: 0,
  totalReviews: 0
})

// Portfolio modal
const showPortfolioModal = ref(false)
const selectedPortfolioItem = ref<PortfolioItem | null>(null)

// Computed: all reviews from portfolio items
const allReviews = computed(() => {
  const reviews: any[] = []
  portfolio.value.items.forEach(item => {
    if (item.job.reviews) {
      reviews.push(...item.job.reviews)
    }
  })
  return reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

// Fetch portfolio data
async function loadPortfolio() {
  portfolioLoading.value = true
  try {
    const data = await $fetch(`/api/user/${route.params.id}/portfolio`)
    portfolio.value = data as Portfolio
  } catch (err) {
    console.error('Failed to load portfolio:', err)
  } finally {
    portfolioLoading.value = false
  }
}

// Format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-MY', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Portfolio modal functions
const openPortfolioModal = (item: PortfolioItem) => {
  selectedPortfolioItem.value = item
  showPortfolioModal.value = true
}

const closePortfolioModal = () => {
  showPortfolioModal.value = false
  selectedPortfolioItem.value = null
}

const messageFreelancer = async () => {
  try {
    const myUserId = userStore().user?.user_id
    if (!myUserId) {
      alert('Please log in to send messages')
      return
    }

    const conversation = await $fetch('/api/conversations', {
      method: 'POST',
      body: {
        participant1_id: myUserId,
        participant2_id: user.value?.user_id
      }
    })

    if (conversation && (conversation as any).conversation_id) {
      navigateTo(`/inbox?conversation=${(conversation as any).conversation_id}`)
    }
  } catch (error) {
    console.error('Failed to start conversation:', error)
  }
};

const hireFreelancer = () => {
  navigateTo('/jobs/create')
};

// Load portfolio on mount
onMounted(() => {
  loadPortfolio()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
