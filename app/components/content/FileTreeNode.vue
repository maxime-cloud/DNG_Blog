<script setup lang="ts">
interface TreeNode {
  name: string
  type: 'file' | 'dir'
  children?: TreeNode[]
}

const props = defineProps<{
  node: TreeNode
  depth?: number
}>()

const depth = computed(() => props.depth ?? 0)
const isOpen = ref(true)

function fileIcon(name: string): string {
  const ext = name.split('.').pop() ?? ''
  const icons: Record<string, string> = {
    ts: 'i-simple-icons-typescript',
    tsx: 'i-simple-icons-typescript',
    js: 'i-simple-icons-javascript',
    jsx: 'i-simple-icons-javascript',
    vue: 'i-simple-icons-vuedotjs',
    json: 'i-lucide-braces',
    md: 'i-lucide-file-text',
    css: 'i-simple-icons-css3',
    html: 'i-lucide-code',
    yaml: 'i-lucide-settings',
    yml: 'i-lucide-settings',
    env: 'i-lucide-lock',
    gitignore: 'i-simple-icons-git',
    dockerfile: 'i-simple-icons-docker'
  }
  return icons[ext] ?? 'i-lucide-file'
}
</script>

<template>
  <div :style="{ paddingLeft: `${depth * 16}px` }">
    <!-- Directory -->
    <div
      v-if="node.type === 'dir'"
      class="flex items-center gap-1.5 py-0.5 cursor-pointer hover:text-primary transition-colors"
      @click="isOpen = !isOpen"
    >
      <UIcon
        :name="isOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
        class="w-3.5 h-3.5 text-zinc-400 shrink-0"
      />
      <UIcon
        :name="isOpen ? 'i-lucide-folder-open' : 'i-lucide-folder'"
        class="w-3.5 h-3.5 text-yellow-500 shrink-0"
      />
      <span class="text-[#F3F4F6] font-medium">{{ node.name }}</span>
    </div>

    <!-- File -->
    <div
      v-else
      class="flex items-center gap-1.5 py-0.5 text-zinc-500"
    >
      <span class="w-3.5 shrink-0" />
      <UIcon
        :name="fileIcon(node.name)"
        class="w-3.5 h-3.5 text-primary/70 shrink-0"
      />
      <span>{{ node.name }}</span>
    </div>

    <!-- Children -->
    <div v-if="node.type === 'dir' && isOpen && node.children?.length">
      <ContentFileTreeNode
        v-for="(child, i) in node.children"
        :key="i"
        :node="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>
