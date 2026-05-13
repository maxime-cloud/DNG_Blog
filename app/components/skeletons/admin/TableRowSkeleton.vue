<script setup lang="ts">
const props = withDefaults(defineProps<{ columns?: number, count?: number }>(), {
  columns: 5,
  count: 8
})
const widths = ['w-32', 'w-20', 'w-24', 'w-16', 'w-28']
</script>

<template>
  <div class="space-y-0">
    <div
      v-for="i in props.count"
      :key="i"
      class="flex items-center gap-4 px-4 py-3 border-b border-[0.1px] border-dashed border-dashcolor/30"
    >
      <USkeleton
        v-for="(w, j) in widths.slice(0, props.columns - 1)"
        :key="j"
        :class="`h-3 ${w} rounded-none`"
      />
      <!-- Actions column -->
      <div class="flex gap-1 ml-auto">
        <USkeleton class="h-7 w-7 rounded-none" />
        <USkeleton class="h-7 w-7 rounded-none" />
      </div>
    </div>
  </div>
</template>
