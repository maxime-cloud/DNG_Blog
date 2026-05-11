<template>
  <div class="carousel z-10">
    <div
      class="group"
      :class="props.direction"
    >
      <CategorieScroller
        v-for="cat in categories"
        :key="cat.slug"
        :category="cat"
      />
    </div>
    <div
      aria-hidden
      class="group"
      :class="props.direction"
    >
      <CategorieScroller
        v-for="cat in categories"
        :key="cat.slug"
        :category="cat"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  direction: 'left' | 'right'
}>()

const { data } = await useFetch('/api/categories')
const categories = computed(() => data.value?.data ?? [])
</script>

<style scoped>
.carousel {
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
  display: flex;
  &:hover .group {
    animation-play-state: paused;
  }
}

.group.left {
  display: flex;
  gap: 20px;
  padding-right: 20px;
  will-change: transform;
  animation: scrolling 20s linear infinite;
}

.group.right {
  display: flex;
  gap: 20px;
  padding-right: 20px;
  will-change: transform;
  animation: scrollingRight 20s linear infinite;
}

@keyframes scrolling {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

@keyframes scrollingRight {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
