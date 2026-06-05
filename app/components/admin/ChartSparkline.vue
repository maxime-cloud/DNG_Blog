<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    data: number[]
    color?: string
    height?: number
    width?: number
  }>(),
  {
    color: '#22c55e',
    height: 40,
    width: 120
  }
)

const path = computed(() => {
  const d = props.data
  if (d.length < 2) return { line: '', area: '' }
  const max = Math.max(...d)
  const min = Math.min(...d)
  const range = max - min || 1
  const stepX = props.width / (d.length - 1)

  const points = d.map((v, i) => {
    const x = i * stepX
    const y = props.height - ((v - min) / range) * (props.height - 4) - 2
    return [x, y] as const
  })

  const line = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')
  const area = `${line} L${props.width},${props.height} L0,${props.height} Z`
  return { line, area }
})
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    preserveAspectRatio="none"
    class="overflow-visible"
  >
    <path
      :d="path.area"
      :fill="color"
      opacity="0.12"
    />
    <path
      :d="path.line"
      fill="none"
      :stroke="color"
      stroke-width="1.5"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
</template>
