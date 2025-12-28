<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
    <UContainer class="max-w-4xl mx-auto py-12 px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 tracking-tight">Edit your profile</h1>
        <p class="text-gray-500 mt-2 text-lg">Make a great impression. Keep your profile fresh and complete.</p>
      </div>

      <!-- Feedback banners -->
      <div v-if="successMessage" class="mb-6 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
        <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
        <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5" />
        {{ errorMessage }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Avatar Section -->
        <div class="lg:col-span-1">
          <div class="sticky top-8 space-y-4">
            <div class="flex flex-col items-center">
              <div class="relative">
                <img :src="form.image_url || undefined" class="w-28 h-28 rounded-full ring-4 ring-white shadow-lg" />
                <div class="absolute bottom-0 right-0 bg-blue-600 rounded-full px-2 py-1 text-white shadow-lg hover:bg-blue-700 transition cursor-pointer">
                  <UIcon name="i-heroicons-camera" class="w-4 h-4" @click="fileInput?.click()" />
                  <input
                    type="file"
                    ref="fileInput"
                    @change="onFileChange"
                    hidden
                    accept="image/*"
                  />
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-3 text-center">Click camera to change</p>
            </div>
          </div>
        </div>

        <!-- Form Section -->
        <div class="lg:col-span-3">
          <div class="space-y-6">
            <!-- Basic Info Card -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Basic Information</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                  <UInput v-model="form.name" placeholder="Your full name" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <UInput v-model="form.location" placeholder="City, Country" class="w-full" />
                </div>
              </div>
            </div>

            <!-- Bio Card -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">About you</h2>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <UTextarea v-model="form.bio" placeholder="Tell clients about yourself, your experience and what makes you unique..." class="w-full" />
                <p class="text-xs text-gray-400 mt-2">{{ form.bio?.length || 0 }} characters</p>
              </div>
            </div>

            <!-- Location Card -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Location & Geolocation</h2>
              <LocationPicker />
            </div>

            <!-- Skills Card -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Skills</h2>
              <div class="space-y-4">
                <USelectMenu
                  v-model="form.skills"
                  :items="availableSkills"
                  multiple
                  searchable
                  placeholder="Select skills..."
                  value-attribute="skill_id"
                  option-attribute="name"
                  :loading="loadingSkills"
                />
                <p v-if="!form.skills.length" class="text-sm text-gray-400 italic">No skills added yet.</p>
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex gap-3">
              <UButton
                color="primary"
                size="lg"
                @click="onSave"
                :loading="saving"
                class="flex-1"
              >
                <UIcon name="i-heroicons-check" class="w-5 h-5" />
                Save Changes
              </UButton>
              <UButton
                color="neutral"
                variant="soft"
                size="lg"
                @click="navigateTo('/profile')"
              >
                Cancel
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { User } from '~/types/types'

const navigate = useRouter()
const form = ref<any>({ skills: [] })

const availableSkills = ref<any[]>([])
const loadingSkills = ref(false)
const saving = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(); // File object

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
    form.value.image_url = URL.createObjectURL(file.value); // generate preview URL
  }
};

async function loadSkills() {
  try {
    loadingSkills.value = true
    availableSkills.value = await $fetch('/api/skills')
  } catch (err) {
    errorMessage.value = 'Unable to load skills.'
  } finally {
    availableSkills.value = availableSkills.value.map(skill => ({ label: skill.name, skill_id: skill.skill_id }))
    loadingSkills.value = false
  }
}

async function loadUser() {
  try {
    const user = await $fetch('/api/user', {
        method: "GET",
        headers: {
            authorization: `Bearer ${useMyTokenStore().accessToken}`,
        }
    }).catch((e) => { throw e })
    const u = user as any
    form.value = {
      user_id: u.user_id,
      name: u.name || '',
      bio: u.bio || '',
      location: u.location || '',
      image_url: u.image_url || '',
      skills: u.userSkills ? (u.userSkills as any[]).map((s) => s.skill_id) : []
    }
  } catch (err) {
    errorMessage.value = 'Unable to load profile. Make sure you are signed in.'
  }
}

async function onSave() {
  if (!form.value.user_id) {
    errorMessage.value = 'User ID missing. Please sign in again.'
    return
  }

  saving.value = true
  successMessage.value = null
  errorMessage.value = null

  if (file.value) {
    try {
      form.value.image_url = await uploadImage(file.value, "images")
    } catch (err) {
      errorMessage.value = 'Unable to upload profile image. Please try again.'
      saving.value = false
      return
    }
  }

  try {
    await $fetch(`/api/user/${form.value.user_id}`, {
      method: 'PATCH',
      body: {
        name: form.value.name,
        bio: form.value.bio,
        location: form.value.location,
        image_url: form.value.image_url,
        skills: form.value.skills.map((s: any) => s.skill_id)
      }
    })
    successMessage.value = 'Profile saved successfully.'
  } catch (err) {
    errorMessage.value = 'Unable to save profile. Please try again.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSkills()
  loadUser()
})
</script>
