<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "#imports";
import { error } from "#build/ui";

interface JobCreate {
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  deadline: Date;
  image_url: string;
  user_id: number;
}

const payload = reactive<JobCreate>({
  title: "",
  description: "",
  category: "",
  location: "",
  budget: 0.0,
  deadline: new Date(),
  image_url: "",
  user_id: userStore().user?.user_id as number,
});

const toast = useToast();


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
];

const imgUrl = ref(""); // URL for preview
const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(); // File object

const selectFile = () => {
  fileInput.value?.click();
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
    imgUrl.value = URL.createObjectURL(file.value); // generate preview URL
  }
};


async function createJob() {
  try {
    if (imgUrl.value && file.value) {
      payload.image_url = await uploadImage(file.value, "images")
    }

    const job = await $fetch("/api/jobs/create", {
      method: "POST",
      body: payload
    }).catch((error) => {
      toast.add({
        title: error.message,
        color: "error"
      })
    })

    toast.add({
      title: "Job created successfully!",
      color: "success"
    })
    navigateTo("/explore")
  } catch (error) {
    console.error(error);
  }
  
}
</script>

<template>
  <UContainer class="max-w-4xl mx-auto py-10">
    <UCard class="space-y">
      <template #header>
        <h1 class="text-2xl font-semibold">Create a Job</h1>
        <p>Post a new freelance job for students to apply.</p>
      </template>

      <UForm  class="space-y-5">
        <div class="w-full flex items-center">
          <UTooltip text="Click to change the image.">
            <img
            v-if="imgUrl.length"
            :src="imgUrl"
            class="w-40 h-40 mx-auto rounded-md hover:scale-105 transform ease-in-out duration-300 cursor-pointer"
            alt=""
            @click="fileInput?.click()"
          />
          <Icon
            v-else
            name="ri-image-add-fill"
            class="cursor-pointer mx-auto h-24 w-24 hover:scale-105 transform ease-in-out duration-300"
            @click="fileInput?.click()"
          />
          </UTooltip>
          
          <input
            type="file"
            ref="fileInput"
            @change="onFileChange"
            hidden
            accept="image/*"
          />
        </div>
        <div class="flex w-full items-center gap-x-4">
          <UFormField label="Job Title" required class="w-full">
            <UInput
              type="text"
              placeholder="Enter the job title"
              class="w-full"
              v-model="payload.title"
            />
          </UFormField>
          <UFormField label="Job Location" required class="w-full">
            <UInput
              type="text"
              placeholder="Enter the project location"
              class="w-full"
              v-model="payload.location"
            />
          </UFormField>
        </div>
        <UFormField label="Job Description" required>
          <UTextarea
            placeholder="Briefly describe why you’re the right fit for this job..."
            :rows="5"
            class="w-full"
            v-model="payload.description"
          />
        </UFormField>
        <div class="flex w-full justify-between items-center gap-x-4">
          <UFormField
            label="Proposed Budget (RM)"
            name="price"
            required
            class="w-full"
          >
            <UInput
              type="number"
              placeholder="Enter your proposed price"
              class="w-full"
              v-model="payload.budget"
            />
          </UFormField>
          <UFormField label="Categories" name="price" required class="w-full">
            <USelectMenu
              v-model="payload.category"
              :items="categories"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="flex w-full justify-between items-center gap-x-4">
          <UFormField label="Deadline" name="price" required class="w-full">
            <UInput type="date" placeholder="Enter deadline" class="w-full" />
          </UFormField>
          <UFormField
            label="Required Skills"
            name="price"
            required
            class="w-full"
          >
            <USelectMenu
              v-model="catValue"
              :items="skillOptions"
              multiple
              class="w-full flex-1"
            />
          </UFormField>
        </div>
        <div class="flex justify-end">
          <UButton color="primary" size="lg" @click="createJob">
            <template #leading>
              <UIcon name="i-heroicons-plus-circle" />
            </template>
            Create Job
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>
