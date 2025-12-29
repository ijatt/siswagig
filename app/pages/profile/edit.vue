<template>
  <div class="min-h-screen bg-gray-50/50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between py-4">
          <div class="flex items-center gap-4">
            <button 
              @click="$router.back()"
              class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all"
            >
              <UIcon name="i-lucide-arrow-left" class="w-5 h-5" />
            </button>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Edit Profile</h1>
              <p class="text-sm text-gray-500">Update your personal information</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="navigateTo('/profile')"
              class="px-4 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button 
              @click="onSave"
              :disabled="saving"
              class="btn-gradient px-5 py-2.5 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <UIcon v-if="saving" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
              <UIcon v-else name="i-lucide-check" class="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Messages -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <Transition name="fade">
        <div v-if="successMessage" class="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-600" />
          </div>
          <span class="flex-1">{{ successMessage }}</span>
          <button @click="successMessage = null" class="text-emerald-500 hover:text-emerald-700">
            <UIcon name="i-lucide-x" class="w-4 h-4" />
          </button>
        </div>
      </Transition>
      <Transition name="fade">
        <div v-if="errorMessage" class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-600" />
          </div>
          <span class="flex-1">{{ errorMessage }}</span>
          <button @click="errorMessage = null" class="text-red-500 hover:text-red-700">
            <UIcon name="i-lucide-x" class="w-4 h-4" />
          </button>
        </div>
      </Transition>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid lg:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-2">
            <button
              v-for="section in sections"
              :key="section.key"
              @click="activeSection = section.key"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                activeSection === section.key 
                  ? 'bg-purple-50 text-purple-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              ]"
            >
              <div 
                :class="[
                  'w-9 h-9 rounded-lg flex items-center justify-center',
                  activeSection === section.key ? 'bg-purple-100' : 'bg-gray-100'
                ]"
              >
                <UIcon :name="section.icon" class="w-5 h-5" />
              </div>
              <span class="text-sm">{{ section.label }}</span>
            </button>
          </div>
        </div>

        <!-- Form Content -->
        <div class="lg:col-span-3 space-y-6">
          <!-- Profile Photo Section -->
          <div 
            v-show="activeSection === 'photo'"
            class="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-gray-100">
              <h2 class="font-semibold text-gray-900">Profile Photo</h2>
              <p class="text-sm text-gray-500">Upload a professional photo to make a great impression</p>
            </div>
            <div class="p-6">
              <div class="flex flex-col sm:flex-row items-center gap-6">
                <!-- Current Photo -->
                <div class="relative group">
                  <div class="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 p-1 overflow-hidden">
                    <img 
                      :src="form.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&size=150&background=667eea&color=fff`"
                      :alt="form.name"
                      class="w-full h-full rounded-xl object-cover"
                    />
                  </div>
                  <button 
                    @click="fileInput?.click()"
                    class="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <UIcon name="i-lucide-camera" class="w-8 h-8 text-white" />
                  </button>
                  <input
                    type="file"
                    ref="fileInput"
                    @change="onFileChange"
                    hidden
                    accept="image/*"
                  />
                </div>

                <!-- Upload Instructions -->
                <div class="flex-1 text-center sm:text-left">
                  <h3 class="font-medium text-gray-900 mb-2">Upload new photo</h3>
                  <p class="text-sm text-gray-500 mb-4">
                    Recommended: Square image, at least 200x200 pixels.<br/>
                    Accepted formats: JPG, PNG, GIF
                  </p>
                  <div class="flex flex-wrap gap-3">
                    <button 
                      @click="fileInput?.click()"
                      class="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-medium text-sm hover:bg-purple-100 transition-all"
                    >
                      <UIcon name="i-lucide-upload" class="w-4 h-4 inline mr-2" />
                      Upload Photo
                    </button>
                    <button 
                      v-if="form.image_url"
                      @click="form.image_url = ''"
                      class="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-medium text-sm hover:bg-gray-200 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Basic Info Section -->
          <div 
            v-show="activeSection === 'basic'"
            class="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-gray-100">
              <h2 class="font-semibold text-gray-900">Basic Information</h2>
              <p class="text-sm text-gray-500">Your name and personal details</p>
            </div>
            <div class="p-6 space-y-5">
              <!-- Full Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <UIcon name="i-lucide-user" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    v-model="form.name"
                    type="text"
                    placeholder="Enter your full name"
                    class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                  />
                </div>
                <p class="text-xs text-gray-400 mt-1.5">This is how you'll appear across the platform</p>
              </div>

              <!-- Bio -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea 
                  v-model="form.bio"
                  rows="4"
                  placeholder="Tell others about yourself, your experience, and what makes you unique..."
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
                ></textarea>
                <div class="flex items-center justify-between mt-1.5">
                  <p class="text-xs text-gray-400">Write a compelling bio to attract clients</p>
                  <span :class="['text-xs', (form.bio?.length || 0) > 500 ? 'text-amber-500' : 'text-gray-400']">
                    {{ form.bio?.length || 0 }}/500
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Location Section -->
          <div 
            v-show="activeSection === 'location'"
            class="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-gray-100">
              <h2 class="font-semibold text-gray-900">Location</h2>
              <p class="text-sm text-gray-500">Set your location for local job matching</p>
            </div>
            <div class="p-6 space-y-5">
              <!-- Location Text -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  City / Region
                </label>
                <div class="relative">
                  <UIcon name="i-lucide-map-pin" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    v-model="form.location"
                    type="text"
                    placeholder="e.g., Shah Alam, Selangor"
                    class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                  />
                </div>
              </div>

              <!-- Geolocation Picker -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Precise Location (Optional)
                </label>
                <p class="text-sm text-gray-500 mb-3">
                  Enable location services to help find jobs near you
                </p>
                <LocationPicker />
              </div>
            </div>
          </div>

          <!-- Skills Section -->
          <div 
            v-show="activeSection === 'skills'"
            class="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-gray-100">
              <h2 class="font-semibold text-gray-900">Skills & Expertise</h2>
              <p class="text-sm text-gray-500">Add skills to help clients find you</p>
            </div>
            <div class="p-6 space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Your Skills
                </label>
                <USelectMenu
                  v-model="form.skills"
                  :items="availableSkills"
                  multiple
                  searchable
                  placeholder="Search and select skills..."
                  value-attribute="skill_id"
                  option-attribute="name"
                  :loading="loadingSkills"
                  class="w-full"
                />
                <p class="text-xs text-gray-400 mt-2">
                  Select skills that best represent your expertise
                </p>
              </div>

              <!-- Selected Skills Preview -->
              <div v-if="form.skills?.length">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Selected Skills ({{ form.skills.length }})
                </label>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="skillId in form.skills" 
                    :key="skillId"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium"
                  >
                    {{ getSkillName(skillId) }}
                    <button 
                      @click="removeSkill(skillId)"
                      class="w-4 h-4 rounded-full bg-purple-200 hover:bg-purple-300 flex items-center justify-center transition-colors"
                    >
                      <UIcon name="i-lucide-x" class="w-3 h-3" />
                    </button>
                  </span>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <UIcon name="i-lucide-sparkles" class="w-6 h-6 text-gray-400" />
                </div>
                <p class="text-gray-500 text-sm">No skills selected yet</p>
                <p class="text-gray-400 text-xs mt-1">Add skills to showcase your expertise</p>
              </div>
            </div>
          </div>

          <!-- Account Section -->
          <div 
            v-show="activeSection === 'account'"
            class="space-y-6"
          >
            <!-- Email Card -->
            <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <h2 class="font-semibold text-gray-900">Email Address</h2>
                <p class="text-sm text-gray-500">Your email is used for login and notifications</p>
              </div>
              <div class="p-6">
                <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <div class="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <UIcon name="i-lucide-mail" class="w-5 h-5 text-gray-600" />
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{{ userStore().user?.email || 'Not set' }}</p>
                    <p class="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            <!-- Password Card -->
            <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <h2 class="font-semibold text-gray-900">Password & Security</h2>
                <p class="text-sm text-gray-500">Manage your password and security settings</p>
              </div>
              <div class="p-6">
                <div class="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                      <UIcon name="i-lucide-lock" class="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">Password</p>
                      <p class="text-xs text-gray-500">Last changed: Unknown</p>
                    </div>
                  </div>
                  <button class="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-all">
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="bg-white rounded-2xl border border-red-100 overflow-hidden">
              <div class="px-6 py-4 border-b border-red-100 bg-red-50/50">
                <h2 class="font-semibold text-red-700">Danger Zone</h2>
                <p class="text-sm text-red-600/70">Irreversible actions for your account</p>
              </div>
              <div class="p-6 space-y-4">
                <div class="flex items-center justify-between p-4 rounded-xl border border-red-100">
                  <div>
                    <p class="font-medium text-gray-900">Deactivate Account</p>
                    <p class="text-xs text-gray-500">Temporarily disable your account</p>
                  </div>
                  <button class="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-all">
                    Deactivate
                  </button>
                </div>
                <div class="flex items-center justify-between p-4 rounded-xl border border-red-100">
                  <div>
                    <p class="font-medium text-gray-900">Delete Account</p>
                    <p class="text-xs text-gray-500">Permanently delete your account and data</p>
                  </div>
                  <button class="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile Save Button -->
          <div class="lg:hidden flex gap-3 pt-4">
            <button 
              @click="navigateTo('/profile')"
              class="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button 
              @click="onSave"
              :disabled="saving"
              class="flex-1 btn-gradient px-4 py-3 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2"
            >
              <UIcon v-if="saving" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { User } from '~/types/types'

definePageMeta({
  middleware: "auth",
});

const navigate = useRouter()
const form = ref<any>({ skills: [] })
const activeSection = ref('photo')

// Sections configuration
const sections = [
  { key: 'photo', label: 'Profile Photo', icon: 'i-lucide-camera' },
  { key: 'basic', label: 'Basic Info', icon: 'i-lucide-user' },
  { key: 'location', label: 'Location', icon: 'i-lucide-map-pin' },
  { key: 'skills', label: 'Skills', icon: 'i-lucide-sparkles' },
  { key: 'account', label: 'Account', icon: 'i-lucide-settings' },
]

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

// Get skill name by ID
const getSkillName = (skillId: number) => {
  const skill = availableSkills.value.find(s => s.skill_id === skillId)
  return skill?.label || skill?.name || 'Unknown'
}

// Remove skill
const removeSkill = (skillId: number) => {
  form.value.skills = form.value.skills.filter((id: number) => id !== skillId)
}

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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
