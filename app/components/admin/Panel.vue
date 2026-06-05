<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <div
    class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none"
  >
    <div
      v-if="title || $slots.actions"
      class="flex items-center justify-between gap-2 mb-4"
    >
      <div>
        <h2
          v-if="title"
          class="font-semibold text-white"
        >
          {{ title }}
        </h2>
        <p
          v-if="subtitle"
          class="text-xs text-zinc-500 mt-0.5"
        >
          {{ subtitle }}
        </p>
      </div>
      <slot name="actions" />
    </div>
    <slot />
  </div>
</template>
