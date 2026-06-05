<script setup lang="ts">
const { confirmState, onConfirm, onCancel } = useConfirm()
</script>

<template>
  <UModal
    :open="confirmState.open"
    :ui="{
      overlay: 'bg-CustomColor-900/60 backdrop-blur-xs',
      content: 'ring-0 flex justify-center bg-transparent items-center'
    }"
    @close="onCancel"
  >
    <template #content>
      <div
        class="w-full max-w-sm p-6 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none"
      >
        <div class="flex items-center gap-3 mb-4">
          <UIcon
            name="i-lucide-triangle-alert"
            class="w-5 h-5 text-red-400 shrink-0"
          />
          <h3 class="font-semibold text-white">
            {{ confirmState.title }}
          </h3>
        </div>
        <p class="text-sm text-[#F3F4F6]/70 mb-6">
          {{ confirmState.message }}
        </p>
        <div class="flex gap-2 justify-end">
          <CUButton
            label="Annuler"
            size="sm"
            @click="onCancel"
          />
          <CUButton
            label="Supprimer"
            size="sm"
            logo-name="i-lucide-trash"
            logo-position="left"
            class="!bg-red-500 hover:!bg-red-600 border-red-500/50"
            @click="onConfirm"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
