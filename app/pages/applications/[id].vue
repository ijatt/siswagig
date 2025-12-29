<template>
  <div class="min-h-screen bg-gradient-to-b from-violet-50/50 to-white">
    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="fixed top-20 right-4 z-50">
      <div class="card-modern p-4 bg-green-50 border-green-200 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-600" />
        </div>
        <p class="text-green-800 font-medium">{{ successMessage }}</p>
      </div>
    </div>
    <div v-if="errorMessage" class="fixed top-20 right-4 z-50">
      <div class="card-modern p-4 bg-red-50 border-red-200 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-600" />
        </div>
        <p class="text-red-800 font-medium">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Header -->
    <div class="bg-gradient-to-br from-violet-100 via-white to-blue-50 pattern-dots py-12">
      <UContainer class="max-w-5xl">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <UIcon name="i-lucide-file-check" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Application Details</h1>
            <p class="text-gray-500">Review and manage this application</p>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Main Content -->
    <UContainer class="max-w-5xl py-8">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left Column - Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Applicant Card -->
          <div class="card-modern p-6">
            <div class="flex items-start gap-4">
              <img
                :src="application?.user?.image_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'"
                alt="Applicant"
                class="w-20 h-20 rounded-2xl object-cover ring-4 ring-violet-100"
              />
              <div class="flex-1">
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 class="text-2xl font-bold text-gray-900">{{ application?.user?.name }}</h2>
                    <p class="text-gray-500 flex items-center gap-1 mt-1">
                      <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                      {{ application?.user?.location || "Location not set" }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-gray-400">Applied on</p>
                    <p class="font-semibold text-gray-700">{{ useDateFormat(application?.created_at, "DD MMM YYYY") }}</p>
                  </div>
                </div>

                <!-- Rating -->
                <div class="flex items-center gap-3 mt-4">
                  <div class="flex items-center gap-1">
                    <UIcon v-for="n in 5" :key="n" name="i-lucide-star" class="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <span class="text-sm font-medium text-gray-600">4.8</span>
                  <span class="text-sm text-gray-400">(120 reviews)</span>
                  <span class="text-gray-300">·</span>
                  <span class="text-sm text-gray-500">Member since 2023</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Proposal Card -->
          <div class="card-modern p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <UIcon name="i-lucide-file-text" class="w-5 h-5 text-white" />
              </div>
              <h2 class="text-lg font-bold text-gray-900">Cover Letter</h2>
            </div>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">
              {{ application?.cover_letter || "No cover letter provided." }}
            </p>
          </div>

          <!-- Skills Card -->
          <div class="card-modern p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <UIcon name="i-lucide-zap" class="w-5 h-5 text-white" />
              </div>
              <h2 class="text-lg font-bold text-gray-900">Skills</h2>
            </div>
            <div v-if="application?.user?.userSkills?.length" class="flex flex-wrap gap-2">
              <span
                v-for="(skill, i) in application?.user?.userSkills.map(us => us.skill.name)"
                :key="i"
                class="px-4 py-2 rounded-xl bg-violet-50 text-violet-700 text-sm font-medium border border-violet-100"
              >
                {{ skill }}
              </span>
            </div>
            <p v-else class="text-gray-500">No skills listed</p>
          </div>

          <!-- Work History Card -->
          <div class="card-modern p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                <UIcon name="i-lucide-briefcase" class="w-5 h-5 text-white" />
              </div>
              <h2 class="text-lg font-bold text-gray-900">Work History & Qualifications</h2>
            </div>
            <p class="text-gray-500">
              This section shows the freelancer's past gigs, completed jobs, and credentials.
            </p>
          </div>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="space-y-6">
          <!-- Budget & Status Card -->
          <div class="card-modern p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <p class="text-sm text-gray-400">Budget</p>
                <p class="text-3xl font-bold text-gradient">RM{{ application?.job?.budget }}</p>
              </div>
              <div :class="[
                'px-4 py-2 rounded-xl text-sm font-semibold',
                application?.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                application?.status === 'Interview' ? 'bg-blue-100 text-blue-700' :
                application?.status === 'Hired' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              ]">
                {{ application?.status }}
              </div>
            </div>

            <!-- Action Buttons -->
            <div v-if="application?.status === 'Pending'" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <UModal title="Confirm Hire" v-model:open="showConfirm">
                  <button
                    @click="onAccept"
                    :disabled="loadingAccept"
                    class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl btn-gradient text-white font-medium"
                  >
                    <UIcon name="i-lucide-check" class="w-5 h-5" />
                    Hire
                  </button>
                  <template #body>
                    <div class="p-6 space-y-4">
                      <p class="text-gray-600">{{ confirmMessage }}</p>
                      <div class="flex gap-3">
                        <button
                          @click="showConfirm = false"
                          class="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          @click="performConfirm"
                          :disabled="confirmLoading"
                          class="flex-1 px-4 py-3 rounded-xl btn-gradient text-white font-medium"
                        >
                          {{ confirmLoading ? 'Processing...' : 'Yes, Confirm' }}
                        </button>
                      </div>
                    </div>
                  </template>
                </UModal>

                <UModal title="Decline Application">
                  <button
                    @click="onReject"
                    :disabled="loadingReject"
                    class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                  >
                    <UIcon name="i-lucide-x" class="w-5 h-5" />
                    Decline
                  </button>
                  <template #body>
                    <div class="p-6 space-y-4">
                      <p class="text-gray-600">{{ confirmMessage }}</p>
                      <div class="flex gap-3">
                        <button
                          @click="showConfirm = false"
                          class="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          @click="performConfirm"
                          :disabled="confirmLoading"
                          class="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                        >
                          {{ confirmLoading ? 'Processing...' : 'Yes, Decline' }}
                        </button>
                      </div>
                    </div>
                  </template>
                </UModal>
              </div>
              
              <button class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                <UIcon name="i-lucide-message-circle" class="w-5 h-5" />
                Message Applicant
              </button>
            </div>
          </div>

          <!-- Job Details Card -->
          <div class="card-modern p-6">
            <h3 class="text-sm font-medium text-gray-400 mb-3">Job Details</h3>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                  <UIcon name="i-lucide-calendar" class="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-400">Deadline</p>
                  <p class="font-medium text-gray-700">
                    {{ application?.job?.deadline ? useDateFormat(application.job.deadline, "DD MMM YYYY") : "—" }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-400">Location</p>
                  <p class="font-medium text-gray-700">{{ application?.job?.location || "Remote" }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
import type { Application } from "~/types/types";

useSeoMeta({
  title: 'Application Details | SiswaGig',
  description: 'View detailed information about a specific job application, including applicant profile, cover letter, skills, and work history. Manage application status and communicate with applicants on SiswaGig.',
  ogTitle: 'Application Details | SiswaGig',
  ogDescription: 'Review and manage job applications from UiTM student freelancers on SiswaGig.'
});

const route = useRoute();
const id = route.params.id as string;

const { data } = useNuxtData(`application-${id}`);
const {
  data: a,
  error,
  refresh,
} = await useFetch(`/api/applications/${id}`, {
  key: `application-${id}`,
  default() {
    return data.value as Application;
  },
});

const application = ref<Application | null>(a.value as Application);

// UI state
const loadingAccept = ref(false);
const loadingReject = ref(false);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// Confirm dialog
const showConfirm = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const confirmAction = ref<"accept" | "reject" | null>(null);
const confirmColor = ref<"primary" | "error">("primary");
const confirmLoading = ref(false);

function onAccept() {
  confirmAction.value = "accept";
  confirmTitle.value = "Accept application";
  confirmMessage.value = "This will mark the applicant as Hired. Continue?";
  confirmColor.value = "primary";
  showConfirm.value = true;
}

function onReject() {
  confirmAction.value = "reject";
  confirmTitle.value = "Reject application";
  confirmMessage.value = "This will reject the application. Continue?";
  confirmColor.value = "error";
  showConfirm.value = true;
}

async function performConfirm() {
  if (!confirmAction.value || !application.value) return;
  confirmLoading.value = true;
  const status = confirmAction.value === "accept" ? "Hired" : "Rejected";
  try {
    const res = await $fetch(
      `/api/applications/${application.value.application_id}`,
      {
        method: "POST",
        body: { status },
      }
    );
    application.value = res as unknown as Application;
    successMessage.value = `Application ${status.toLowerCase()} successfully.`;
    errorMessage.value = null;
    showConfirm.value = false;
    
    // Auto-hide success message
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (err) {
    errorMessage.value = "Unable to update application. Please try again.";
    successMessage.value = null;
  } finally {
    confirmLoading.value = false;
  }
}
</script>
