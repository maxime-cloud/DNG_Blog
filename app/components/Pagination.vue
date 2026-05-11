<template>
  <div class="flex items-center gap-2 justify-center flex-wrap">
    <CUButton
      :disabled="currentPage <= 1"
      logo-name="i-lucide-chevron-left"
      logo-position="left"
      label="Précédent"
      size="sm"
      class="disabled:opacity-40 disabled:cursor-not-allowed"
      @click="changePage(currentPage - 1)"
    />

    <template
      v-for="item in pageItems"
      :key="item"
    >
      <span
        v-if="item === '...'"
        class="px-2 text-zinc-500 text-sm select-none"
      >…</span>
      <CUButton
        v-else
        :label="String(item)"
        size="sm"
        class="min-w-8 justify-center"
        :class="item === currentPage ? 'bg-primary text-white' : ''"
        @click="changePage(Number(item))"
      />
    </template>

    <CUButton
      :disabled="currentPage >= totalPages"
      logo-name="i-lucide-chevron-right"
      logo-position="right"
      label="Suivant"
      size="sm"
      class="disabled:opacity-40 disabled:cursor-not-allowed"
      @click="changePage(currentPage + 1)"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
}>()

const emit = defineEmits<{
  'update:page': [page: number]
}>()

function changePage(page: number) {
  if (page < 1 || page > props.totalPages) return
  props.onPageChange?.(page)
  emit('update:page', page)
}

const pageItems = computed<(number | string)[]>(() => {
  const total = props.totalPages
  const current = props.currentPage
  const delta = 1
  const items: (number | string)[] = []

  for (let i = 1; i <= total; i++) {
    if (
      i === 1
      || i === total
      || (i >= current - delta && i <= current + delta)
    ) {
      items.push(i)
    } else if (items[items.length - 1] !== '...') {
      items.push('...')
    }
  }

  return items
})
</script>
