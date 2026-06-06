<script setup>
definePageMeta({ 
  middleware: 'auth',
  layout: false 
})
await navigateTo('/users/me')
</script>

<template>
  <div />
</template>
