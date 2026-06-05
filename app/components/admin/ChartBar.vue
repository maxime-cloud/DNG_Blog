<script setup lang="ts">
interface Bar {
  label: string
  value: number
  sub?: string | number
  color?: string
}

const props = withDefaults(
  defineProps<{
    data: Bar[]
    color?: string
  }>(),
  {
    color: '#22c55e'
  }
)

const max = computed(() => Math.max(1, ...props.data.map(d => d.value)))
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(bar, i) in data"
      :key="bar.label"
      class="flex items-center gap-3"
    >
      <span class="text-xs text-zinc-500 w-5 shrink-0 text-right">{{ i + 1 }}</span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-sm text-[#F3F4F6] truncate">{{ bar.label }}</span>
          <span class="text-xs text-zinc-500 shrink-0">
            {{ bar.value }}<template v-if="bar.sub"> · {{ bar.sub }}</template>
          </span>
        </div>
        <div class="h-2 bg-[#111] border-[0.1px] border-dashcolor/30">
          <div
            class="h-full transition-all duration-500"
            :style="{
              width: `${Math.max(2, (bar.value / max) * 100)}%`,
              backgroundColor: bar.color || color
            }"
          />
        </div>
      </div>
    </div>
    <p
      v-if="!data.length"
      class="text-sm text-zinc-500 py-4 text-center"
    >
      Aucune donnée
    </p>
  </div>
</template>
