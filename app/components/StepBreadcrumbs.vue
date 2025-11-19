<template>
  <nav aria-label="Profile steps" class="w-full">
    <ol class="flex items-center justify-center gap-4">
      <li
        v-for="(item, idx) in items"
        :key="item.key ?? item.label"
        class="flex items-center"
      >
        <button
          :disabled="item.disabled"
          @click="onClick(idx)"
          :aria-current="activeIndex === idx ? 'step' : undefined"
          :class="[
            'flex items-center gap-2 px-3 py-1 rounded-md transition',
            activeIndex === idx ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-500 hover:text-primary'
          ]"
          class="focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <!-- step number or custom icon -->
          <span
            :class="[
              'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm',
              activeIndex === idx ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
            ]"
          >
            {{ idx + 1 }}
          </span>

          <span class="whitespace-nowrap">{{ item.label }}</span>
        </button>

        <!-- separator -->
        <span v-if="idx < items.length - 1" class="mx-2 text-gray-300">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

type Crumb = {
  label: string
  key?: string | number
  disabled?: boolean
}

const props = defineProps<{
  items: Crumb[]
  modelValue?: number // active index (0-based)
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'click', index: number): void
}>()

const activeIndex = props.modelValue ?? 0

function onClick(index: number) {
  // Don't emit if disabled
  if (props.items[index]?.disabled) return
  emit('update:modelValue', index)
  emit('click', index)
}
</script>

<style scoped>
/* small spacing fixes if needed */
</style>
