<script setup lang="ts">
import { VisSingleContainer, VisDonut } from '@unovis/vue'

interface Slice {
  label: string
  value: number
  color?: string
}

const props = withDefaults(
  defineProps<{
    data: Slice[]
    height?: number
  }>(),
  {
    height: 240
  }
)

const PALETTE = [
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#f59e0b',
  '#ef4444',
  '#14b8a6',
  '#ec4899',
  '#84cc16'
]

const colored = computed(() =>
  props.data.map((d, i) => ({ ...d, color: d.color || PALETTE[i % PALETTE.length] }))
)

const total = computed(() => props.data.reduce((s, d) => s + d.value, 0))

const value = (d: Slice) => d.value
const color = (d: Slice) => (d as Slice & { color: string }).color
</script>

<template>
  <div class="chart-donut flex flex-col sm:flex-row sm:items-center gap-6">
    <!-- Fixed-size wrapper: Unovis' SingleContainer ignores its width prop and
         grows to fill its parent, so we constrain it with explicit CSS. -->
    <div
      class="shrink-0 mx-auto sm:mx-0"
      :style="{ width: `${height}px`, height: `${height}px`, maxWidth: '100%' }"
    >
      <ClientOnly>
        <VisSingleContainer :data="colored" :height="height">
          <VisDonut
            :value="value"
            :color="color"
            :arc-width="28"
            :central-label="String(total)"
            central-sub-label="total"
            :pad-angle="0.02"
          />
        </VisSingleContainer>
        <template #fallback>
          <div class="w-full h-full animate-pulse bg-[#111] rounded-full" />
        </template>
      </ClientOnly>
    </div>

    <!-- Legend -->
    <div class="flex-1 min-w-0 w-full sm:w-auto space-y-2">
      <div
        v-for="slice in colored"
        :key="slice.label"
        class="flex items-center justify-between gap-3 text-sm"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-3 h-3 shrink-0" :style="{ backgroundColor: slice.color }" />
          <span class="truncate text-[#F3F4F6]">{{ slice.label }}</span>
        </div>
        <div class="flex items-center gap-2 shrink-0 text-zinc-500">
          <span class="text-white font-medium">{{ slice.value }}</span>
          <span class="text-xs"> {{ total ? Math.round((slice.value / total) * 100) : 0 }}% </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Unovis theming vars are inheriting CSS custom properties — set them on a
   wrapper we own (its internal class names are generated/CSS-in-JS). */
.chart-donut {
  --vis-donut-central-label-text-color: #ffffff;
  --vis-donut-central-label-font-size: 28px;
  --vis-donut-central-sub-label-text-color: #71717a;
  --vis-donut-central-sub-label-font-size: 12px;
}
</style>
