<script setup>
defineProps({
  prev: Object,
  next: Object
})
</script>

<template>
  <div
    class="flex justify-between gap-4 pt-8 mt-8 border-t border-[0.1px] border-dashed border-dashcolor/50"
  >
    <NuxtLink
      v-if="prev"
      :to="prev.path"
      class="flex flex-col items-start p-4 border-[0.1px] border-dashed border-dashcolor/50 hover:border-primary/50 flex-1 rounded-none transition text-[#F3F4F6]"
    >
      <span class="text-xs text-zinc-500 mb-1">← Précédent</span>
      <span class="text-sm font-medium">{{ prev.title }}</span>
    </NuxtLink>
    <div
      v-else
      class="flex-1"
    />
    <NuxtLink
      v-if="next"
      :to="next.path"
      class="flex flex-col items-end p-4 border-[0.1px] border-dashed border-dashcolor/50 hover:border-primary/50 flex-1 rounded-none transition text-[#F3F4F6]"
    >
      <span class="text-xs text-zinc-500 mb-1">Suivant →</span>
      <span class="text-sm font-medium">{{ next.title }}</span>
    </NuxtLink>
  </div>
</template>
