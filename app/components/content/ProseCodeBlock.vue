<template>
  <div
    class="bg-zinc-900 dark:bg-zinc-950 rounded-none border-[0.1px] border-zinc-700 overflow-hidden my-4"
  >
    <!-- Top bar -->
    <div
      v-if="filename || language"
      class="flex items-center justify-between px-4 py-2 bg-zinc-800 dark:bg-zinc-900 border-b border-[0.1px] border-zinc-700"
    >
      <span class="text-zinc-400 text-sm font-mono">{{ filename }}</span>
      <div class="flex items-center gap-2">
        <span
          v-if="language"
          class="text-xs font-mono uppercase px-2 py-0.5 bg-zinc-700 text-zinc-300 rounded-none"
        >
          {{ language }}
        </span>
        <button
          class="text-zinc-400 hover:text-white transition-colors duration-200 text-sm font-mono"
          @click="copy"
        >
          {{ copied ? '✓' : 'Copy' }}
        </button>
      </div>
    </div>

    <!-- Copy button when no filename bar -->
    <div
      v-else
      class="flex items-center justify-end px-4 py-2 bg-zinc-800 dark:bg-zinc-900 border-b border-[0.1px] border-zinc-700"
    >
      <button
        class="text-zinc-400 hover:text-white transition-colors duration-200 text-sm font-mono"
        @click="copy"
      >
        {{ copied ? '✓' : 'Copy' }}
      </button>
    </div>

    <pre class="p-4 overflow-x-auto text-sm"><slot /></pre>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  code?: string
  language?: string
  filename?: string
}>()

const { copy: copyToClipboard, copied } = useClipboard({
  source: computed(() => props.code ?? '')
})

function copy() {
  copyToClipboard(props.code ?? '')
  setTimeout(() => {}, 2000)
}
</script>
