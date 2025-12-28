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
                  <UIcon v-for="n in 5" :key="n" name="i-lucide-star" class="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
                <span class="text-sm font-medium text-gray-600">5.0</span>
                <span class="text-sm text-gray-400">(128 reviews)</span>
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
                <p class="text-2xl font-bold text-gradient">{{ user?.jobs?.length || 0 }}</p>
                <p class="text-xs text-gray-500">Jobs Posted</p>
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
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- About Card -->
          <div class="card-modern p-6">
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

          <!-- Portfolio Card -->
          <div class="card-modern p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                  <UIcon name="i-lucide-folder-open" class="w-5 h-5 text-white" />
                </div>
                <h2 class="text-lg font-bold text-gray-900">Portfolio</h2>
              </div>
              <span class="text-sm text-gray-400">{{ user?.jobs?.length || 0 }} projects</span>
            </div>

            <div v-if="user?.jobs?.length > 0" class="grid md:grid-cols-2 gap-4">
              <div
                v-for="(job, i) in user?.jobs"
                :key="i"
                class="group p-4 rounded-xl border-2 border-gray-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all cursor-pointer"
              >
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                    <UIcon name="i-lucide-briefcase" class="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">{{ job.title }}</h3>
                    <p class="text-sm text-gray-500">Completed project</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <UIcon name="i-lucide-folder" class="w-8 h-8 text-gray-400" />
              </div>
              <p class="text-gray-500">No portfolio items yet</p>
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

const route = useRoute();

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

const id = route.params.id;
</script>
