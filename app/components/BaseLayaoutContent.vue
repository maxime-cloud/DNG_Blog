<template>
  <section class="w-full bg-CustomColor-900 flex flex-col items-center border-b border-dashed border-dashcolor px-4">
    <div
      :class="{ 'max-w-7xl': !home }"
      class="relative border-x border-dashed max-w-7xl w-full border-dashcolor flex flex-col"
    >
      <slot />
      <div
        v-if="!home && !route.path.startsWith('/users')"
        class="contentCarousel mb-20 p-8 flex gap-4 relative justify-center"
      >
        <NewsLetter />
      </div>
    </div>
  </section>
</template>

<script setup>
const route = useRoute()
const props = defineProps({
  home: Boolean
})
</script>
