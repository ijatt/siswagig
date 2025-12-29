<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md" v-if="currFormActive == 'login'">
      <UAuthForm
        title="Login"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        :fields="loginFields"
        @submit="login"
      >
      
      <template #description>
          Don't have an account? <ULink @click="currFormActive = 'signup'" class="text-primary font-medium">Sign up</ULink>.
      </template>
      </UAuthForm>
    </UPageCard>
    <UPageCard class="w-full max-w-md" v-if="currFormActive == 'signup'">
      <UAuthForm
        :schema="schema"
        title="Sign Up"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        :fields="signupFields"
        @submit="signUp"
      >
      
      <template #description>
          Already have an account? <ULink @click="currFormActive = 'login'" class="text-primary font-medium">Sign up</ULink>.
      </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: "guest"
})

useSeoMeta({
  title: 'Login or Sign Up | SiswaGig',
  description: 'Access your SiswaGig account or create a new one to find freelance opportunities or hire talented UiTM students.',
  ogTitle: 'Login or Sign Up | SiswaGig',
  ogDescription: 'Join SiswaGig to connect with UiTM student freelancers and clients.'
})

import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters'),
  confirmPassword: z
        .string("Password is required")
        .nonempty('Please confirm your password'),
  name: z.string("Name is required"),
  role: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .refine((role) => !!role.value, {
      message: 'Please select a role',
    })
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const loginFields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
}]


const signupFields: AuthFormField[] = [
  {
    name: 'name',
    type: 'text',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Create a password',
    required: true
  },
  {
    name: 'confirmPassword',
    type: 'password',
    label: 'Password',
    placeholder: 'Confirm the password',
    required: true
  },
  {
    name: 'role',
    type: 'select',
    label: 'Role',
    placeholder: 'Select your role',
    items: [
      { label: 'Freelancer', value: 'freelancer' },
      { label: 'Client', value: 'client' }
    ],
    required: true
  },
  {
    name: 'location',
    type: 'text',
    label: 'Location',
    placeholder: 'Enter your location (optional)',
    required: false
  }
]


type Schema = z.output<typeof schema>

const toast = useToast()

async function login(payload: FormSubmitEvent<Schema>) {
  try {
    // Clear any existing stores before login
    userStore().clearUser()
    useMyTokenStore().clearToken()
    
    const res = await $fetch("/api/user/sign-in", {
      method: "POST",
      body: {
        email: payload.data.email,
        password: payload.data.password
      }
    })
    
    // Get the new token from access-token endpoint
    const tokenRes = await $fetch('/api/user/access-token', {
      method: 'POST'
    }) as { accessToken: string }
    
    if (tokenRes?.accessToken) {
      useMyTokenStore().setToken(tokenRes.accessToken)
    }
    
    toast.add({
      id: "login-success",
      title: "Login Success",
      description: `Welcome back, ${res}!`,
      color: "success"
    })
    
    // Navigate after setting token
    await navigateTo("/explore")
  } catch (error: any) {
    toast.add({
      id: "login-error",
      title: "Login Error",
      description: error?.statusMessage || 'Login failed',
      color: "error",
    })
  }
}

async function signUp(payload: FormSubmitEvent<Schema>) {
  await $fetch("/api/user/sign-up", {
    method: "POST",
    body: {
      email: payload.data.email,
      name: payload.data.name,
      role: payload.data.role.value,
      password: payload.data.password
    }
  }).then(async (res) => {
    toast.add({
      id: "register-success",
      title: "Register Success",
      description: "Your account has successfully created.",
      color: "success"
    });
    currFormActive.value = "login";
  }).catch((error) => 
    toast.add({
      id: "register-error",
      title: "Register Error",
      description: error.statusMessage,
      color: "error",
    })
  )
}

const currFormActive = ref<string>("login")

const user = userStore()
const tokenStore = useMyTokenStore()

onMounted(() => {
  // Always clear stores when visiting auth page to ensure clean state
  user.clearUser()
  tokenStore.clearToken()
})
</script>
