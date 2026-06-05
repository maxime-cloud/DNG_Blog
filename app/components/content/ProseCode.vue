<template>
  <code class="font-mono text-sm bg-zinc-800 px-1 py-0.5 rounded-none text-primary">
    <slot />
  </code>
</template>

<script setup lang="ts">
defineProps<{
  code?: string
  language?: string
}>()
</script>
