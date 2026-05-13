<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number }>(), { count: 4 })
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="i in props.count"
      :key="i"
      class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 p-6 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none"
    >
      <div class="flex items-start justify-between">
        <div class="space-y-2 flex-1">
          <USkeleton class="h-3 w-20 rounded-none" />
          <USkeleton class="h-8 w-16 rounded-none" />
          <USkeleton class="h-3 w-12 rounded-none" />
        </div>
        <USkeleton class="w-8 h-8 rounded-none" />
      </div>
    </div>
  </div>
</template>
