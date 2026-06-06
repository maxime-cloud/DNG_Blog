<template>
  <div
    class="section-title flex justify-between w-full cursor-normal items-center"
  >
    <NuxtLink
      :id="props.to"
      class="text-[24px] sm:text-[32px] lg:text-[38px] font-bold"
      :to="'#' + props.to"
    >
      <h1>{{ props.label }}</h1>
    </NuxtLink>
    <div class="section-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
  to: String
})
</script>
