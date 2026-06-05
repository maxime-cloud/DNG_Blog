<template>
  <h2
    :id="id"
    class="text-2xl font-bold mt-10 mb-4 flex items-center gap-2 group"
  >
    <slot />
    <button
      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-zinc-400 hover:text-white"
      :aria-label="`Copy link to section`"
      @click="copyAnchor"
    >
      <UIcon
        name="i-lucide-link"
        class="w-4 h-4"
      />
    </button>
  </h2>
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
