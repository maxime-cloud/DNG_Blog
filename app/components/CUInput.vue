<template>
  <UInput
    v-bind="$attrs"
    :size="props.size"
    class="relative text-[#0F0F0F]"
    :ui="{
      base: 'bg-white text-[#0F0F0F] placeholder-[#0F0F0F]/40 ring-0 rounded-none border-dashcolor/50 border-[0.1px] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)]',
      rounded: 'rounded-none'
    }"
  />
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'md'
  }
})
</script>

<style scoped></style>
