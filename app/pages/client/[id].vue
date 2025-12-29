<template>
  <div class="min-h-screen bg-gray-50/50">
    <!-- Loading State -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <UIcon name="i-lucide-user" class="w-8 h-8 text-white" />
        </div>
        <p class="text-gray-500">Loading profile...</p>
      </div>
    </div>

    <div v-else>
      <!-- Profile Header -->
      <div class="bg-white border-b border-gray-100">
        <!-- Profile Info Section -->
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <!-- Avatar and Basic Info -->
            <div class="flex flex-col sm:flex-row items-start gap-5">
              <!-- Avatar -->
              <div class="relative flex-shrink-0">
                <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 p-1">
                  <img 
                    :src="client?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(client?.name || 'User')}&size=150&background=667eea&color=fff`"
                    :alt="client?.name"
                    class="w-full h-full rounded-xl object-cover"
                  />
                </div>
                <!-- Verified Badge -->
                <!-- <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center ring-3 ring-white">
                  <UIcon name="i-lucide-check" class="w-3.5 h-3.5 text-white" />
                </div> -->
              </div>

              <!-- Name and Info -->
              <div class="flex-1">
                <div class="flex items-center gap-3 flex-wrap">
                  <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ client?.name }}</h1>
                  <span class="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                    Client
                  </span>
                </div>
                <p class="text-gray-500 mt-1.5 flex items-center gap-2 text-sm">
                  <UIcon name="i-lucide-mail" class="w-4 h-4" />
                  {{ client?.email }}
                </p>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                  <span class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-purple-500" />
                    {{ client?.location || 'Location not set' }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-calendar" class="w-4 h-4 text-purple-500" />
                    Member since 2024
                  </span>
                  <!-- <span class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-shield-check" class="w-4 h-4 text-emerald-500" />
                    <span class="text-emerald-600 font-medium">Verified</span>
                  </span> -->
                </div>
                
                <!-- Bio Preview -->
                <p v-if="client?.bio" class="mt-3 text-gray-600 text-sm line-clamp-2 max-w-xl">
                  {{ client.bio }}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-3 flex-shrink-0">
              <template v-if="isOwnProfile">
                <NuxtLink 
                  to="/profile/edit"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
                >
                  <UIcon name="i-lucide-settings" class="w-4 h-4" />
                  Edit Profile
                </NuxtLink>
                <NuxtLink 
                  to="/jobs/create"
                    class="btn-gradient px-5 py-2.5 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <UIcon name="i-lucide-plus" class="w-4 h-4" />
                    Post Job
                  </NuxtLink>
                </template>
                <template v-else>
                  <button 
                    @click="navigateTo(`/inbox?userId=${client?.user_id}&name=${client?.name}`)"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
                  >
                    <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
                    Message
                  </button>
                  <button class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all">
                    <UIcon name="i-lucide-share-2" class="w-5 h-5" />
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- Tabs Navigation -->
          <div class="border-t border-gray-100 max-w-5xl mx-auto">
            <nav class="flex items-center gap-1 -mb-px overflow-x-auto scrollbar-hide">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                :class="[
                  'flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                  activeTab === tab.key 
                    ? 'border-purple-600 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                <UIcon :name="tab.icon" class="w-4 h-4" />
                {{ tab.label }}
                <span 
                  v-if="tab.count !== undefined"
                  :class="[
                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                    activeTab === tab.key ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  ]"
                >
                  {{ tab.count }}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="space-y-8">
          <!-- Stats Grid -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all group">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                  <UIcon name="i-lucide-briefcase" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ jobPosted }}</p>
                  <p class="text-sm text-gray-500">Jobs Posted</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all group">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                  <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ jobCompleted }}</p>
                  <p class="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all group">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                  <UIcon name="i-lucide-users" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ totalApplications }}</p>
                  <p class="text-sm text-gray-500">Applications</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-amber-200 transition-all group">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                  <UIcon name="i-lucide-star" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">4.9</p>
                  <p class="text-sm text-gray-500">Rating</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Two Column Layout -->
          <div class="grid lg:grid-cols-3 gap-8">
            <!-- Left Column - About & Details -->
            <div class="lg:col-span-1 space-y-6">
              <!-- About Card -->
              <div class="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UIcon name="i-lucide-user" class="w-5 h-5 text-purple-600" />
                  About
                </h3>
                <p class="text-gray-600 text-sm leading-relaxed">
                  {{ client?.bio || 'This client hasn\'t added a bio yet. Clients can add a description about themselves and their hiring preferences.' }}
                </p>
              </div>

              <!-- Quick Info Card -->
              <div class="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UIcon name="i-lucide-info" class="w-5 h-5 text-purple-600" />
                  Quick Info
                </h3>
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p class="text-xs text-gray-400">Location</p>
                      <p class="text-sm font-medium text-gray-900">{{ client?.location || 'Not specified' }}</p>
                    </div>
                  </div>
                  <!-- <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p class="text-xs text-gray-400">Verification</p>
                      <p class="text-sm font-medium text-emerald-600">Verified Client</p>
                    </div>
                  </div> -->
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <UIcon name="i-lucide-trending-up" class="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p class="text-xs text-gray-400">Response Rate</p>
                      <p class="text-sm font-medium text-gray-900">95%</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Hiring Preferences (if own profile) -->
              <div v-if="isOwnProfile" class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                <h3 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <UIcon name="i-lucide-sparkles" class="w-5 h-5 text-purple-600" />
                  Quick Actions
                </h3>
                <div class="space-y-3">
                  <NuxtLink 
                    to="/jobs/create"
                    class="flex items-center gap-3 p-3 rounded-xl bg-white hover:shadow-md transition-all"
                  >
                    <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                      <UIcon name="i-lucide-plus" class="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">Post New Job</p>
                      <p class="text-xs text-gray-500">Find talented freelancers</p>
                    </div>
                  </NuxtLink>
                  <NuxtLink 
                    to="/client/applications"
                    class="flex items-center gap-3 p-3 rounded-xl bg-white hover:shadow-md transition-all"
                  >
                    <div class="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                      <UIcon name="i-lucide-users" class="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">View Applications</p>
                      <p class="text-xs text-gray-500">Review applicants</p>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Right Column - Recent Jobs -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 class="font-semibold text-gray-900">Recent Jobs</h3>
                    <p class="text-sm text-gray-500">Latest job postings</p>
                  </div>
                  <button 
                    @click="activeTab = 'jobs'"
                    class="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    View All
                    <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
                  </button>
                </div>

                <div v-if="client?.jobs?.length" class="divide-y divide-gray-100">
                  <div 
                    v-for="job in client.jobs.slice(0, 3)" 
                    :key="job.job_id"
                    @click="navigateTo(`/jobs/${job.job_id}`)"
                    class="p-5 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                            {{ job.title }}
                          </h4>
                          <span 
                            :class="[
                              'flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium',
                              job.status === 'Open' ? 'bg-emerald-50 text-emerald-600' :
                              job.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                              'bg-blue-50 text-blue-600'
                            ]"
                          >
                            {{ job.status || 'Open' }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-500 line-clamp-1">{{ job.description }}</p>
                        <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span class="flex items-center gap-1">
                            <UIcon name="i-lucide-tag" class="w-3.5 h-3.5" />
                            {{ job.category }}
                          </span>
                          <span v-if="job.location" class="flex items-center gap-1">
                            <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5" />
                            {{ job.location }}
                          </span>
                        </div>
                      </div>
                      <div class="text-right flex-shrink-0">
                        <p class="text-lg font-bold text-purple-600">RM{{ job.budget }}</p>
                        <p class="text-xs text-gray-400">Budget</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="p-12 text-center">
                  <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <UIcon name="i-lucide-briefcase" class="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 class="font-medium text-gray-700 mb-1">No jobs posted yet</h4>
                  <p class="text-sm text-gray-500 mb-4">This client hasn't posted any jobs.</p>
                  <NuxtLink 
                    v-if="isOwnProfile"
                    to="/jobs/create"
                    class="btn-gradient px-5 py-2.5 rounded-xl font-semibold text-white inline-flex items-center gap-2"
                  >
                    <UIcon name="i-lucide-plus" class="w-4 h-4" />
                    Post Your First Job
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Jobs Tab -->
        <div v-if="activeTab === 'jobs'" class="space-y-6">
          <!-- Filter Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold text-gray-900">All Jobs</h2>
              <p class="text-sm text-gray-500">{{ client?.jobs?.length || 0 }} jobs posted</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                <button
                  v-for="filter in jobFilters"
                  :key="filter.key"
                  @click="jobFilter = filter.key"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    jobFilter === filter.key 
                      ? 'bg-white text-purple-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  ]"
                >
                  {{ filter.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Jobs Grid -->
          <div v-if="filteredJobs.length" class="grid md:grid-cols-2 gap-4">
            <div 
              v-for="job in filteredJobs" 
              :key="job.job_id"
              @click="navigateTo(`/jobs/${job.job_id}`)"
              class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-purple-200 cursor-pointer transition-all group"
            >
              <div class="flex items-start justify-between gap-4 mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                    {{ job.title }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ job.category }}</p>
                </div>
                <span 
                  :class="[
                    'flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium',
                    job.status === 'Open' ? 'bg-emerald-50 text-emerald-600' :
                    job.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                    'bg-blue-50 text-blue-600'
                  ]"
                >
                  {{ job.status || 'Open' }}
                </span>
              </div>

              <p class="text-sm text-gray-600 line-clamp-2 mb-4">{{ job.description }}</p>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 text-xs text-gray-400">
                  <span v-if="job.location" class="flex items-center gap-1">
                    <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5" />
                    {{ job.location }}
                  </span>
                  <span v-if="job.deadline" class="flex items-center gap-1">
                    <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
                    {{ useDateFormat(job.deadline, 'DD MMM') }}
                  </span>
                </div>
                <p class="text-lg font-bold text-purple-600">RM{{ job.budget }}</p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div class="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-lucide-search-x" class="w-10 h-10 text-gray-400" />
            </div>
            <h3 class="font-medium text-gray-700 mb-2">No jobs found</h3>
            <p class="text-sm text-gray-500 max-w-sm mx-auto">
              {{ jobFilter === 'all' ? 'No jobs have been posted yet.' : `No ${jobFilter.toLowerCase()} jobs found.` }}
            </p>
          </div>
        </div>

        <!-- Reviews Tab -->
        <div v-if="activeTab === 'reviews'" class="space-y-6">
          <div class="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <div class="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-lucide-star" class="w-10 h-10 text-amber-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Reviews Coming Soon</h3>
            <p class="text-gray-500 max-w-md mx-auto">
              The reviews feature is currently being developed. Soon, freelancers will be able to leave feedback about working with this client.
            </p>
          </div>
        </div>

        <!-- About Tab -->
        <div v-if="activeTab === 'about'" class="max-w-3xl space-y-6">
          <!-- Bio Section -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-file-text" class="w-5 h-5 text-purple-600" />
              Bio
            </h3>
            <p class="text-gray-600 leading-relaxed">
              {{ client?.bio || 'This client hasn\'t added a bio yet.' }}
            </p>
          </div>

          <!-- Contact Info -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-contact" class="w-5 h-5 text-purple-600" />
              Contact Information
            </h3>
            <div class="space-y-4">
              <div class="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <UIcon name="i-lucide-mail" class="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-400">Email Address</p>
                  <p class="font-medium text-gray-900">{{ client?.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-400">Location</p>
                  <p class="font-medium text-gray-900">{{ client?.location || 'Not specified' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Stats -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-bar-chart-3" class="w-5 h-5 text-purple-600" />
              Account Statistics
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="text-center p-4 rounded-xl bg-gray-50">
                <p class="text-2xl font-bold text-gray-900">{{ jobPosted }}</p>
                <p class="text-xs text-gray-500">Jobs Posted</p>
              </div>
              <div class="text-center p-4 rounded-xl bg-gray-50">
                <p class="text-2xl font-bold text-gray-900">{{ jobCompleted }}</p>
                <p class="text-xs text-gray-500">Completed</p>
              </div>
              <div class="text-center p-4 rounded-xl bg-gray-50">
                <p class="text-2xl font-bold text-gray-900">{{ totalApplications }}</p>
                <p class="text-xs text-gray-500">Applications</p>
              </div>
              <div class="text-center p-4 rounded-xl bg-gray-50">
                <p class="text-2xl font-bold text-gray-900">95%</p>
                <p class="text-xs text-gray-500">Response Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import type { Client } from '~/types/types';

useSeoMeta({
  title: 'Client Profile',
  description: 'View client profile and their job postings.',
});

const route = useRoute()
const id = route.params.id
const loading = ref(true)
const activeTab = ref('overview')
const jobFilter = ref('all')

// Tabs configuration
const tabs = computed(() => [
  { key: 'overview', label: 'Overview', icon: 'i-lucide-layout-dashboard' },
  { key: 'jobs', label: 'Jobs', icon: 'i-lucide-briefcase', count: client.value?.jobs?.length || 0 },
  { key: 'reviews', label: 'Reviews', icon: 'i-lucide-star' },
  { key: 'about', label: 'About', icon: 'i-lucide-user' },
])

// Job filters
const jobFilters = [
  { key: 'all', label: 'All' },
  { key: 'Open', label: 'Open' },
  { key: 'Completed', label: 'Completed' },
]

// Fetch client data
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

// Check if viewing own profile
const isOwnProfile = computed(() => {
  return Number(id) === userStore().user?.user_id
})

// Computed stats
const jobPosted = computed(() => {
  return client.value?.jobs?.length || 0
})

const jobCompleted = computed(() => {
  return client.value?.jobs?.filter(job => job.status === 'Completed').length || 0
})

const totalApplications = computed(() => {
  // This would ideally come from the API
  return client.value?.jobs?.length ? client.value.jobs.length * 3 : 0
})

// Filtered jobs based on filter selection
const filteredJobs = computed(() => {
  if (!client.value?.jobs) return []
  if (jobFilter.value === 'all') return client.value.jobs
  return client.value.jobs.filter(job => job.status === jobFilter.value)
})

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
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

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
