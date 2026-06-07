<template>
  <div
    class="bg-zinc-900 bg-zinc-950 rounded-none border-[0.1px] border-zinc-700 overflow-hidden my-4"
  >
    <pre class="p-4 overflow-x-auto text-sm"><slot /></pre>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  code?: string
  language?: string
  filename?: string
}>()
</script>
