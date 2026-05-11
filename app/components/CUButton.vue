<template>
  <UButton
    :trailing-icon="props.logoName && props.logoPosition === 'right' ? props.logoName : undefined"
    :icon="props.logoName && props.logoPosition === 'left' ? props.logoName : undefined"
    :size="props.size"
    class="relative shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] hover:cursor-pointer shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] hover:bg-primary shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] text-white rounded-none button border-dashcolor/50 border-[0.1px]"
    :label="props.label"
  />
</template>

<script setup>
const props = defineProps(['logoPosition', 'label', 'logoName', 'size'])
</script>

<style scoped>

</style>
