<script setup lang="ts">
definePageMeta({ 
  middleware: 'auth',
  layout: false 
})
await navigateTo('/users/me')
</script>

<template>
  <div />
</template>
