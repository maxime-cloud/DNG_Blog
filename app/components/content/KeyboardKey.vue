<script setup lang="ts">
const props = defineProps<{
  key?: string
  k?: string
}>()

const label = computed(() => props.key ?? props.k ?? '')

const keyMap: Record<string, string> = {
  cmd: '⌘',
  ctrl: '⌃',
  alt: '⌥',
  opt: '⌥',
  shift: '⇧',
  enter: '↵',
  return: '↵',
  tab: '⇥',
  esc: 'Esc',
  escape: 'Esc',
  backspace: '⌫',
  delete: '⌦',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  space: 'Space'
}

const keys = computed(() =>
  label.value
    .split('+')
    .map(k => k.trim())
    .map(k => keyMap[k.toLowerCase()] ?? k)
)
</script>

<template>
  <span class="inline-flex items-center gap-0.5 align-middle">
    <template
      v-for="(k, i) in keys"
      :key="i"
    >
      <span
        class="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-xs font-mono font-semibold bg-[#EEE] dark:bg-[#222] text-[#0F0F0F] dark:text-[#F3F4F6] border-[0.1px] border-[#0F0F0F]/20 dark:border-dashcolor/50 shadow-[0px_2px_0px_0px_rgb(0,0,0,0.25)] rounded-none select-none"
      >
        {{ k }}
      </span>
      <span
        v-if="i < keys.length - 1"
        class="text-xs text-zinc-400"
      >+</span>
    </template>
  </span>
</template>
