<template>
  <span
    class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-none"
    :class="colorClasses"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'zinc'
}>()

const colorMap = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  yellow:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  zinc: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
}

const colorClasses = computed(() => colorMap[props.color ?? 'green'])
</script>
