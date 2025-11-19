<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

import type { Job } from "~/types/types";

const route = useRoute();

const { data } = useNuxtData(`jobs`);
const {
  data: job,
  error,
  refresh,
} = await useFetch(`/api/jobs`, {
  key: `jobs`,
  method: "get",
  default() {
    return data.value as Job[];
  },
});

const jobs = ref<Job[]>(job.value as Job[]);

const activeTab = ref("jobs");
const searchQuery = ref("");
const category = ref(null);



const freelancers = [
  {
    name: "Aina Rahman",
    skill: "Graphic Designer",
    bio: "Experienced in poster and banner design. Canva, Figma, Photoshop.",
    location: "UiTM Puncak Alam",
    image:
      "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww",
  },
  {
    name: "Hakim Aiman",
    skill: "Web Developer",
    bio: "Frontend dev familiar with Nuxt, Tailwind, and Firebase.",
    location: "UiTM Shah Alam",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D-focus-photography-of-woman-outdoor-during-day-rDEOVtE7vOs",
  },
];

interface User {
  user_id: number | null;
  name: string | null;
  email: string | null;
  role: string | null;
  imageUrl: string | null;
}

const user = ref<User>({
  user_id: null,
  name: null,
  email: null,
  role: null,
  imageUrl: null,
});

onMounted(async () => {
  user.value = await $fetch("/api/user", {
    method: "GET",
    headers: {
      authorization: `Bearer ${useMyTokenStore().accessToken}`,
    },
  });

  if (user.value) userStore().user = user.value;
});
</script>

<template>
  <div class="p-8 space-y-8 max-w-5xl mx-auto  rounded-lg ">
    <!-- Header -->
    <UPageHeader
      title="Explore Opportunities"
      description="Find freelance jobs or discover talented UiTM students."
    />

    <!-- Search & Filters -->
    <div class="flex flex-wrap gap-4 items-center">
      <UInput
        v-model="searchQuery"
        placeholder="Search jobs or freelancers..."
        icon="i-lucide-search"
        class="flex-1"
      />
    </div>
    <p class="font-bold text-lg tracking-wide">Discover Jobs</p>
    <UPageGrid>
      <UPageCard
        class="cursor-pointer"
        v-for="(job, i) in jobs"
        :key="i"
        :title="job.title"
        :description="job.description"
        spotlight
        @click="navigateTo(`jobs/${job.job_id}`)"
      ></UPageCard>
    </UPageGrid>
    <div class="flex w-full justify-end">
      <UButton
        color="neutral"
        to="/jobs"
        variant="subtle"
        trailing-icon="i-lucide-arrow-right"
        size="md"
        >Discover more jobs</UButton
      >
    </div>
    <p class="font-bold text-lg tracking-wide">Discover Freelancers</p>
    <UPageGrid>
      <UPageCard
        v-for="(freelancer, i) in freelancers"
        :key="i"
        :title="freelancer.name"
        :description="freelancer.bio"
        spotlight
        reverse
      >
        <img :src="freelancer.image" />
      </UPageCard>
    </UPageGrid>
  </div>
</template>
