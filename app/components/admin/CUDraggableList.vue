<script setup lang="ts">
import draggable from 'vuedraggable'

interface Item {
  id: number | string
  [key: string]: any
}

const props = defineProps<{
  modelValue: Item[]
  itemKey?: string
}>()

const emit = defineEmits(['update:modelValue', 'reorder'])

const list = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('reorder', value)
  }
})
</script>

<template>
  <draggable
    v-model="list"
    :item-key="itemKey || 'id'"
    handle=".drag-handle"
    ghost-class="ghost"
    class="space-y-2"
  >
    <template #item="{ element, index }">
      <div class="flex items-center gap-3 p-3 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 group transition-all hover:border-primary/50">
        <!-- Drag Handle -->
        <div class="drag-handle cursor-grab active:cursor-grabbing p-1 text-zinc-600 hover:text-white transition-colors">
          <UIcon name="i-lucide-grip-vertical" class="w-5 h-5" />
        </div>

        <!-- Index indicator -->
        <div class="shrink-0 w-7 h-7 flex items-center justify-center bg-zinc-800 text-zinc-500 text-[10px] font-bold">
          {{ index + 1 }}
        </div>

        <!-- Content Slot -->
        <div class="flex-1 min-w-0">
          <slot :element="element" :index="index" />
        </div>

        <!-- Actions Slot -->
        <div class="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <slot name="actions" :element="element" :index="index" />
        </div>
      </div>
    </template>
  </draggable>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: rgba(59, 130, 246, 0.1) !important;
  border-color: #3B82F6 !important;
}

.drag-handle {
  touch-action: none;
}
</style>
