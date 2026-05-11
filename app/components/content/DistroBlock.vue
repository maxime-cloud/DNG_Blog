<template>
  <div v-if="isVisible">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  distro: 'ubuntu' | 'fedora' | 'arch'
}>()

const selectedDistro = useLocalStorage<string>('selected-distro', '')

const isVisible = computed(() => selectedDistro.value === props.distro)
</script>
