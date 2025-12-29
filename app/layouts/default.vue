<template>
  <div :class="['min-h-screen', bgClass]">
    <!-- Modern Header with Glassmorphism -->
    <header class="sticky top-0 z-50 glass border-b border-white/20">
      <UContainer>
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-x-2 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Icon name="fluent-hat-graduation-12-filled" class="text-white text-xl"/>
            </div>
            <p class="font-anton text-xl tracking-wider text-gradient font-bold">SiswaGig</p>
          </NuxtLink>
          
          <!-- Right Actions -->
          <div class="flex items-center gap-3">
            <!-- Notification Bell -->
            <NotificationBell v-if="userStore().user != null" />
            
            <UColorModeButton class="hover-lift" />
            <UDropdownMenu
              v-if="userStore().user != null"
              :items="dropDownItem"
            >
              <UButton
                class="ring-2 ring-purple-200 hover:ring-purple-400 transition-all rounded-full"
                :avatar="{
                  src:
                    userStore().user?.imageUrl ??
                    'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png',
                }"
                variant="ghost"
              />
            </UDropdownMenu>
          </div>
        </div>
      </UContainer>
    </header>

    <!-- Back Button -->
    <div v-if="showBackButton" class="max-w-5xl mx-auto">
      <UContainer class="py-4">
        <button 
          @click="goBack" 
          class="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 shadow-sm hover:shadow-md hover:border-purple-300 hover:text-purple-700 transition-all duration-300 overflow-hidden"
        >
          <!-- Hover gradient background -->
          <div class="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <!-- Icon with animation -->
          <div class="relative w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-all duration-300">
            <Icon size="16" name="i-lucide-arrow-left" class="text-gray-500 group-hover:text-purple-600 group-hover:-translate-x-0.5 transition-all duration-300" />
          </div>
          
          <!-- Text -->
          <span class="relative font-medium text-sm">Go Back</span>
          
          <!-- Decorative dot -->
          <div class="relative w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-purple-400 transition-colors duration-300"></div>
        </button>
      </UContainer>
    </div>

    <!-- Main Content -->
    <main class="pb-8">
      <slot />
    </main>

    <!-- Modern Footer -->
    <footer class="border-t border-gray-100 bg-white/50 backdrop-blur-sm mt-auto">
      <UContainer>
        <div class="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Icon name="fluent-hat-graduation-12-filled" class="text-white text-xs"/>
            </div>
            <span class="text-sm font-medium text-gray-600">SiswaGig</span>
          </div>
          <p class="text-gray-500 text-sm">
            © {{ new Date().getFullYear() }} SiswaGig. Built for UiTM students.
          </p>
        </div>
      </UContainer>
    </footer>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const router = useRouter();

// Background color based on route
const bgClass = computed(() => {
  const path = route.path;
  const whiteBgPaths = ['/', '/explore', '/auth'];
  return whiteBgPaths.includes(path) ? 'bg-white' : 'bg-white';
});

// Show back button on all pages except /explore, /auth, and /
const showBackButton = computed(() => {
  const path = route.path;
  const hiddenPaths = ['/explore', '/auth', '/'];
  return !hiddenPaths.includes(path);
});

const goBack = () => {
  router.back();
};

const freelancer = computed(() => [
  [
    {
      label: userStore().user?.name,
      avatar: {
        src: userStore().user?.imageUrl ?? "https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png"
      },
      type: 'label'
    }
  ],
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      async onSelect() {
        await navigateTo(`/freelancer/${userStore().user?.user_id}`)
      },
    },
    {
      label: 'Explore',
      icon: 'i-lucide-compass',
      async onSelect() {
        await navigateTo('/explore')
      },
    }
  ],
  [
    {
      label: 'Jobs',
      icon: 'basil-bag-solid',
      async onSelect() {
        await navigateTo('/applications/my-jobs')
      }
    },
    {
      label: 'Job Applications',
      icon: 'mdi-application-edit',
      async onSelect() {
        await navigateTo('/applications')
      }
    }
  ],
  [
    {
      label: 'Inbox',
      icon: 'bxs-envelope',
      async onSelect() {
        await navigateTo('/inbox')
      },
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      kbds: ['shift', 'meta', 'q'],
      onSelect() {
        logout()
      } 
    }
  ]
])
const client = computed(() => [
  [
    {
      label: userStore().user?.name,
      avatar: {
        src: userStore().user?.imageUrl ?? "https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png"
      },
      type: 'label'
    }
  ],
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      async onSelect() {
        await navigateTo(`/client/${userStore().user?.user_id}`)
      },
    }
  ],
  [
    {
      label: 'Post a Job',
      icon: 'basil-bag-solid',
      async onSelect() {
        await navigateTo('/jobs/create')
      }
    },
    {
      label: 'My Posted Jobs',
      icon: 'mdi-application-edit',
      async onSelect() {
        await navigateTo('/jobs')
      }
    },
    {
      label: 'Job Applications',
      icon: 'mdi-application-edit',
      async onSelect() {
        await navigateTo('/client/applications')
      }
    }
  ],
  [
    {
      label: 'Inbox',
      icon: 'bxs-envelope',
      async onSelect() {
        await navigateTo('/inbox')
      },
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      kbds: ['shift', 'meta', 'q'],
      onSelect() {
        logout()
      } 
    }
  ]
])

const dropDownItem = computed(() => {
  if (userStore().user?.role === 'freelancer') {
    return freelancer.value
  } else {
    return client.value
  }
})

const logout = async () => {
  try {
    await $fetch("api/user/sign-out", {
      method: "POST",
      headers: {
        authorization: `Bearer ${useMyTokenStore().accessToken}`
      }
    })
  } catch (err) {
    console.error('Logout API error:', err)
  } finally {
    // Clear user store
    userStore().clearUser()
    
    // Clear token store and localStorage
    useMyTokenStore().clearToken()
    
    // Redirect to auth
    await useRouter().push('/auth')
  }
}
</script>

<style></style>