<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        title="Login"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        :fields="fields"
        @submit="onSubmit"
      >
      <template #description>
          Don't have an account? <ULink to="#" class="text-primary font-medium">Sign up</ULink>.
      </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>

<script lang="ts" setup>
import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters')
})

const fields: AuthFormField[] = [{
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

type Schema = z.output<typeof schema>

const toast = useToast()

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  await $fetch("/api/user/sign-in", {
    method: "POST",
    body: {
      email: payload.data.email,
      password: payload.data.password
    }
  }).then(async (res) => {
    await navigateTo("/");
    toast.add({
      id: "login-success",
      title: "Login Success",
      description: `Welcome back, ${res}!`,
      color: "success"
    });
  }).catch((error) => 
    toast.add({
      id: "login-error",
      title: "Login Error",
      description: error.statusMessage,
      color: "error",
    })
  )
}
</script>
