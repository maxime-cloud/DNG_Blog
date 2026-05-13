<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number }>(), { count: 6 })
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <SkeletonsArticleCardSkeleton
      v-for="i in props.count"
      :key="i"
    />
  </div>
</template>
