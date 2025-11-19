<template>
  <UContainer class="py-10 space-y-8 max-w-5xl mx-auto">
    <!-- Profile Header -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
      <UCard  class="p-6 md:col-span-1 md:row-span-2">
        <template #header>
          <div class="flex justify-center w-full">
            <img class="rounded-full mx-auto w-24 h-24 border border-slate-300" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Izzah" size="3xl" />
          </div>
          <h1 class="text-2xl font-bold text-center">
            {{ user?.name }}
          </h1>
          <p class="text-center">{{ user?.email }}</p>
        </template>
        <template #default>
          <div
            class="flex flex-col items-center md:justify-between gap-6"
          >
            <div class="flex items-center gap-5">
              <div class="flex items-center gap-1 mt-1">
                <UIcon
                  name="i-heroicons-star-20-solid"
                  class="text-yellow-400"
                  v-for="n in 5"
                  :key="n"
                />
                <!-- <span class="text-sm text-gray-500 ml-2"
                  >({{ user?.name }})</span
                > -->
              </div>
            </div>

            <div class="flex gap-2">
              <template v-if="id == userStore().user?.user_id">
                <UButton color="primary" icon="i-heroicons-pencil" @click="navigateTo('/profile/edit')">
                  Edit Profile
                </UButton>
              </template>
              <template v-else>
                <UButton
                  color="neutral"
                  variant="soft"
                  icon="i-heroicons-chat-bubble-left"
                  @click="messageFreelancer"
                >
                  Message
                </UButton>
                <UButton
                  color="primary"
                  icon="i-heroicons-briefcase"
                  @click="hireFreelancer"
                >
                  Hire
                </UButton>
              </template>
            </div>
          </div>
        </template>
      </UCard>
      <UCard class="md:col-span-2">
        <template #header>
          <h2 class="text-lg font-semibold">About</h2>
        </template>
        <p class="leading-relaxed">
          {{ user?.bio?? "No bio available." }}
        </p>
      </UCard>
      <UCard class="md:col-start-2 md:col-span-2">
        <template #header>
          <h2 class="text-lg font-semibold">Skills</h2>
        </template>
        <div v-if="user.userSkills.length > 0" class="flex flex-wrap gap-2">
          <UBadge
          
            v-for="(skill, i) in user?.userSkills"
            :key="i"
            color="primary"
            variant="soft"
            class="text-sm px-3 py-1"
          >
            {{ skill.name }}
          </UBadge>
        </div>
        <p v-else>No skills added yet.</p>
      </UCard>
    </div>
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Portfolio</h2>
      </template>

      <div class="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
        <template v-if="user.jobs.length > 0">
          <UCard
          v-for="(job, i) in user?.jobs"
          :key="i"
          class="hover:shadow-lg transition-shadow duration-200"
        >
          <!-- <img
            src="api.dicebar.com/7.x/avataaars/svg?seed=Izzah"
            alt="Portfolio item"
            class="rounded-lg mb-3 object-cover h-40 w-full"
          /> -->
          <h3 class="font-semibold">{{ job.title }}</h3>
          <p class="text-gray-500 text-sm">{{ job.title }}</p>
        </UCard>
        </template>
        <template v-else>
          <p>No jobs available.</p>
        </template>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
interface User {
  user_id: number;
  name: string | null;
  email: string | null;
  bio: string | null;
  userSkills: Skill[];
  jobs: { job_id: number; title: string }[];
}
import type { Skill } from "@prisma/client";
import { useRoute } from "vue-router";

const route = useRoute();

// const freelancer = ref({
//   id: route.params.id,
//   name: "Nur Izzah Binti Halim",
//   title: "Frontend Developer & UI Designer",
//   rating: "4.9",
//   avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Izzah",
//   about:
//     "I’m a passionate front-end developer from UiTM with experience in building responsive web apps using Vue, Nuxt, and Tailwind. I love crafting clean UI and improving user experience.",
//   skills: [
//     "Nuxt.js",
//     "Vue.js",
//     "TailwindCSS",
//     "Figma",
//     "JavaScript",
//     "UI/UX Design",
//   ],
//   portfolio: [
//     {
//       title: "SiswaConnect Landing Page",
//       category: "Web Design",
//       image:
//         "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
//     },
//     {
//       title: "Mobile Food App UI",
//       category: "UI/UX Design",
//       image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
//     },
//     {
//       title: "Freelancer Dashboard",
//       category: "Frontend Development",
//       image:
//         "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
//     },
//   ],
// });

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

const messageFreelancer = () => {
  alert("Opening chat with freelancer...");
};

const hireFreelancer = () => {
  alert("Redirecting to job offer page...");
};

const id = route.params.id;
</script>
