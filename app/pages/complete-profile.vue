<template>
  <div class="p-4">
    <UContainer class="max-w-2xl mx-auto py-10">
      <UCard class="p-6 space-y-6">
        <template #header>
          <div class="flex flex-col items-center text-center">
            <Icon
              name="i-lucide-user-check"
              class="w-10 h-10 text-primary mb-2"
            />
            <h2 class="text-2xl font-semibold">Complete Your Profile</h2>
            <p class="text-sm text-gray-500">
              Just a few more steps to personalize your experience on SiswaGig
            </p>
          </div>

          <div class="flex justify-center mt-4">
            <StepBreadcrumbs
              :items="crumbs"
              v-model="currentStep"
              @click="onBreadcrumbClick"
            />
          </div>
        </template>

        <!-- Steps -->
        <div v-show="currentStep === 0" class="space-y-4">
          <div class="mx-auto flex justify-center">
            <UTextarea></UTextarea>
          </div>
          <div class="flex justify-between">
            <UButton variant="ghost" @click="prevStep">Back</UButton>
            <UButton color="primary" @click="nextStep">Next</UButton>
          </div>
        </div>

        <div v-show="currentStep === 1" class="space-y-4">
          <!-- Skills Step -->
          <div v-show="currentStep === 1" class="space-y-4">
            <h3 class="text-lg font-semibold">Skills</h3>

            <!-- Selected skills as badges -->
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="(skill, i) in form.skills"
                :key="i"
                color="primary"
                class="cursor-pointer"
                @click="removeSkill(i)"
              >
                {{ skill }}
                <Icon name="i-lucide-x" class="ml-1 w-3 h-3" />
              </UBadge>
              <span
                v-if="form.skills.length === 0"
                class="text-gray-400 text-sm"
                >No skills added yet</span
              >
            </div>

            <!-- Select existing skills -->
            <USelectMenu
              v-model="selectedSkill"
              :options="availableSkills"
              placeholder="Select skills"
              multiple
              searchable
              @update:modelValue="addSkills"
            />

            <!-- Add new skill manually -->
            <div class="flex items-center gap-2">
              <UInput
                v-model="newSkill"
                placeholder="Add a custom skill..."
                @keyup.enter="addCustomSkill"
              />
              <UButton color="primary" @click="addCustomSkill">Add</UButton>
            </div>

            <div class="flex justify-between mt-6">
              <UButton variant="ghost" @click="prevStep">Back</UButton>
              <UButton color="primary" @click="nextStep">Next</UButton>
            </div>
          </div>
        </div>

        <div v-show="currentStep === 2" class="space-y-4">
          <h3 class="text-lg font-semibold">Location</h3>
          <UInput v-model="form.location" placeholder="e.g., UiTM Shah Alam" />
          <div class="flex justify-between">
            <UButton variant="ghost" @click="prevStep">Back</UButton>
            <UButton color="primary" @click="nextStep">Next</UButton>
          </div>
        </div>

        <div v-show="currentStep === 3" class="text-center">
          <h3 class="text-lg font-semibold">Finish</h3>
          <p class="text-gray-500">Review your details and save.</p>

          <div class="mt-4 space-y-2 text-left">
            <p><strong>Bio:</strong> {{ form.bio || "-" }}</p>
            <p><strong>Skill:</strong> {{ form.skill?.label || "-" }}</p>
            <p><strong>Location:</strong> {{ form.location || "-" }}</p>
          </div>

          <div class="flex justify-between mt-6">
            <UButton variant="ghost" @click="prevStep">Back</UButton>
            <UButton color="primary" @click="">Finish</UButton>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const user = userStore();
const router = useRouter();

const crumbs = [
  { label: "Bio" },
  { label: "Skills" },
  { label: "Location" },
  { label: "Finish" },
];

const currentStep = ref(0);

const form = reactive({ 
  bio: "",
  skills: null as null | { label: string; value: string },
  location: "",
});

const availableSkills = ref([
  'Web Development',
  'Graphic Design',
  'Writing',
  'Marketing',
  'UI/UX Design',
  'Data Analysis',
  'Photography'
])

const selectedSkill = ref<string[]>([])
const newSkill = ref('')

form.skills = [] as string[]

function addSkills(skills: string[]) {
  for (const s of skills) {
    if (!form.skills.includes(s)) {
      form.skills.push(s)
    }
  }
  selectedSkill.value = []
}

function addCustomSkill() {
  const skill = newSkill.value.trim()
  if (skill && !form.skills.includes(skill)) {
    form.skills.push(skill)
  }
  newSkill.value = ''
}

function removeSkill(index: number) {
  form.skills.splice(index, 1)
}


// basic validation per-step
function validateStep(step: number) {
  if (step === 0) return form.bio.length >= 10;
  if (step === 1) return !!form.skill;
  if (step === 2) return form.location.length >= 3;
  return true;
}

function nextStep() {
  // if (!validateStep(currentStep.value)) {
  //   // show a toast or inline error (simple alert here)
  //   alert('Please complete this step before proceeding.')
  //   return
  // }
  if (currentStep.value < crumbs.length - 1) currentStep.value++;
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--;
}

// when user clicks breadcrumb directly
function onBreadcrumbClick(index: number) {
  // allow clicking backward anytime
  if (index < currentStep.value) {
    currentStep.value = index;
    return;
  }

  // allow jumping forward only if all intermediate steps valid
  for (let i = 0; i < index; i++) {
    if (!validateStep(i)) {
      alert("Please finish previous steps first.");
      return;
    }
  }
  currentStep.value = index;
}

// final submission
// async function submitProfile() {
//   // validate all steps
//   for (let i = 0; i < crumbs.length - 1; i++) {
//     if (!validateStep(i)) {
//       alert('Please complete all steps before finishing.')
//       currentStep.value = i
//       return
//     }
//   }

//   try {
//     await $fetch('/api/user/complete-profile', {
//       method: 'POST',
//       body: {
//         bio: form.bio,
//         skill: form.skill,
//         location: form.location
//       }
//     })

//     // update store locally (merge)
//     user.setUser({
//       ...user.user,
//       bio: form.bio,
//       skill_id: form.skill?.value ?? null,
//       location: form.location,
//       profile_complete: true
//     } as any)

//     await router.push('/explore')
//   } catch (err) {
//     console.error(err)
//     alert('Failed to save profile.')
//   }
// }
</script>

<style scoped>
/* small responsive tweaks if you want */
</style>
