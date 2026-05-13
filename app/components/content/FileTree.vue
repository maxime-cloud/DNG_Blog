<script setup lang="ts">
interface TreeNode {
  name: string
  type: 'file' | 'dir'
  children?: TreeNode[]
}

defineProps<{
  tree?: TreeNode[]
}>()

const slots = useSlots()

function parseLines(text: string): TreeNode[] {
  const lines = text
    .split('\n')
    .map(l => l.trimEnd())
    .filter(l => l.trim())

  const root: TreeNode[] = []
  const stack: { nodes: TreeNode[], depth: number }[] = [{ nodes: root, depth: -1 }]

  for (const line of lines) {
    const stripped = line.replace(/^[│├└─\s]+/, '')
    const indent = line.length - stripped.length
    const name = stripped.replace(/^[│├└─\s]+/, '').trim()
    if (!name) continue

    const isDir = name.endsWith('/')
    const node: TreeNode = {
      name: isDir ? name.slice(0, -1) : name,
      type: isDir ? 'dir' : 'file'
    }
    if (isDir) node.children = []

    while (stack.length > 1 && stack[stack.length - 1].depth >= indent) {
      stack.pop()
    }

    stack[stack.length - 1].nodes.push(node)

    if (isDir) {
      stack.push({ nodes: node.children!, depth: indent })
    }
  }

  return root
}

const slotText = computed(() => {
  const nodes = slots.default?.()
  if (!nodes) return ''
  return nodes.map(n => (typeof n.children === 'string' ? n.children : '')).join('')
})

const parsedTree = computed(() => (slotText.value ? parseLines(slotText.value) : []))
</script>

<template>
  <div
    class="bg-[#EEE] dark:bg-[#111] border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4 my-4 font-mono text-sm"
  >
    <template
      v-for="(node, i) in tree ?? parsedTree"
      :key="i"
    >
      <ContentFileTreeNode :node="node" />
    </template>
  </div>
</template>
