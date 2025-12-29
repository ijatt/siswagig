<template>
  <div class="min-h-screen bg-gray-50/50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <!-- Top Row -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-purple-200">
                <UIcon name="i-lucide-briefcase" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">My Active Jobs</h1>
                <p class="text-sm text-gray-500">Track and manage your hired projects</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button 
                @click="loadJobs"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
                :disabled="loading"
              >
                <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" :class="{ 'animate-spin': loading }" />
                Refresh
              </button>
              <NuxtLink 
                to="/explore"
                class="btn-gradient px-5 py-2.5 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg"
              >
                <UIcon name="i-lucide-search" class="w-4 h-4" />
                Find Jobs
              </NuxtLink>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <UIcon name="i-lucide-play" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-blue-700">{{ inProgressCount }}</p>
                  <p class="text-xs text-blue-600/70">In Progress</p>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-4 border border-amber-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <UIcon name="i-lucide-clock" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-amber-700">{{ submittedCount }}</p>
                  <p class="text-xs text-amber-600/70">Awaiting Review</p>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 border border-purple-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <UIcon name="i-lucide-user-check" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-purple-700">{{ hiredCount }}</p>
                  <p class="text-xs text-purple-600/70">Newly Hired</p>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-emerald-700">{{ completedCount }}</p>
                  <p class="text-xs text-emerald-600/70">Completed</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
                activeTab === tab.key 
                  ? 'bg-white text-purple-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <UIcon :name="tab.icon" class="w-4 h-4" />
              {{ tab.label }}
              <span 
                v-if="tab.count > 0"
                :class="[
                  'px-2 py-0.5 rounded-full text-xs font-semibold',
                  activeTab === tab.key ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'
                ]"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-6 border border-gray-100">
          <div class="flex items-start gap-4">
            <USkeleton class="w-16 h-16 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-6 w-3/4 rounded-lg" />
              <USkeleton class="h-4 w-1/2 rounded-lg" />
              <USkeleton class="h-4 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredJobs.length" class="text-center py-16">
        <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-lucide-briefcase" class="w-12 h-12 text-purple-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">
          {{ activeTab === 'all' ? 'No active jobs yet' : `No ${activeTab} jobs` }}
        </h3>
        <p class="text-gray-500 max-w-md mx-auto mb-6">
          When you get hired for a job, it will appear here. Start applying to jobs to get hired!
        </p>
        <NuxtLink 
          to="/explore"
          class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg"
        >
          <UIcon name="i-lucide-search" class="w-5 h-5" />
          Browse Jobs
        </NuxtLink>
      </div>

      <!-- Jobs List -->
      <div v-else class="space-y-4">
        <div 
          v-for="app in filteredJobs" 
          :key="app.application_id"
          class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-purple-200 transition-all"
        >
          <!-- Job Header -->
          <div class="p-6">
            <div class="flex items-start gap-4">
              <!-- Job Image -->
              <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  v-if="app.job.image_url" 
                  :src="app.job.image_url" 
                  :alt="app.job.title"
                  class="w-full h-full object-cover"
                />
                <UIcon v-else name="i-lucide-briefcase" class="w-8 h-8 text-purple-400" />
              </div>

              <!-- Job Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h3 class="font-semibold text-gray-900 text-lg">{{ app.job.title }}</h3>
                    <p class="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <span class="flex items-center gap-1">
                        <UIcon name="i-lucide-user" class="w-4 h-4" />
                        {{ app.job.user.name }}
                      </span>
                      <span class="text-gray-300">•</span>
                      <span class="flex items-center gap-1">
                        <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                        {{ app.job.location || 'Remote' }}
                      </span>
                    </p>
                  </div>
                  
                  <!-- Status Badge -->
                  <span 
                    :class="[
                      'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5',
                      statusConfig(app.status).bg,
                      statusConfig(app.status).text
                    ]"
                  >
                    <span :class="['w-2 h-2 rounded-full', statusConfig(app.status).dot]"></span>
                    {{ app.status }}
                  </span>
                </div>

                <!-- Job Meta -->
                <div class="flex flex-wrap items-center gap-4 mt-3 text-sm">
                  <span class="flex items-center gap-1 text-purple-600 font-medium">
                    <UIcon name="i-lucide-wallet" class="w-4 h-4" />
                    RM {{ app.price_offered || app.job.budget }}
                  </span>
                  <span class="flex items-center gap-1 text-gray-500">
                    <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                    Due: {{ useDateFormat(app.estimated_completion || app.job.deadline, 'DD MMM YYYY') }}
                  </span>
                  <span class="flex items-center gap-1 text-gray-500">
                    <UIcon name="i-lucide-clock" class="w-4 h-4" />
                    Hired: {{ useDateFormat(app.created_at, 'DD MMM YYYY') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Bar -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <!-- Progress indicator -->
              <div class="flex items-center gap-1">
                <div 
                  v-for="step in progressSteps" 
                  :key="step.key"
                  :class="[
                    'w-8 h-1 rounded-full transition-colors',
                    getProgressLevel(app.status) >= step.level ? 'bg-purple-500' : 'bg-gray-200'
                  ]"
                ></div>
              </div>
              <span class="text-xs text-gray-500 ml-2">{{ getProgressText(app.status) }}</span>
            </div>

            <div class="flex items-center gap-2">
              <!-- Message Client -->
              <button
                @click="messageClient(app.job.user.user_id, app.job.user.name)"
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-all"
              >
                <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
                Message
              </button>

              <!-- View Job -->
              <NuxtLink
                :to="`/jobs/${app.job.job_id}`"
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-all"
              >
                <UIcon name="i-lucide-external-link" class="w-4 h-4" />
                View Job
              </NuxtLink>

              <!-- Start Work (for Hired status) -->
              <button
                v-if="app.status === 'Hired'"
                @click="updateStatus(app.application_id, 'In Progress')"
                :disabled="updatingId === app.application_id"
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <UIcon v-if="updatingId === app.application_id" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
                <UIcon v-else name="i-lucide-play" class="w-4 h-4" />
                Start Work
              </button>

              <!-- Submit Work (for In Progress status) -->
              <button
                v-if="app.status === 'In Progress'"
                @click="openSubmitModal(app)"
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all"
              >
                <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                Submit Work
              </button>

              <!-- Revision Requested - Resubmit -->
              <button
                v-if="app.status === 'Revision'"
                @click="openSubmitModal(app)"
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-all"
              >
                <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" />
                Resubmit Work
              </button>

              <!-- Awaiting Review (for Submitted status) -->
              <span
                v-if="app.status === 'Submitted'"
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-700 text-sm font-medium"
              >
                <UIcon name="i-lucide-hourglass" class="w-4 h-4" />
                Awaiting Client Review
              </span>

              <!-- Completed Badge -->
              <span
                v-if="app.status === 'Completed'"
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-medium"
              >
                <UIcon name="i-lucide-trophy" class="w-4 h-4" />
                Project Completed!
              </span>

              <!-- Portfolio Settings (for Completed status) -->
              <button
                v-if="app.status === 'Completed'"
                @click="openPortfolioModal(app)"
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition-all"
              >
                <UIcon name="i-lucide-folder-open" class="w-4 h-4" />
                Portfolio Settings
              </button>
            </div>
          </div>

          <!-- Portfolio Status Banner (for Completed) -->
          <div 
            v-if="app.status === 'Completed'"
            class="px-6 py-3 bg-purple-50 border-t border-purple-100 flex items-center justify-between"
          >
            <div class="flex items-center gap-2 text-sm">
              <UIcon 
                :name="app.portfolio_visible !== false ? 'i-lucide-eye' : 'i-lucide-eye-off'" 
                :class="app.portfolio_visible !== false ? 'text-purple-600' : 'text-gray-400'"
                class="w-4 h-4"
              />
              <span :class="app.portfolio_visible !== false ? 'text-purple-700' : 'text-gray-500'">
                {{ app.portfolio_visible !== false ? 'Visible in Portfolio' : 'Hidden from Portfolio' }}
              </span>
            </div>
            <span v-if="app.portfolio_reflection" class="text-xs text-purple-500 flex items-center gap-1">
              <UIcon name="i-lucide-file-text" class="w-3.5 h-3.5" />
              Has summary
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Work Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showSubmitModal" 
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <!-- Backdrop -->
          <div 
            class="absolute inset-0 bg-black/40 backdrop-blur-sm"
            @click="closeSubmitModal"
          ></div>

          <!-- Modal -->
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <!-- Header -->
            <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-bold text-gray-900">Submit Your Work</h2>
                  <p class="text-sm text-gray-500 mt-1">{{ selectedApp?.job?.title }}</p>
                </div>
                <button 
                  @click="closeSubmitModal"
                  class="w-10 h-10 rounded-xl bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-700"
                >
                  <UIcon name="i-lucide-x" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-5">
              <div class="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div class="flex gap-3">
                  <UIcon name="i-lucide-info" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div class="text-sm text-amber-700">
                    <p class="font-medium">Before submitting:</p>
                    <ul class="list-disc list-inside mt-1 space-y-1 text-amber-600">
                      <li>Make sure all deliverables are complete</li>
                      <li>Upload any files via the messaging system</li>
                      <li>The client will review and approve your work</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Completion Note (Optional)
                </label>
                <textarea
                  v-model="submitNote"
                  rows="4"
                  placeholder="Add any notes about the completed work, links to deliverables, or additional comments..."
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                @click="closeSubmitModal"
                class="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                @click="submitWork"
                :disabled="submitting"
                class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <UIcon v-if="submitting" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
                <UIcon v-else name="i-lucide-send" class="w-4 h-4" />
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Portfolio Settings Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showPortfolioModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <!-- Backdrop -->
          <div
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            @click="closePortfolioModal"
          ></div>

          <!-- Modal -->
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <UIcon name="i-lucide-folder-open" class="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">Portfolio Settings</h3>
                    <p class="text-sm text-gray-500">Manage how this job appears in your portfolio</p>
                  </div>
                </div>
                <button
                  @click="closePortfolioModal"
                  class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <UIcon name="i-lucide-x" class="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6">
              <!-- Job Preview -->
              <div class="p-4 bg-gray-50 rounded-xl">
                <p class="text-sm text-gray-500 mb-1">Project</p>
                <p class="font-semibold text-gray-900">{{ portfolioApp?.job?.title }}</p>
                <p class="text-sm text-gray-600 mt-1">
                  Client: {{ portfolioApp?.job?.client?.name }}
                </p>
              </div>

              <!-- Visibility Toggle -->
              <div class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                <div class="flex items-center gap-3">
                  <div :class="[
                    'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                    portfolioVisible ? 'bg-purple-100' : 'bg-gray-100'
                  ]">
                    <UIcon 
                      :name="portfolioVisible ? 'i-lucide-eye' : 'i-lucide-eye-off'" 
                      :class="portfolioVisible ? 'text-purple-600' : 'text-gray-400'"
                      class="w-5 h-5"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Portfolio Visibility</p>
                    <p class="text-sm text-gray-500">
                      {{ portfolioVisible ? 'Visible to clients on your profile' : 'Hidden from your public profile' }}
                    </p>
                  </div>
                </div>
                <button
                  @click="portfolioVisible = !portfolioVisible"
                  :class="[
                    'relative w-12 h-6 rounded-full transition-colors',
                    portfolioVisible ? 'bg-purple-600' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                      portfolioVisible ? 'translate-x-6' : 'translate-x-0'
                    ]"
                  ></span>
                </button>
              </div>

              <!-- Reflection/Summary -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Project Summary
                  <span class="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  v-model="portfolioReflection"
                  rows="4"
                  placeholder="Describe what you accomplished, technologies used, challenges overcome, or skills demonstrated..."
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
                ></textarea>
                <p class="text-xs text-gray-400 mt-1">
                  This will be shown to clients viewing your portfolio
                </p>
              </div>

              <!-- Tips -->
              <div class="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div class="flex items-start gap-3">
                  <UIcon name="i-lucide-lightbulb" class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div class="text-sm text-purple-700">
                    <p class="font-medium mb-1">Portfolio Tips</p>
                    <ul class="list-disc list-inside space-y-1 text-purple-600">
                      <li>Highlight specific outcomes or results</li>
                      <li>Mention key technologies or methods used</li>
                      <li>Keep it concise but informative</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                @click="closePortfolioModal"
                class="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                @click="savePortfolioSettings"
                :disabled="savingPortfolio"
                class="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <UIcon v-if="savingPortfolio" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
                <UIcon v-else name="i-lucide-check" class="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useDateFormat } from '@vueuse/core'

definePageMeta({
  middleware: "auth",
})

useSeoMeta({
  title: 'My Jobs | SiswaGig',
  description: 'Manage and track your active freelance jobs. View job statuses, communicate with clients, and submit work for review on SiswaGig.',
  ogTitle: 'My Jobs | SiswaGig',
  ogDescription: 'Keep track of your active freelance jobs and their statuses on SiswaGig.'
})

const toast = useToast()

// State
const jobs = ref<any[]>([])
const loading = ref(true)
const activeTab = ref('all')
const updatingId = ref<number | null>(null)
const showSubmitModal = ref(false)
const selectedApp = ref<any>(null)
const submitNote = ref('')
const submitting = ref(false)

// Portfolio state
const showPortfolioModal = ref(false)
const portfolioApp = ref<any>(null)
const portfolioVisible = ref(true)
const portfolioReflection = ref('')
const savingPortfolio = ref(false)

// Status configurations
const statusConfig = (status: string) => {
  switch (status) {
    case 'Hired':
      return { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' }
    case 'In Progress':
      return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500 animate-pulse' }
    case 'Submitted':
      return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' }
    case 'Completed':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' }
    case 'Revision':
      return { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500 animate-pulse' }
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' }
  }
}

// Progress steps
const progressSteps = [
  { key: 'hired', level: 1 },
  { key: 'progress', level: 2 },
  { key: 'submitted', level: 3 },
  { key: 'completed', level: 4 },
]

const getProgressLevel = (status: string) => {
  switch (status) {
    case 'Hired': return 1
    case 'In Progress': return 2
    case 'Revision': return 2 // Same level as In Progress
    case 'Submitted': return 3
    case 'Completed': return 4
    default: return 0
  }
}

const getProgressText = (status: string) => {
  switch (status) {
    case 'Hired': return 'Ready to start'
    case 'In Progress': return 'Work in progress'
    case 'Revision': return 'Revision requested'
    case 'Submitted': return 'Pending review'
    case 'Completed': return 'All done!'
    default: return ''
  }
}

// Tabs
const tabs = computed(() => [
  { key: 'all', label: 'All', icon: 'i-lucide-list', count: jobs.value.length },
  { key: 'In Progress', label: 'In Progress', icon: 'i-lucide-play', count: inProgressCount.value },
  { key: 'Revision', label: 'Revision', icon: 'i-lucide-refresh-cw', count: revisionCount.value },
  { key: 'Submitted', label: 'Submitted', icon: 'i-lucide-clock', count: submittedCount.value },
  { key: 'Completed', label: 'Completed', icon: 'i-lucide-check-circle', count: completedCount.value },
])

// Counts
const inProgressCount = computed(() => jobs.value.filter(j => j.status === 'In Progress').length)
const submittedCount = computed(() => jobs.value.filter(j => j.status === 'Submitted').length)
const hiredCount = computed(() => jobs.value.filter(j => j.status === 'Hired').length)
const completedCount = computed(() => jobs.value.filter(j => j.status === 'Completed').length)
const revisionCount = computed(() => jobs.value.filter(j => j.status === 'Revision').length)

// Filtered jobs
const filteredJobs = computed(() => {
  if (activeTab.value === 'all') return jobs.value
  return jobs.value.filter(j => j.status === activeTab.value)
})

// Load jobs
async function loadJobs() {
  loading.value = true
  try {
    const data = await $fetch('/api/applications/my-jobs', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${useMyTokenStore().accessToken}`
      }
    })
    jobs.value = data as any[]
  } catch (err) {
    console.error('Failed to load jobs:', err)
    toast.add({
      title: 'Error',
      description: 'Failed to load your jobs',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Update status
async function updateStatus(appId: number, status: string) {
  updatingId.value = appId
  try {
    await $fetch(`/api/applications/${appId}`, {
      method: 'POST',
      body: { status }
    })
    await loadJobs()
    toast.add({
      title: 'Status Updated',
      description: `Job marked as "${status}"`,
      color: 'success'
    })
  } catch (err) {
    console.error('Failed to update status:', err)
    toast.add({
      title: 'Error',
      description: 'Failed to update status',
      color: 'error'
    })
  } finally {
    updatingId.value = null
  }
}

// Message client
const messageClient = (userId: number, name: string) => {
  navigateTo(`/inbox?userId=${userId}&name=${name}`)
}

// Submit modal
const openSubmitModal = (app: any) => {
  selectedApp.value = app
  submitNote.value = ''
  showSubmitModal.value = true
}

const closeSubmitModal = () => {
  showSubmitModal.value = false
  selectedApp.value = null
  submitNote.value = ''
}

const submitWork = async () => {
  if (!selectedApp.value) return
  
  submitting.value = true
  try {
    // If there's a note, send it as a message first
    if (submitNote.value.trim()) {
      // The status update will trigger an automatic message
    }
    
    await $fetch(`/api/applications/${selectedApp.value.application_id}`, {
      method: 'POST',
      body: { status: 'Submitted' }
    })
    
    await loadJobs()
    closeSubmitModal()
    
    toast.add({
      title: 'Work Submitted!',
      description: 'Your work has been submitted for client review',
      color: 'success'
    })
  } catch (err) {
    console.error('Failed to submit work:', err)
    toast.add({
      title: 'Error',
      description: 'Failed to submit work',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}

// Portfolio modal functions
const openPortfolioModal = (app: any) => {
  portfolioApp.value = app
  portfolioVisible.value = app.portfolio_visible !== false
  portfolioReflection.value = app.portfolio_reflection || ''
  showPortfolioModal.value = true
}

const closePortfolioModal = () => {
  showPortfolioModal.value = false
  portfolioApp.value = null
  portfolioVisible.value = true
  portfolioReflection.value = ''
}

const savePortfolioSettings = async () => {
  if (!portfolioApp.value) return
  
  savingPortfolio.value = true
  try {
    await $fetch(`/api/applications/${portfolioApp.value.application_id}/portfolio`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${useMyTokenStore().accessToken}`
      },
      body: {
        portfolio_visible: portfolioVisible.value,
        portfolio_reflection: portfolioReflection.value.trim() || null
      }
    })
    
    // Update local state
    const appIndex = jobs.value.findIndex(j => j.application_id === portfolioApp.value.application_id)
    if (appIndex !== -1) {
      jobs.value[appIndex].portfolio_visible = portfolioVisible.value
      jobs.value[appIndex].portfolio_reflection = portfolioReflection.value.trim() || null
    }
    
    closePortfolioModal()
    
    toast.add({
      title: 'Portfolio Updated',
      description: portfolioVisible.value 
        ? 'This project is now visible in your portfolio' 
        : 'This project is now hidden from your portfolio',
      color: 'success'
    })
  } catch (err) {
    console.error('Failed to save portfolio settings:', err)
    toast.add({
      title: 'Error',
      description: 'Failed to update portfolio settings',
      color: 'error'
    })
  } finally {
    savingPortfolio.value = false
  }
}

onMounted(loadJobs)
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
</style>
