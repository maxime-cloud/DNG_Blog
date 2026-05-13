<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number }>(), { count: 3 })
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="i in props.count"
      :key="i"
      class="flex gap-3 p-4 border-[0.1px] border-dashed border-dashcolor/50"
    >
      <USkeleton class="w-9 h-9 rounded-full shrink-0" />
      <div class="flex-1 space-y-2">
        <div class="flex items-center gap-3">
          <USkeleton class="h-3 w-24 rounded-none" />
          <USkeleton class="h-3 w-16 rounded-none" />
        </div>
        <USkeleton class="h-3 w-full rounded-none" />
        <USkeleton class="h-3 w-5/6 rounded-none" />
        <USkeleton class="h-3 w-4/6 rounded-none" />
        <div class="flex gap-3 pt-1">
          <USkeleton class="h-3 w-12 rounded-none" />
          <USkeleton class="h-3 w-14 rounded-none" />
        </div>
      </div>
    </div>
  </div>
</template>
