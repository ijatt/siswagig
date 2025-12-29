<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
    <UContainer class="max-w-2xl mx-auto py-12 px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <UIcon name="i-lucide-user-check" class="w-12 h-12 text-primary mx-auto mb-3" />
        <h1 class="text-4xl font-bold text-gray-900">Complete Your Profile</h1>
        <p class="text-gray-500 mt-2">Just a few steps to get you started on SiswaGig</p>
      </div>

      <!-- Progress Steps -->
      <div class="flex justify-between mb-8">
        <div
          v-for="(step, idx) in steps"
          :key="idx"
          class="flex items-center flex-1"
        >
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
              idx <= currentStep
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-600'
            ]"
          >
            {{ idx + 1 }}
          </div>
          <div
            v-if="idx < steps.length - 1"
            :class="[
              'flex-1 h-1 mx-2 transition-all',
              idx < currentStep ? 'bg-primary' : 'bg-gray-200'
            ]"
          />
        </div>
      </div>

      <!-- Steps Content -->
      <UCard class="p-8">
        <!-- Step 1: Bio -->
        <div v-if="currentStep === 0" class="space-y-4">
          <div>
            <h2 class="text-2xl font-semibold mb-2">{{ steps[0] }}</h2>
            <p class="text-gray-500 mb-4">
              Tell us about yourself and your experience
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <UTextarea
              v-model="form.bio"
              placeholder="Share your experience, expertise, and what makes you unique..."
              class="w-full"
            />
            <p class="text-xs text-gray-400 mt-2">{{ form.bio?.length || 0 }} characters</p>
          </div>
        </div>

        <!-- Step 2: Skills -->
        <div v-if="currentStep === 1" class="space-y-4">
          <div>
            <h2 class="text-2xl font-semibold mb-2">{{ steps[1] }}</h2>
            <p class="text-gray-500 mb-4">
              Select skills that match your expertise
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Select Skills</label>
            <USelectMenu
              v-model="form.skills"
              value-key="id"
              :items="availableSkills"
              multiple
              searchable
              placeholder="Search and select skills..."
            />
          </div>
          <!-- Selected Skills Display -->
          <div v-if="form.skills.length > 0" class="mt-4">
            <p class="text-sm font-medium text-gray-700 mb-2">Selected Skills:</p>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="skill in selectedSkillNames"
                :key="skill"
                color="primary"
                variant="soft"
              >
                {{ skill }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Step 3: Location -->
        <div v-if="currentStep === 2" class="space-y-4">
          <div>
            <h2 class="text-2xl font-semibold mb-2">{{ steps[2] }}</h2>
            <p class="text-gray-500 mb-4">
              Where are you located?
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <UInput
              v-model="form.location"
              placeholder="e.g., Kuala Lumpur, Malaysia"
              class="w-full"
            />
          </div>
        </div>

        <!-- Step 4: Review -->
        <div v-if="currentStep === 3" class="space-y-4">
          <div>
            <h2 class="text-2xl font-semibold mb-2">{{ steps[3] }}</h2>
            <p class="text-gray-500 mb-4">
              Review your information before completing
            </p>
          </div>
          <div class="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-600">Bio</p>
              <p class="text-gray-900">{{ form.bio || '(Not provided)' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Skills</p>
              <div v-if="selectedSkillNames.length > 0" class="flex flex-wrap gap-2 mt-1">
                <UBadge
                  v-for="skill in selectedSkillNames"
                  :key="skill"
                  color="primary"
                  variant="soft"
                >
                  {{ skill }}
                </UBadge>
              </div>
              <p v-else class="text-gray-900">(Not provided)</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Location</p>
              <p class="text-gray-900">{{ form.location || '(Not provided)' }}</p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
          {{ errorMessage }}
        </div>

        <!-- Navigation Buttons -->
        <div class="flex gap-3 mt-8">
          <UButton
            v-if="currentStep > 0"
            variant="ghost"
            @click="prevStep"
          >
            Back
          </UButton>
          <div class="flex-1" />
          <UButton
            v-if="currentStep < 3"
            color="primary"
            @click="nextStep"
            :disabled="!canProceed"
          >
            Next
          </UButton>
          <UButton
            v-if="currentStep === 3"
            color="primary"
            @click="submitProfile"
            :loading="isSubmitting"
          >
            Complete Profile
          </UButton>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Complete Your Profile | SiswaGig',
  description: 'Finish setting up your SiswaGig profile to start finding freelance opportunities or attracting clients. Add your bio, skills, and location.',
  ogTitle: 'Complete Your Profile | SiswaGig',
  ogDescription: 'Get started on SiswaGig by completing your profile with key information.'
})

const router = useRouter()
const user = userStore()

const steps = ['About You', 'Skills', 'Location', 'Review']
const currentStep = ref(0)
const isSubmitting = ref(false)
const errorMessage = ref('')

const form = reactive({
  bio: '',
  skills: [] as number[],
  location: ''
})

const availableSkills = ref<Array<{label: string; id: number}>>([])

const laodSkills = async () => {
  try {
    const data = await $fetch('/api/skills')
    availableSkills.value = (data as Array<{name: string; skill_id: number}>).map(skill => ({
      label: skill.name,
      id: skill.skill_id
    }))
  } catch (err) {
    console.error('Failed to load skills:', err)
  }
}

// Get selected skill names for display
const selectedSkillNames = computed(() => {
  return availableSkills.value
    .filter(skill => form.skills.includes(skill.id))
    .map(skill => skill.label)
})

// Validation for each step
const canProceed = computed(() => {
  if (currentStep.value === 0) return form.bio.trim().length >= 10
  if (currentStep.value === 1) return form.skills.length > 0
  if (currentStep.value === 2) return form.location.trim().length >= 2
  return true
})

function nextStep() {
  if (!canProceed.value) {
    errorMessage.value = 'Please complete this step before proceeding'
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
    return
  }
  errorMessage.value = ''
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
  errorMessage.value = ''
}

async function submitProfile() {
  if (!canProceed.value) {
    errorMessage.value = 'Please complete all steps'
    return
  }

  isSubmitting.value = true
  try {
    const token = useMyTokenStore().accessToken
    await $fetch('/api/user/complete-profile', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        user_id: user.user?.user_id,
        bio: form.bio,
        skills: form.skills,
        location: form.location
      }
    })

    // Redirect to explore page
    await router.push('/explore')
  } catch (err: any) {
    console.error('Failed to save profile:', err)
    errorMessage.value = err?.data?.message || 'Failed to save profile. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  laodSkills()
})
</script>
