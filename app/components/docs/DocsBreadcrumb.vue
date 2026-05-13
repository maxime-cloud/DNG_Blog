<script setup>
const props = defineProps({ path: String })

const segments = computed(() => {
  const parts = props.path.split('/').filter(Boolean)
  return parts.map((part, i) => ({
    label: part.replace(/-/g, ' '),
    path: '/' + parts.slice(0, i + 1).join('/')
  }))
})
</script>

<template>
  <nav class="flex items-center gap-2 text-sm text-zinc-500 mb-6">
    <NuxtLink
      to="/docs"
      class="hover:text-primary transition"
    > Docs </NuxtLink>
    <span
      v-for="seg in segments.slice(1)"
      :key="seg.path"
      class="flex items-center gap-2"
    >
      <UIcon
        name="i-lucide-chevron-right"
        class="w-3 h-3 shrink-0"
      />
      <NuxtLink
        :to="seg.path"
        class="hover:text-primary capitalize transition"
      >
        {{ seg.label }}
      </NuxtLink>
    </span>
  </nav>
</template>
