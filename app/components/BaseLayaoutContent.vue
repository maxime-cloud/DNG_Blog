<template>
<section class="w-full bg-CustomLight dark:bg-CustomColor-900 flex flex-col items-center border-b border-dashed border-CustomColor-900/50 dark:border-dashcolor dark:px-4">
  <div :class="{ 'max-w-7xl': !home }" class="relative border-x border-dashed dark:max-w-7xl w-full border-CustomColor-900/50 dark:border-dashcolor flex flex-col">
    <slot/>
    <div v-if="!home" class="contentCarousel mb-20 p-8 flex gap-4 relative justify-center">
      <NewsLetter />
    </div>
  </div>
</section>
</template>

<script setup>
const props = defineProps({
  home: Boolean,
});
</script>