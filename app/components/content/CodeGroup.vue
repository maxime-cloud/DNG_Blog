<script setup lang="ts">
const slots = useSlots()
const activeTab = ref(0)

const tabs = computed(() => {
  const defaultSlot = slots.default?.()
  if (!defaultSlot) return []
  return defaultSlot
    .filter(vnode => vnode.props)
    .map((vnode, i) => ({
      index: i,
      label:
        (vnode.props?.filename as string) ?? (vnode.props?.language as string) ?? `Tab ${i + 1}`,
      vnode
    }))
})

const activeVnode = computed(() => tabs.value[activeTab.value]?.vnode ?? null)
</script>

<template>
  <div
    class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none overflow-hidden my-4"
  >
    <!-- Tab bar -->
    <div
      class="flex border-b border-dashed border-dashcolor/30 overflow-x-auto"
    >
      <button
        v-for="tab in tabs"
        :key="tab.index"
        class="px-4 py-2 text-xs font-mono whitespace-nowrap transition-colors"
        :class="
          activeTab === tab.index
            ? 'text-primary border-b-2 border-primary bg-primary/5'
            : 'text-zinc-500 hover:text-[#F3F4F6]'
        "
        @click="activeTab = tab.index"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Active tab content -->
    <div v-if="activeVnode">
      <component :is="() => activeVnode" />
    </div>

    <!-- Fallback: render slot directly if no structured tabs -->
    <div v-if="!tabs.length">
      <slot />
    </div>
  </div>
</template>
