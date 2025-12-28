<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "#imports";

definePageMeta({
  middleware: "auth",
});

interface JobCreate {
  title: string;
  description: string;
  category: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  budget: number;
  deadline: Date;
  image_url: string;
  user_id: number;
  requiredSkills: string;
}

const payload = reactive<JobCreate>({
  title: "",
  description: "",
  category: "",
  location: "",
  latitude: null,
  longitude: null,
  budget: 0.0,
  deadline: new Date(),
  image_url: "",
  user_id: 0,
  requiredSkills: ""
});

onMounted(() => {
  payload.user_id = userStore().user?.user_id as number;
});

const toast = useToast();
const isSubmitting = ref(false);

// Location Picker State
const activeLocationTab = ref<'detect' | 'manual'>('detect');
const isDetecting = ref(false);
const geoError = ref<string | null>(null);
const geoLocation = ref<{ latitude: number; longitude: number } | null>(null);
const locationDetected = ref(false);

const manualLatitude = ref<number | null>(null);
const manualLongitude = ref<number | null>(null);

const isManualValid = computed(() => {
  return (
    payload.location.trim() &&
    manualLatitude.value !== null &&
    manualLongitude.value !== null &&
    manualLatitude.value >= -90 &&
    manualLatitude.value <= 90 &&
    manualLongitude.value >= -180 &&
    manualLongitude.value <= 180
  );
});

const detectLocation = () => {
  geoError.value = null;
  isDetecting.value = true;

  if (!navigator.geolocation) {
    geoError.value = 'Geolocation is not supported by your browser';
    isDetecting.value = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      geoLocation.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      payload.latitude = position.coords.latitude;
      payload.longitude = position.coords.longitude;
      isDetecting.value = false;
      locationDetected.value = true;
    },
    error => {
      const errorMessages: Record<number, string> = {
        1: 'Permission denied. Please enable location access.',
        2: 'Location information is unavailable.',
        3: 'The request to get user location timed out.'
      };
      geoError.value = errorMessages[error.code] || 'Failed to detect location';
      isDetecting.value = false;
    }
  );
};

const applyManualLocation = () => {
  if (isManualValid.value) {
    payload.latitude = manualLatitude.value;
    payload.longitude = manualLongitude.value;
    locationDetected.value = true;
    toast.add({ title: 'Location coordinates applied!', color: 'success' });
  }
};

const categories = [
  "Web Development",
  "Graphic Design",
  "Mobile App",
  "Writing",
  "Video Editing",
  "Marketing",
];

const catValue = ref(["Web Development"]);

const skillOptions = [
  "HTML",
  "CSS",
  "JavaScript",
  "Vue.js",
  "React",
  "Node.js",
  "Python",
  "Figma",
  "Photoshop",
  "Illustrator",
];

const imgUrl = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>();

const selectFile = () => {
  fileInput.value?.click();
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
    imgUrl.value = URL.createObjectURL(file.value);
  }
};

const removeImage = () => {
  file.value = null;
  imgUrl.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

async function createJob() {
  isSubmitting.value = true;
  try {
    if (imgUrl.value && file.value) {
      payload.image_url = await uploadImage(file.value, "images");
    }

    // Format required skills as "Node.js/Vue.js/HTML"
    payload.requiredSkills = catValue.value.join("/");

    await $fetch("/api/jobs/create", {
      method: "POST",
      body: payload,
    });

    toast.add({
      title: "Job created successfully!",
      color: "success",
    });
    navigateTo("/explore");
  } catch (error: any) {
    toast.add({
      title: error?.message || "Failed to create job",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-purple-50 via-white to-blue-50 pattern-dots">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <!-- Header with animated icon -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-lg mb-4 animate-float">
            <UIcon name="i-lucide-plus-circle" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-4xl font-bold text-gradient mb-3">Create a Job</h1>
          <p class="text-gray-600 text-lg max-w-xl mx-auto">
            Post a freelance opportunity and connect with talented UiTM students.
          </p>
        </div>

        <!-- Progress Steps -->
        <div class="card-modern p-4 mb-8">
          <div class="flex items-center justify-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm font-bold">1</div>
              <span class="text-sm font-medium text-gray-700 hidden sm:inline">Basic Info</span>
            </div>
            <div class="w-12 h-0.5 bg-gray-200"></div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">2</div>
              <span class="text-sm font-medium text-gray-400 hidden sm:inline">Details</span>
            </div>
            <div class="w-12 h-0.5 bg-gray-200"></div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
              <span class="text-sm font-medium text-gray-400 hidden sm:inline">Review</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-6 py-8">
      <div class="card-modern p-8">
        <form @submit.prevent="createJob" class="space-y-8">
          <!-- Image Upload Section -->
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                <UIcon name="i-lucide-image" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="font-bold text-gray-900">Cover Image</h3>
                <p class="text-sm text-gray-500">Add a visual to attract more applicants</p>
              </div>
            </div>
            
            <div class="flex justify-center">
              <div 
                v-if="imgUrl.length"
                class="relative group"
              >
                <img
                  :src="imgUrl"
                  class="w-full max-w-md h-48 object-cover rounded-2xl ring-4 ring-purple-100 group-hover:ring-purple-300 transition-all cursor-pointer"
                  alt="Job cover"
                  @click="selectFile"
                />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3">
                  <button 
                    type="button"
                    @click="selectFile"
                    class="p-2 bg-white rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <UIcon name="i-lucide-edit-2" class="w-5 h-5 text-gray-700" />
                  </button>
                  <button 
                    type="button"
                    @click="removeImage"
                    class="p-2 bg-white rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <UIcon name="i-lucide-trash-2" class="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
              <div 
                v-else
                @click="selectFile"
                class="w-full max-w-md h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
              >
                <div class="w-16 h-16 rounded-2xl bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center mb-3 transition-colors">
                  <UIcon name="i-lucide-upload-cloud" class="w-8 h-8 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
                <p class="text-gray-600 font-medium">Click to upload image</p>
                <p class="text-sm text-gray-400">PNG, JPG up to 5MB</p>
              </div>
            </div>
            <input
              type="file"
              ref="fileInput"
              @change="onFileChange"
              hidden
              accept="image/*"
            />
          </div>

          <!-- Basic Info Section -->
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <UIcon name="i-lucide-file-text" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="font-bold text-gray-900">Basic Information</h3>
                <p class="text-sm text-gray-500">Tell us about the job</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Job Title <span class="text-red-500">*</span></label>
              <div class="relative">
                <UIcon name="i-lucide-briefcase" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="payload.title"
                  type="text"
                  placeholder="e.g. Design a UiTM Event Poster"
                  class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-700"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Job Description <span class="text-red-500">*</span></label>
              <textarea
                v-model="payload.description"
                placeholder="Describe the job requirements, deliverables, and any specific details..."
                rows="5"
                class="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-700 resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Location Section -->
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="font-bold text-gray-900">Job Location</h3>
                <p class="text-sm text-gray-500">Set the location for this job</p>
              </div>
            </div>

            <!-- Location Tabs -->
            <div class="flex gap-2 border-b border-gray-200 pb-2">
              <button
                type="button"
                :class="['flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all', activeLocationTab === 'detect' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100']"
                @click="activeLocationTab = 'detect'"
              >
                <UIcon name="i-lucide-locate" class="w-4 h-4" />
                Detect Location
              </button>
              <button
                type="button"
                :class="['flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all', activeLocationTab === 'manual' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100']"
                @click="activeLocationTab = 'manual'"
              >
                <UIcon name="i-lucide-edit-3" class="w-4 h-4" />
                Manual Entry
              </button>
            </div>

            <!-- Detect Location Tab -->
            <div v-if="activeLocationTab === 'detect'" class="space-y-4">
              <button
                v-if="!geoLocation"
                type="button"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                @click="detectLocation"
                :disabled="isDetecting"
              >
                <UIcon v-if="isDetecting" name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
                <UIcon v-else name="i-lucide-locate" class="w-5 h-5" />
                {{ isDetecting ? 'Detecting...' : 'Detect My Location' }}
              </button>

              <div v-if="geoLocation" class="p-4 rounded-xl bg-green-50 border border-green-200">
                <div class="flex items-center gap-3 mb-3">
                  <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-green-500" />
                  <div>
                    <p class="font-medium text-green-700">Location Detected</p>
                    <p class="text-sm text-green-600">Lat: {{ geoLocation.latitude.toFixed(6) }}, Lon: {{ geoLocation.longitude.toFixed(6) }}</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Location Name <span class="text-red-500">*</span></label>
                  <input
                    v-model="payload.location"
                    type="text"
                    placeholder="e.g. UiTM Shah Alam, Selangor"
                    class="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-700"
                  />
                </div>
              </div>

              <div v-if="geoError" class="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-500" />
                <span class="text-red-700 text-sm">{{ geoError }}</span>
              </div>
            </div>

            <!-- Manual Entry Tab -->
            <div v-if="activeLocationTab === 'manual'" class="space-y-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Location Name <span class="text-red-500">*</span></label>
                <div class="relative">
                  <UIcon name="i-lucide-map-pin" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    v-model="payload.location"
                    type="text"
                    placeholder="e.g. UiTM Shah Alam, Selangor"
                    class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-700"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    v-model.number="manualLatitude"
                    type="number"
                    step="0.000001"
                    min="-90"
                    max="90"
                    placeholder="e.g. 3.0738"
                    class="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-700"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    v-model.number="manualLongitude"
                    type="number"
                    step="0.000001"
                    min="-180"
                    max="180"
                    placeholder="e.g. 101.5183"
                    class="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-700"
                  />
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <UIcon name="i-lucide-info" class="w-4 h-4" />
                <span>Find coordinates at <a href="https://maps.google.com" target="_blank" class="text-purple-600 hover:underline">Google Maps</a></span>
              </div>
              <button
                type="button"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-purple-100 hover:text-purple-700 transition-all disabled:opacity-50"
                @click="applyManualLocation"
                :disabled="!isManualValid"
              >
                <UIcon name="i-lucide-check" class="w-5 h-5" />
                Apply Coordinates
              </button>
            </div>

            <!-- Location Status -->
            <div v-if="locationDetected && payload.location" class="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-3">
              <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-purple-500" />
              <div class="flex-1">
                <p class="font-medium text-purple-700">{{ payload.location }}</p>
                <p v-if="payload.latitude && payload.longitude" class="text-xs text-purple-500">{{ payload.latitude.toFixed(4) }}, {{ payload.longitude.toFixed(4) }}</p>
              </div>
              <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500" />
            </div>
          </div>

          <!-- Details Section -->
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <UIcon name="i-lucide-settings" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="font-bold text-gray-900">Job Details</h3>
                <p class="text-sm text-gray-500">Budget, category, and requirements</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Budget (RM) <span class="text-red-500">*</span></label>
                <div class="relative">
                  <UIcon name="i-lucide-wallet" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    v-model="payload.budget"
                    type="number"
                    placeholder="Enter your budget"
                    class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-700"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Category <span class="text-red-500">*</span></label>
                <USelectMenu
                  v-model="payload.category"
                  :items="categories"
                  placeholder="Select a category"
                  class="w-full"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Deadline <span class="text-red-500">*</span></label>
                <div class="relative">
                  <UIcon name="i-lucide-calendar" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    v-model="payload.deadline"
                    type="date"
                    class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-700"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Required Skills</label>
                <USelectMenu
                  v-model="catValue"
                  :items="skillOptions"
                  multiple
                  placeholder="Select required skills"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <!-- Submit Section -->
          <div class="pt-6 border-t border-gray-100">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p class="text-sm text-gray-500 flex items-center gap-2">
                <UIcon name="i-lucide-info" class="w-4 h-4" />
                Your job will be visible to all UiTM students
              </p>
              <div class="flex items-center gap-3">
                <NuxtLink 
                  to="/explore"
                  class="px-6 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </NuxtLink>
                <button 
                  type="submit"
                  :disabled="isSubmitting"
                  class="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UIcon v-if="isSubmitting" name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
                  <UIcon v-else name="i-lucide-rocket" class="w-5 h-5" />
                  {{ isSubmitting ? 'Creating...' : 'Create Job' }}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Tips Card -->
      <div class="mt-8 card-modern p-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-lightbulb" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="font-bold text-gray-900 mb-2">Tips for a Great Job Post</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-center gap-2">
                <UIcon name="i-lucide-check-circle-2" class="w-4 h-4 text-green-500 flex-shrink-0" />
                Be specific about deliverables and expectations
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-lucide-check-circle-2" class="w-4 h-4 text-green-500 flex-shrink-0" />
                Set a realistic budget that matches the scope
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-lucide-check-circle-2" class="w-4 h-4 text-green-500 flex-shrink-0" />
                Include an eye-catching cover image
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-lucide-check-circle-2" class="w-4 h-4 text-green-500 flex-shrink-0" />
                Specify the required skills clearly
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
