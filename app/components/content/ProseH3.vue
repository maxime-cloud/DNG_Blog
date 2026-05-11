<template>
  <h3 :id="id" class="text-xl font-semibold mt-8 mb-3 flex items-center gap-2 group">
    <slot />
    <button
      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-zinc-400 hover:text-primary"
      :aria-label="`Copy link to section`"
      @click="copyAnchor"
    >
      <UIcon name="i-lucide-link" class="w-4 h-4" />
    </button>
  </h3>
</template>

<script setup lang="ts">
const props = defineProps<{
  id?: string
}>()

const { copy } = useClipboard()

function copyAnchor() {
  const url = `${window.location.origin}${window.location.pathname}#${props.id}`
  copy(url)
}
</script>
