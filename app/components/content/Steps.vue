<template>
  <div class="steps space-y-6 my-6">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.steps {
  counter-reset: steps;
}

.steps :deep(h3) {
  counter-increment: steps;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.steps :deep(h3)::before {
  content: counter(steps);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  font-size: 0.875rem;
  font-weight: 700;
  background-color: var(--color-primary-500, #22c55e);
  color: white;
  border-radius: 0;
}
</style>
