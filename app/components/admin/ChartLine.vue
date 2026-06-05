<script setup lang="ts">
import { VisXYContainer, VisLine, VisArea, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'

interface Point {
  label: string
  value: number
}

const props = withDefaults(
  defineProps<{
    data: Point[]
    color?: string
    height?: number
    area?: boolean
  }>(),
  {
    color: '#22c55e',
    height: 240,
    area: true
  }
)

const x = (_d: Point, i: number) => i
const y = (d: Point) => d.value

// Show at most ~6 x-axis ticks to avoid crowding
const tickValues = computed(() => {
  const n = props.data.length
  if (n <= 6) return props.data.map((_, i) => i)
  const step = Math.ceil(n / 6)
  return props.data.map((_, i) => i).filter(i => i % step === 0)
})

const xTickFormat = (i: number) => props.data[i]?.label ?? ''

const tooltipTemplate = (d: Point) =>
  `<div style="font-size:12px"><strong>${d.value}</strong><br/><span style="opacity:.6">${d.label}</span></div>`
</script>

<template>
  <ClientOnly>
    <div class="chart-line" :style="{ '--crosshair-color': color }">
      <VisXYContainer
        :data="data"
        :height="height"
        :duration="0"
        :margin="{ left: 8, right: 8, top: 8, bottom: 8 }"
      >
        <VisArea v-if="area" :x="x" :y="y" :color="color" :opacity="0.12" />
        <VisLine :x="x" :y="y" :color="color" :line-width="2" />
        <VisAxis
          type="x"
          :tick-values="tickValues"
          :tick-format="xTickFormat"
          :grid-line="false"
          :tick-line="false"
        />
        <VisAxis
          type="y"
          :num-ticks="4"
          :grid-line="false"
          :tick-line="false"
          :domain-line="false"
        />
        <VisCrosshair :color="color" :template="tooltipTemplate" :duration="0" />
        <VisTooltip />
      </VisXYContainer>
    </div>
    <template #fallback>
      <div :style="{ height: `${height}px` }" class="animate-pulse bg-[#111]" />
    </template>
  </ClientOnly>
</template>

<style scoped>
/* Unovis ships its styles as CSS-in-JS with dynamic class names, but its
   theming variables are plain CSS custom properties — which inherit — so we
   set them on a wrapper we own rather than targeting Unovis' internal classes. */
.chart-line {
  --vis-axis-grid-color: transparent;
  --vis-axis-domain-color: #e5e7eb22;
  --vis-axis-tick-color: transparent;
  --vis-axis-tick-label-color: #71717a;
  --vis-axis-tick-label-font-size: 11px;
  --vis-crosshair-line-stroke-color: var(--crosshair-color);
  --vis-crosshair-line-stroke-width: 1px;
  --vis-crosshair-circle-stroke-color: var(--crosshair-color);
  --vis-tooltip-background-color: #0a0a0a;
  --vis-tooltip-border-color: #e5e7eb44;
  --vis-tooltip-text-color: #ffffff;
  --vis-tooltip-border-radius: 0;
  --vis-tooltip-padding: 6px 10px;
  --vis-tooltip-transition-duration: 0s;
}
</style>
