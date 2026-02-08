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
              class="w-full"
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
          
          <!-- Location Detection -->
          <div class="space-y-4">
            <!-- Auto-detect Button -->
            <button
              @click="detectLocation"
              :disabled="isDetectingLocation"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              <UIcon v-if="isDetectingLocation" name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
              <UIcon v-else name="i-lucide-map-pin" class="w-5 h-5" />
              {{ isDetectingLocation ? 'Detecting...' : 'Detect My Location' }}
            </button>
            
            <!-- Location Error -->
            <div v-if="locationError" class="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">
              <UIcon name="i-lucide-alert-circle" class="w-4 h-4 flex-shrink-0" />
              {{ locationError }}
            </div>
            
            <!-- Detected Coordinates -->
            <div v-if="detectedCoords" class="bg-green-50 border border-green-200 rounded-xl p-4">
              <div class="flex items-center gap-2 text-green-700 mb-3">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5" />
                <span class="font-medium">Location detected!</span>
              </div>
              <p class="text-sm text-green-600 mb-3">
                Coordinates: {{ detectedCoords.latitude.toFixed(6) }}, {{ detectedCoords.longitude.toFixed(6) }}
              </p>
              <!-- Open in Google Maps -->
              <a 
                :href="`https://www.google.com/maps?q=${detectedCoords.latitude},${detectedCoords.longitude}`"
                target="_blank"
                class="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <UIcon name="i-lucide-external-link" class="w-4 h-4" />
                View on Google Maps
              </a>
            </div>

            <div class="relative flex items-center">
              <div class="flex-grow border-t border-gray-200"></div>
              <span class="flex-shrink mx-4 text-gray-400 text-sm">or enter manually</span>
              <div class="flex-grow border-t border-gray-200"></div>
            </div>
            
            <!-- Manual Location Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
              <UInput
                v-model="form.location"
                placeholder="e.g., Shah Alam, Selangor"
                class="w-full"
              />
            </div>
            
            <!-- Manual Coordinates (optional) -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <UInput
                  v-model.number="manualLatitude"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 3.0738"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <UInput
                  v-model.number="manualLongitude"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 101.5183"
                  class="w-full"
                />
              </div>
            </div>
            
            <p class="text-xs text-gray-400">
              💡 Tip: You can find coordinates by right-clicking on 
              <a href="https://maps.google.com" target="_blank" class="text-blue-500 hover:underline">Google Maps</a>
            </p>
          </div>
        </div>

        <!-- Step 4: Payment Info (Freelancers only) -->
        <div v-if="currentStep === paymentStepIndex && isFreelancer" class="space-y-4">
          <div>
            <h2 class="text-2xl font-semibold mb-2">{{ steps[paymentStepIndex] }}</h2>
            <p class="text-gray-500 mb-4">
              Add your bank account details to receive payments
            </p>
          </div>
          
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div class="text-sm">
                <p class="font-medium text-blue-800">Your information is secure</p>
                <p class="text-blue-700 mt-1">Bank details are only used to process your payments and are kept confidential.</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
            <UInput
              v-model="form.bank_name"
              placeholder="e.g., Maybank, CIMB, Public Bank"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
            <UInput
              v-model="form.bank_account_no"
              placeholder="Enter your bank account number"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
            <UInput
              v-model="form.bank_account_holder"
              placeholder="Name as it appears on your bank account"
              class="w-full"
            />
          </div>
          
          <p class="text-xs text-gray-500 mt-2">
            <UIcon name="i-lucide-info" class="w-3 h-3 inline mr-1" />
            You can skip this step and add payment info later in your profile settings.
          </p>
        </div>

        <!-- Step 4/5: Review -->
        <div v-if="currentStep === reviewStepIndex" class="space-y-4">
          <div>
            <h2 class="text-2xl font-semibold mb-2">{{ steps[reviewStepIndex] }}</h2>
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
            <!-- Payment Info (Freelancers only) -->
            <div v-if="isFreelancer">
              <p class="text-sm font-medium text-gray-600">Payment Info</p>
              <div v-if="form.bank_name || form.bank_account_no" class="mt-1">
                <p class="text-gray-900">{{ form.bank_name }} - {{ maskAccountNumber(form.bank_account_no) }}</p>
                <p class="text-gray-600 text-sm">{{ form.bank_account_holder }}</p>
              </div>
              <p v-else class="text-gray-500 text-sm">(Will be added later)</p>
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
            v-if="currentStep < reviewStepIndex"
            color="primary"
            @click="nextStep"
            :disabled="!canProceed"
          >
            Next
          </UButton>
          <UButton
            v-if="currentStep === reviewStepIndex"
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

// Steps depend on user role - freelancers have payment info step
const isFreelancer = computed(() => user.user?.role === 'freelancer')
const steps = computed(() => 
  isFreelancer.value 
    ? ['About You', 'Skills', 'Location', 'Payment Info', 'Review']
    : ['About You', 'Skills', 'Location', 'Review']
)
const reviewStepIndex = computed(() => steps.value.length - 1)
const paymentStepIndex = computed(() => isFreelancer.value ? 3 : -1)
const currentStep = ref(0)

// Helper to mask bank account number
const maskAccountNumber = (accountNo: string) => {
  if (!accountNo || accountNo.length < 4) return accountNo
  return '••••' + accountNo.slice(-4)
}
const isSubmitting = ref(false)
const errorMessage = ref('')

// Location detection
const isDetectingLocation = ref(false)
const locationError = ref('')
const detectedCoords = ref<{ latitude: number; longitude: number } | null>(null)
const manualLatitude = ref<number | null>(null)
const manualLongitude = ref<number | null>(null)

const form = reactive({
  bio: '',
  skills: [] as number[],
  location: '',
  latitude: null as number | null,
  longitude: null as number | null,
  bank_name: '',
  bank_account_no: '',
  bank_account_holder: ''
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

// Detect user location using browser geolocation API
async function detectLocation() {
  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by your browser'
    return
  }

  isDetectingLocation.value = true
  locationError.value = ''

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      detectedCoords.value = { latitude, longitude }
      form.latitude = latitude
      form.longitude = longitude
      manualLatitude.value = latitude
      manualLongitude.value = longitude
      
      // Try to get location name using reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        )
        const data = await response.json()
        if (data.address) {
          const { city, town, village, state, suburb } = data.address
          form.location = [suburb, city || town || village, state].filter(Boolean).join(', ')
        }
      } catch (err) {
        console.error('Reverse geocoding failed:', err)
        // User can still enter location name manually
      }
      
      isDetectingLocation.value = false
    },
    (error) => {
      const errorMessages: Record<number, string> = {
        1: 'Permission denied. Please enable location access in your browser settings.',
        2: 'Location information is unavailable.',
        3: 'The request to get your location timed out.'
      }
      locationError.value = errorMessages[error.code] || 'Failed to detect location'
      isDetectingLocation.value = false
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

// Watch manual coordinates and sync to form
watch([manualLatitude, manualLongitude], ([lat, lon]) => {
  if (lat !== null && lon !== null) {
    form.latitude = lat
    form.longitude = lon
  }
})

// Validation for each step
const canProceed = computed(() => {
  if (currentStep.value === 0) return form.bio.trim().length >= 10
  if (currentStep.value === 1) return form.skills.length > 0
  if (currentStep.value === 2) return form.location.trim().length >= 2
  // Payment info step is optional for freelancers
  if (isFreelancer.value && currentStep.value === paymentStepIndex.value) return true
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
  if (currentStep.value < reviewStepIndex.value) {
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
    const payload: any = {
      user_id: user.user?.user_id,
      bio: form.bio,
      skills: form.skills,
      location: form.location,
      latitude: form.latitude,
      longitude: form.longitude
    }

    // Include bank info for freelancers
    if (isFreelancer.value) {
      payload.bank_name = form.bank_name || null
      payload.bank_account_no = form.bank_account_no || null
      payload.bank_account_holder = form.bank_account_holder || null
    }

    await $fetch('/api/user/complete-profile', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: payload
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
