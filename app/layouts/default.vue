<template>
  <div :class="['min-h-screen', bgClass]">
    <UHeader>
      <template #title>
        <div class="flex items-center gap-x-2">
          <Icon name="fluent-hat-graduation-12-filled"  class="text-purple-800"/>
        <p class="font-anton tracking-wider">SiswaGig</p>
        </div>
      </template>
      
      <template #right>
        <UColorModeButton />
        <UDropdownMenu
        v-if="userStore().user != null"
        :items="dropDownItem">
          <UButton
          :avatar="{
            src:
              userStore().user?.imageUrl ??
              'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png',
          }"
          variant="link"
        />
        </UDropdownMenu>
      </template>
      <template #body> </template>
    </UHeader>
    <div v-if="showBackButton" class="max-w-5xl mx-auto py-2" >
      <UContainer class="py-3">
        <button @click="goBack" class="font-bold flex items-center gap-2 text-gray-700 hover:text-gray-900 transition">
          <Icon size="16" name="line-md-arrow-left" /> Back 
        </button>
      </UContainer>
    </div>
    <div>
      <slot />
    </div>
    <UFooter>
      <p class="text-muted text-sm">
        Copyright © {{ new Date().getFullYear() }} SiswaGig
      </p>
    </UFooter>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const router = useRouter();

// Background color based on route
const bgClass = computed(() => {
  const path = route.path;
  const whiteBgPaths = ['/', '/explore', '/auth'];
  return whiteBgPaths.includes(path) ? 'bg-white' : 'bg-purple-50';
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
  ],
  [
    {
      label: 'Jobs',
      icon: 'basil-bag-solid',
      async onSelect() {
        await navigateTo('/explore')
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
  await $fetch("api/user/sign-out", {
    method: "POST"
  }).then(async () => {
    userStore().user = null;
    userStore().clearUser();
    useMyTokenStore().accessToken = "";
    await useRouter().push('/auth');
  });
}
</script>

<style></style>