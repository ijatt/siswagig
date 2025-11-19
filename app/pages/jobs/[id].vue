<template>
  <UContainer class="max-w-4xl mx-auto py-10">
    <!-- Job Header -->
    <UCard class="p-6 space-y-6" title="test">
      <template #header>
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 class="text-2xl font-bold">{{ jobs?.title }}</h1>
            <div class="flex gap-2 mt-2">
              <UBadge color="primary" variant="soft">{{ jobs?.category }}</UBadge>
              <UBadge color="neutral" variant="soft">RM {{ jobs?.budget }}</UBadge>
            </div>
          </div>
          <UBadge color="info" variant="soft">{{ jobs?.status }}</UBadge>
        </div>
      </template>

      <!-- Job Details -->
      <div class="space-y-4">
        <div class="w-full" v-if="jobs?.image_url.length > 0">
          <img :src="`https://mfqhyxhmozlirbgxdogq.supabase.co/storage/v1/object/public/images/${jobs?.image_url}`" alt="" class="w-40 h-40 rounded-md mx-auto hover:shadow-md">
        </div>
        <div>
          <h2 class="font-semibold ">Description</h2>
          <p class=" mt-1">{{ jobs?.description }}</p>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <h2 class="font-semibold ">Deadline</h2>
            <p class="">{{ useDateFormat(jobs?.deadline, "DD/MM/YYYY") }}</p>
          </div>
          <div>
            <h2 class="font-semibold ">Location</h2>
            <p class="">{{ jobs?.location || "Remote" }}</p>
          </div>
        </div>

        <!-- Required Skills -->
        <div v-if="requiredSkillsList.length" class="space-y-3">
          <h2 class="font-semibold">Required Skills</h2>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="(skill, idx) in requiredSkillsList"
              :key="idx"
              color="primary"
              variant="soft"
            >
              {{ skill }}
            </UBadge>
          </div>
        </div>

        <UDivider />

        <!-- Client Info -->
        <div class="flex items-center gap-4 cursor-pointer">
          <UAvatar :src="jobs?.user?.image_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Izzah'" size="lg" @click="navigateTo(`/client/${jobs?.user?.user_id}`)" />
          <div>
            <p class="font-semibold" @click="navigateTo(`/client/${jobs?.user?.user_id}`)">{{ jobs?.user?.name }}</p>
            <p class=" text-sm">{{ jobs?.user?.location }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3" v-if="userStore().user?.user_id != jobs.user.user_id">
          <UButton
            color="neutral"
            variant="soft"
            icon="i-heroicons-chat-bubble-left"
            @click=""
          >
            Message
          </UButton>

          <UModal title="Apply for this Job" size="lg">
            <UButton color="primary" icon="i-heroicons-briefcase">
              Apply Now
            </UButton>
            <template #body>
              <UForm @submit="" class="space-y-5">
                <!-- Proposal -->
                  <UTextarea
                    v-model="payload.cover_letter"
                    placeholder="Briefly describe why you’re the right fit for this job..."
                    :rows="5"
                    class="w-full"
                  />

                <!-- Budget & Duration -->
                <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <UFormField
                    label="Proposed Budget (RM)"
                    name="price"
                    required
                  >
                    <UInput
                      v-model="payload.price"
                      type="number"
                      placeholder="Enter your proposed price"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField label="Estimated Completion Time" name="duration">
                    <UInput
                      v-model="payload.duration"
                      placeholder="e.g. 3 days, 1 week"
                      class="w-full"
                      type="date"
                    />
                  </UFormField>
                </div>

                <!-- Action buttons -->
                <div
                  class="flex justify-end gap-2 border-t border-gray-100 mt-6 pt-4"
                >
                  <UButton type="submit" color="primary" @click="submitApplication">
                    Submit Application
                  </UButton>
                </div>
              </UForm>
            </template>
          </UModal>
        </div>
        <div class="flex justify-end gap-3" v-else>
          <UButton
            color="neutral"
            variant="soft"
            icon="i-heroicons-pencil"
            @click=""
          >
            Edit job
          </UButton>
          <UButton
            color="error"
            variant="soft"
            icon="i-heroicons-trash"
            @click=""
          >
            Delete job
          </UButton>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import type { Job } from '~/types/types'

const route = useRoute();
const toast = useToast();

const { data } = useNuxtData(`job-${route.params.id}`);
const {
  data: job,
  error,
  refresh,
} = await useFetch(`/api/jobs/${route.params.id}`, {
  key: `job-${route.params.id}`,
  default() {
    return data.value as Job
  },
});
const jobs = ref<Job>(job.value as Job)

const requiredSkillsList = computed(() => {
  if (!jobs.value?.requiredSkills) return []
  return jobs.value.requiredSkills
    .split('/')
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)
})

const payload = reactive({
  cover_letter: "",
  price: jobs.value.budget || 0,
  duration: "",
  job_id: Number(route.params.id),
  user_id: userStore().user?.user_id
})

const submitApplication = async () => {
  try {
    const application = await $fetch("/api/jobs/apply", {
      method: "POST",
      body: payload
    }).then( async (res) => {
      console.log(res);
      
      if (res) {
        toast.add({
          title: "Application Success",
          description: "Your application has been submitted successfully!",
          color: "success"
        })
      await navigateTo("/applications");
      } else {
        throw new Error("Application submission failed")
      }
    }).catch((error) => {
      toast.add({
        title: "Application Error",
        description: error.statusMessage,
        color: "error",
      })
    })
  } catch (error) {}

  
};

</script>
