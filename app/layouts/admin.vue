<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="sidebarOpen && isMobile" 
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out',
        'bg-white border-r border-gray-200/80 shadow-xl shadow-gray-200/50',
        sidebarCollapsed && !isMobile ? 'w-[72px]' : 'w-64',
        isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
      ]"
    >
      <!-- Logo Section -->
      <div :class="['flex items-center h-16 border-b border-gray-100', sidebarCollapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-4']">
        <NuxtLink to="/admin" :class="['flex items-center group', sidebarCollapsed && !isMobile ? 'justify-center' : 'gap-2.5']">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all">
            <Icon name="fluent-hat-graduation-12-filled" class="text-white text-lg"/>
          </div>
          <span 
            v-if="!sidebarCollapsed || isMobile" 
            class="font-bold text-lg bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
          >
            SiswaGig
          </span>
        </NuxtLink>
        
        <!-- Close button for mobile -->
        <button 
          v-if="isMobile" 
          @click="sidebarOpen = false"
          class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="i-lucide-x" class="text-lg" />
        </button>
        
        <!-- Collapse button for desktop (only show when expanded) -->
        <button 
          v-if="!isMobile && !sidebarCollapsed" 
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="i-lucide-panel-left-close" class="text-lg" />
        </button>
      </div>

      <!-- Navigation -->
      <nav :class="['mt-3 space-y-0.5', sidebarCollapsed && !isMobile ? 'px-2 overflow-visible' : 'px-2.5 overflow-y-auto']" :style="sidebarCollapsed && !isMobile ? '' : 'max-height: calc(100vh - 160px);'">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center rounded-xl transition-all duration-200',
            'group relative',
            sidebarCollapsed && !isMobile ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
            isActiveRoute(item.to) 
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/25' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          <Icon 
            :name="item.icon" 
            :class="[
              'text-lg flex-shrink-0 transition-colors', 
              isActiveRoute(item.to) ? 'text-white' : 'text-gray-400 group-hover:text-purple-500'
            ]" 
          />
          <span 
            v-if="!sidebarCollapsed || isMobile" 
            class="font-medium text-sm"
          >
            {{ item.label }}
          </span>
          
          <!-- Tooltip for collapsed state -->
          <div 
            v-if="sidebarCollapsed && !isMobile"
            class="absolute left-full ml-2.5 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50"
          >
            {{ item.label }}
          </div>
        </NuxtLink>
        
        <!-- Expand button at bottom of nav when collapsed -->
        <button 
          v-if="sidebarCollapsed && !isMobile"
          @click="sidebarCollapsed = false"
          class="w-full flex items-center justify-center py-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-purple-500 transition-colors mt-2"
        >
          <Icon name="i-lucide-panel-left-open" class="text-lg" />
        </button>
      </nav>

      <!-- User Profile Section -->
      <div :class="['absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-gray-50/50', sidebarCollapsed && !isMobile ? 'p-2' : 'p-3']">
        <div :class="['flex items-center', sidebarCollapsed && !isMobile ? 'justify-center' : 'gap-2.5']">
          <div class="relative flex-shrink-0 group">
            <img 
              :src="userStore().user?.imageUrl || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'"
              class="w-9 h-9 rounded-xl object-cover ring-2 ring-purple-100"
              alt="Admin"
            />
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
            
            <!-- Tooltip for collapsed state -->
            <div 
              v-if="sidebarCollapsed && !isMobile"
              class="absolute left-full ml-2.5 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50"
            >
              {{ userStore().user?.name }}
            </div>
          </div>
          <div v-if="!sidebarCollapsed || isMobile" class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 truncate">{{ userStore().user?.name }}</p>
            <p class="text-xs text-gray-500">Administrator</p>
          </div>
          <button 
            v-if="!sidebarCollapsed || isMobile"
            @click="logout"
            class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <Icon name="i-lucide-log-out" class="text-lg" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div 
      :class="[
        'transition-all duration-300 ease-in-out min-h-screen',
        sidebarCollapsed && !isMobile ? 'lg:ml-[72px]' : 'lg:ml-64'
      ]"
    >
      <!-- Top Navbar -->
      <header class="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-gray-200/60">
        <div class="flex items-center justify-between h-14 px-4 lg:px-6">
          <!-- Left side -->
          <div class="flex items-center gap-3">
            <!-- Mobile menu button -->
            <button 
              @click="sidebarOpen = true"
              class="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Icon name="i-lucide-menu" class="text-lg" />
            </button>
            
            <!-- Breadcrumb -->
            <div class="flex items-center gap-2 text-sm">
              <Icon name="i-lucide-shield" class="text-purple-500" />
              <span class="text-gray-400">/</span>
              <span class="font-medium text-gray-700">{{ currentPageTitle }}</span>
            </div>
          </div>

          <!-- Right side -->
          <div class="flex items-center gap-2">                      
            <UDropdownMenu :items="profileDropdown">
              <button class="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-colors">
                <img 
                  :src="userStore().user?.imageUrl || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'"
                  class="w-8 h-8 rounded-lg object-cover"
                  alt="Admin"
                />
                <Icon name="i-lucide-chevron-down" class="text-gray-400 text-sm hidden sm:block" />
              </button>
            </UDropdownMenu>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 lg:p-6">
        <!-- Page Header -->
        <div class="mb-6" v-if="currentPageTitle == 'Dashboard'">
          <h1 class="text-2xl font-bold text-gray-800">{{ currentPageTitle }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ currentDate }}</p>
        </div>
        
        <slot />
      </main>
      
      <!-- Footer -->
      <footer class="px-6 py-4 border-t border-gray-100 mt-auto">
        <div class="flex items-center justify-between text-xs text-gray-400">
          <p>© 2026 SiswaGig Admin Panel</p>
          <p>v1.0.0</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// Responsive states
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const isMobile = ref(false)

// Check for mobile on mount
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    sidebarOpen.value = true
  }
}

// Navigation items
const navItems = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin' },
  { label: 'Users', icon: 'i-lucide-users', to: '/admin/users' },
  { label: 'Jobs', icon: 'i-lucide-briefcase', to: '/admin/jobs' },
  { label: 'Applications', icon: 'i-lucide-file-text', to: '/admin/applications' },
  { label: 'Reviews', icon: 'i-lucide-star', to: '/admin/reviews' },
]

// Profile dropdown items
const profileDropdown = [
  [
    {
      label: userStore().user?.name || 'Admin',
      avatar: {
        src: userStore().user?.imageUrl || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'
      },
      type: 'label'
    }
  ],
  [
    {
      label: 'Back to Site',
      icon: 'i-lucide-external-link',
      onSelect: () => navigateTo('/explore')
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      onSelect: () => logout()
    }
  ]
]

// Current page title
const currentPageTitle = computed(() => {
  const path = route.path
  if (path === '/admin') return 'Dashboard'
  if (path.includes('/admin/users')) return 'Users Management'
  if (path.includes('/admin/jobs')) return 'Jobs Management'
  if (path.includes('/admin/applications')) return 'Applications Management'
  if (path.includes('/admin/reviews')) return 'Reviews Management'
  return 'Admin'
})

// Current date
const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

// Check if route is active
const isActiveRoute = (path: string) => {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}

// Logout function
const logout = async () => {
  try {
    await $fetch("/api/user/sign-out", {
      method: "POST",
      headers: {
        authorization: `Bearer ${useMyTokenStore().accessToken}`
      }
    })
  } catch (err) {
    console.error('Logout API error:', err)
  } finally {
    userStore().clearUser()
    useMyTokenStore().clearToken()
    await router.push('/auth')
  }
}
</script>

<style scoped>
/* Custom scrollbar for sidebar */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>
