<template>
  <div>
    <NuxtLayout name="admin">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-800">Welcome back, {{ userStore().user?.name }}!</h1>
        <p class="text-slate-500 mt-1">Here's what's happening with your platform today.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Users -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Icon name="i-lucide-users" class="text-white text-xl" />
            </div>
            <span class="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              +{{ stats?.recentUsers || 0 }} this week
            </span>
          </div>
          <p class="text-3xl font-bold text-slate-800">{{ stats?.totalUsers || 0 }}</p>
          <p class="text-sm text-slate-500 mt-1">Total Users</p>
        </div>

        <!-- Total Jobs -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Icon name="i-lucide-briefcase" class="text-white text-xl" />
            </div>
            <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {{ stats?.jobsByStatus?.open || 0 }} open
            </span>
          </div>
          <p class="text-3xl font-bold text-slate-800">{{ stats?.totalJobs || 0 }}</p>
          <p class="text-sm text-slate-500 mt-1">Total Jobs</p>
        </div>

        <!-- Total Applications -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Icon name="i-lucide-file-text" class="text-white text-xl" />
            </div>
            <span class="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              {{ stats?.applicationsByStatus?.pending || 0 }} pending
            </span>
          </div>
          <p class="text-3xl font-bold text-slate-800">{{ stats?.totalApplications || 0 }}</p>
          <p class="text-sm text-slate-500 mt-1">Total Applications</p>
        </div>

        <!-- Total Reviews -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Icon name="i-lucide-star" class="text-white text-xl" />
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-800">{{ stats?.totalReviews || 0 }}</p>
          <p class="text-sm text-slate-500 mt-1">Total Reviews</p>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Users by Role Chart -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 class="text-lg font-semibold text-slate-800 mb-6">Users by Role</h3>
          <div class="space-y-4">
            <div v-for="(count, role) in stats?.usersByRole" :key="role" class="relative">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-slate-600 capitalize">{{ role }}</span>
                <span class="text-sm font-semibold text-slate-800">{{ count }}</span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  :class="[
                    'h-full rounded-full transition-all duration-500',
                    role === 'freelancer' ? 'bg-gradient-to-r from-violet-500 to-purple-600' :
                    role === 'client' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                    'bg-gradient-to-r from-amber-500 to-orange-600'
                  ]"
                  :style="{ width: `${stats?.totalUsers ? (count / stats.totalUsers) * 100 : 0}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Application Status Chart -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 class="text-lg font-semibold text-slate-800 mb-6">Applications by Status</h3>
          <div class="grid grid-cols-2 gap-4">
            <div 
              v-for="(count, status) in stats?.applicationsByStatus" 
              :key="status"
              class="p-4 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div class="flex items-center gap-3 mb-2">
                <div :class="[
                  'w-3 h-3 rounded-full',
                  status === 'pending' ? 'bg-amber-500' :
                  status === 'accepted' ? 'bg-green-500' :
                  status === 'rejected' ? 'bg-red-500' :
                  status === 'completed' ? 'bg-blue-500' :
                  'bg-slate-400'
                ]"></div>
                <span class="text-sm font-medium text-slate-600 capitalize">{{ status }}</span>
              </div>
              <p class="text-2xl font-bold text-slate-800">{{ count }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Jobs Status Overview -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
        <h3 class="text-lg font-semibold text-slate-800 mb-6">Jobs Overview</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div 
            v-for="(count, status) in stats?.jobsByStatus" 
            :key="status"
            class="text-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200"
          >
            <p class="text-2xl font-bold text-slate-800">{{ count }}</p>
            <p class="text-sm text-slate-500 capitalize mt-1">{{ status }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <NuxtLink 
            to="/admin/users" 
            class="flex flex-col items-center gap-2 p-4 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-100 transition-colors group"
          >
            <Icon name="i-lucide-users" class="text-2xl text-violet-600 group-hover:scale-110 transition-transform" />
            <span class="text-sm font-medium text-violet-700">Manage Users</span>
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/jobs" 
            class="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors group"
          >
            <Icon name="i-lucide-briefcase" class="text-2xl text-blue-600 group-hover:scale-110 transition-transform" />
            <span class="text-sm font-medium text-blue-700">Manage Jobs</span>
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/applications" 
            class="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-100 transition-colors group"
          >
            <Icon name="i-lucide-file-text" class="text-2xl text-amber-600 group-hover:scale-110 transition-transform" />
            <span class="text-sm font-medium text-amber-700">Applications</span>
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/reviews" 
            class="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-colors group"
          >
            <Icon name="i-lucide-star" class="text-2xl text-emerald-600 group-hover:scale-110 transition-transform" />
            <span class="text-sm font-medium text-emerald-700">Reviews</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          <p class="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: false
})

useSeoMeta({
  title: 'Admin Dashboard | SiswaGig',
  description: 'System overview and analytics for SiswaGig platform'
})

const tokenStore = useMyTokenStore()

// Fetch stats
const { data: stats, pending, refresh } = await useFetch('/api/admin/stats', {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  }
})
</script>
