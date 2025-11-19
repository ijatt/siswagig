<template>
  <UContainer class="max-w-6xl mx-auto py-12 px-4">
    <!-- Feedback banners -->
    <div
      v-if="successMessage"
      class="mb-4 px-4 py-3 rounded-md bg-green-50 text-green-800"
    >
      {{ successMessage }}
    </div>
    <div
      v-if="errorMessage"
      class="mb-4 px-4 py-3 rounded-md bg-red-50 text-red-800"
    >
      {{ errorMessage }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left / Main column -->
      <div class="lg:col-span-2">
        <UCard class="p-6 rounded-xl shadow-md border border-gray-100">
          <div class="flex items-start gap-4">
            <UAvatar
              :src="application?.user?.image_url || 'https://i.pravatar.cc/150?img=32'"
              size="lg"
              class="ring ring-white ring-offset-2"
            />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-2xl font-semibold text-gray-900">
                    {{ application?.user?.name }}
                  </h1>
                  <p class="text-sm text-gray-500">
                    {{ application?.user?.location || "Somewhere on Earth" }} ·
                    {{
                      application?.user?.bio
                        ? application.user.bio.slice(0, 80) +
                          (application.user.bio.length > 80 ? "…" : "")
                        : ""
                    }}
                  </p>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-500">Applied</div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ useDateFormat(application?.created_at, "DD MMM YYYY") }}
                  </div>
                </div>
              </div>

              <div class="mt-4 flex items-center gap-3">
                <div class="flex items-center gap-1 text-yellow-500">
                  <UIcon name="i-heroicons-star" />
                  <span class="text-sm font-medium">4.8</span>
                  <span class="text-sm text-gray-500">(120)</span>
                </div>
                <div class="text-sm text-gray-500">· Member since 2023</div>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <h2 class="text-lg font-semibold text-gray-800">Proposal</h2>
            <p class="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">
              {{ application?.cover_letter }}
            </p>
          </div>

          <div class="mt-6 flex flex-wrap gap-2">
            <UBadge
              v-for="(t, i) in application?.user?.userSkills.map(us => us.skill.name)"
              :key="i"
              variant="soft"
              >{{ t }}</UBadge
            >
          </div>
        </UCard>

        <UCard class="mt-6 p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-medium text-gray-900">
            Work history & Qualifications
          </h3>
          <p class="mt-3 text-sm text-gray-600">
            This section can show the freelancer's past gigs, completed jobs,
            and credentials. It's a good place to display a quick portfolio
            summary.
          </p>
        </UCard>
      </div>
      <aside class="space-y-4">
        <UCard class="p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-500">Budget</div>
              <div class="text-2xl font-semibold text-gray-900">
                RM{{ application?.job?.budget }}
              </div>
            </div>
            <UBadge :color="getStatusColor" variant="soft">{{
              application?.status
            }}</UBadge>
          </div>

          <div v-if="application?.status === 'Pending'" class="mt-4 flex flex-col gap-2">
            <div class="flex flex-row w-full gap-2">
              <UModal :title="confirmTitle" v-model:open="showConfirm">
                <UButton
                  class="w-1/2"
                  color="primary"
                  icon="i-heroicons-check-circle"
                  :loading="loadingAccept"
                  @click="onAccept"
                  >Hire</UButton
                >
                <template #body>
                  <p class="text-gray-700">{{ confirmMessage }}</p>
                  <div class="flex justify-end gap-2">
                    <UButton
                      color="neutral"
                      variant="soft"
                      @click="showConfirm = false"
                      >Cancel</UButton
                    >
                    <UButton
                      :color="confirmColor"
                      @click="performConfirm"
                      :loading="confirmLoading"
                      >Yes</UButton
                    >
                  </div>
                </template>
              </UModal>
              <UModal :title="confirmTitle">
                <UButton
                  class="w-1/2"
                  icon="i-heroicons-exclamation-circle"
                  color="error"
                  variant="subtle"
                  :loading="loadingReject"
                  @click="onReject"
                  >Decline</UButton
                >
                <template #body>
                  <p class="text-gray-700">{{ confirmMessage }}</p>
                  <div class="flex justify-end gap-2">
                    <UButton
                      color="neutral"
                      variant="soft"
                      @click="showConfirm = false"
                      >Cancel</UButton
                    >
                    <UButton
                      :color="confirmColor"
                      @click="performConfirm"
                      :loading="confirmLoading"
                      >Yes</UButton
                    >
                  </div>
                </template>
              </UModal>
            </div>
            <UButton color="neutral" icon="i-heroicons-chat-bubble-oval-left" variant="soft">Message</UButton>
          </div>
        </UCard>

        <UCard class="p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="text-sm text-gray-600">Delivery</div>
          <div class="text-sm text-gray-900">
            {{
              application?.job?.deadline
                ? useDateFormat(application.job.deadline, "DD MMM YYYY")
                : "—"
            }}
          </div>
        </UCard>

        <UCard class="p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="text-sm text-gray-600">Location</div>
          <div class="text-sm text-gray-900">
            {{ application?.job?.location || "Remote" }}
          </div>
        </UCard>
      </aside>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
import type { Application } from "~/types/types";

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

const getStatusColor = computed<
  "warning" | "info" | "primary" | "error" | "neutral"
>(() => {
  const s = application.value?.status;
  switch (s) {
    case "Pending":
      return "warning";
    case "Interview":
      return "info";
    case "Hired":
      return "primary";
    case "Rejected":
      return "error";
    default:
      return "neutral";
  }
});

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
  } catch (err) {
    errorMessage.value = "Unable to update application. Please try again.";
    successMessage.value = null;
  } finally {
    confirmLoading.value = false;
  }
}
</script>
