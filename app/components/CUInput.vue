<template>
  <UInput
    v-bind="$attrs"
    :size="props.size"
    class="relative text-white"
    :ui="{
      base: 'bg-CustomLight dark:bg-CustomColor-900 dark:placeholder-[#F3F4F6]/60 placeholder-[#0F0F0F]/40 ring-0 rounded-none border-CustomColor-900/30 dark:border-dashcolor/50 border-[0.1px] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] hover:bg-primary shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)]',
      rounded: 'rounded-none',
      placeholder: ''
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

<style scoped>
</style>
