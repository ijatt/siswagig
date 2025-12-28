<template>
  <div class="flex items-center gap-2 text-sm">
    <Icon name="lucide:map-pin" size="16" class="text-blue-600" />
    <span v-if="distance !== null && distance !== undefined" class="text-gray-700">
      <span class="font-semibold">{{ distance.toFixed(1) }} km</span>
      <span class="text-gray-500">({{ distanceCategory }})</span>
    </span>
    <span v-else class="text-gray-500 italic">Location not available</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'

interface Props {
  distance?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  distance: null
})

const distanceCategory = computed(() => {
  if (props.distance === null || props.distance === undefined) {
    return ''
  }

  if (props.distance <= 5) return 'Very Close'
  if (props.distance <= 15) return 'Close'
  if (props.distance <= 30) return 'Moderate'
  if (props.distance <= 50) return 'Far'
  return 'Very Far'
})
</script>

<style scoped lang="css">
</style>
