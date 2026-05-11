<template>
  <div
    class="border-l-4 p-4 rounded-none flex gap-3 items-start mb-4"
    :class="styles.container"
  >
    <UIcon
      :name="styles.icon"
      class="w-5 h-5 flex-shrink-0 mt-0.5"
      :class="styles.icon_color"
    />
    <div class="flex-1 text-sm leading-relaxed">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  type?: 'info' | 'warning' | 'danger' | 'success'
}>()

const styleMap = {
  info: {
    container:
      'border-blue-500 bg-blue-500/10 text-blue-900 dark:text-blue-100',
    icon: 'i-lucide-info',
    icon_color: 'text-blue-500'
  },
  warning: {
    container:
      'border-yellow-500 bg-yellow-500/10 text-yellow-900 dark:text-yellow-100',
    icon: 'i-lucide-triangle-alert',
    icon_color: 'text-yellow-500'
  },
  danger: {
    container: 'border-red-500 bg-red-500/10 text-red-900 dark:text-red-100',
    icon: 'i-lucide-circle-x',
    icon_color: 'text-red-500'
  },
  success: {
    container:
      'border-green-500 bg-green-500/10 text-green-900 dark:text-green-100',
    icon: 'i-lucide-circle-check',
    icon_color: 'text-green-500'
  }
}

const styles = computed(() => styleMap[props.type ?? 'info'])
</script>
