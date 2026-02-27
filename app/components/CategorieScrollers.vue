<template>
<div class="carousel z-10">
  <div class="group" :class="props.direction">
    <CategorieScroller />
    <CategorieScroller />
    <CategorieScroller />
    <CategorieScroller />
  </div>
  <!-- Add `aria-hidden` to hide the duplicated cards from screen readers. -->
  <div aria-hidden class="group" :class="props.direction">
    <CategorieScroller />
    <CategorieScroller />
    <CategorieScroller />
    <CategorieScroller />
  </div>
</div>
</template>

<script setup lang="ts">
const props = defineProps({
  categories: {
    type: Array,
    // required: true,
  },
  direction: { // left or right
    type: String,
    required: true,
  },
});
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
    /* Add padding to the right to create a gap between the last and first card. */
    padding-right: 20px;
    will-change: transform; /* We should be nice to the browser - let it know what we're going to animate. */
    animation: scrolling 20s linear infinite;
}
.group.right {
    display: flex;
    gap: 20px;
    /* Add padding to the right to create a gap between the last and first card. */
    padding-right: 20px;
    will-change: transform; /* We should be nice to the browser - let it know what we're going to animate. */
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