<template>
  <UInput
    v-bind="$attrs"
    :size="props.size"
    class="relative text-white"
    :ui="{
      base: 'bg-CustomColor-900 text-white ring-0 rounded-none border-dashcolor/50 border-[0.1px] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]',
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

<style scoped>
:deep(input::placeholder),
:deep(textarea::placeholder) {
  color: #e5e7eb;
  opacity: 0.4;
}

/* Garde le fond sombre quand le champ est auto-rempli par le navigateur */
:deep(input:-webkit-autofill),
:deep(input:-webkit-autofill:hover),
:deep(input:-webkit-autofill:focus),
:deep(input:-webkit-autofill:active) {
  -webkit-box-shadow:
    0 0 0 1000px rgb(10, 10, 10) inset,
    -6px 7px 24px 0px rgb(0 0 0 / 0.51),
    0px -4px 4px 0px rgb(0 0 0 / 0.51) !important;
  box-shadow:
    0 0 0 1000px rgb(10, 10, 10) inset,
    -6px 7px 24px 0px rgb(0 0 0 / 0.51),
    0px -4px 4px 0px rgb(0 0 0 / 0.51) !important;
  -webkit-text-fill-color: #fff !important;
  caret-color: #fff;
  outline: none !important;
  border-color: #e5e7eb44 !important;
  transition: background-color 9999s ease-in-out 0s;
}
</style>
