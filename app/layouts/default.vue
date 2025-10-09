<template>
  <div>
    <UHeader>
      <template #title>
        <Icon name="fluent-hat-graduation-12-filled"/>
        <p class="">SiswaGig</p>
      </template>
      <UInput icon="i-lucide-search" size="md" variant="outline" placeholder="Search..." />

      <template #right>
        <UColorModeButton />

        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/nuxt/ui"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </template>

      <template #body>
        
      </template>
    </UHeader>
    <slot />
    <UFooter>
        <p class="text-muted text-sm">
          Copyright © {{ new Date().getFullYear() }} SiswaGig
        </p>
    </UFooter>
  </div>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [{
  label: 'Docs',
  to: '/docs/getting-started',
  active: route.path.startsWith('/docs/getting-started')
}, {
  label: 'Components',
  to: '/docs/components',
  active: route.path.startsWith('/docs/components')
}, {
  label: 'Figma',
  to: 'https://go.nuxt.com/figma-ui',
  target: '_blank'
}, {
  label: 'Releases',
  to: 'https://github.com/nuxt/ui/releases',
  target: '_blank'
}])
</script>

<style>

</style>