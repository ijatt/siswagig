<template>
  <div>
    <UHeader>
      <template #title>
        <Icon name="fluent-hat-graduation-12-filled"/>
        <p class="">SiswaGig</p>
      </template>

      <template #right>
        <UColorModeButton />
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