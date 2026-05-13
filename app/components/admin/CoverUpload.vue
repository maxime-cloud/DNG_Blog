<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const uploading = ref(false)

async function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    form.append('slug', `cover-${Date.now()}`)
    const result = await $fetch<{ url: string }>('/api/admin/articles/cover', {
      method: 'POST',
      body: form
    })
    emit('update:modelValue', result.url)
  } catch {
    const { toast } = await import('vue-sonner')
    toast.error('Erreur lors de l\'upload')
  } finally {
    uploading.value = false
  }
}

function removeCover() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium mb-2">Image de couverture</label>

    <div
      v-if="modelValue"
      class="relative border-[0.1px] border-dashed border-dashcolor/50 overflow-hidden mb-2"
    >
      <img
        :src="modelValue"
        alt="Couverture"
        class="w-full h-40 object-cover"
      >
      <button
        class="absolute top-2 right-2 bg-CustomColor-900/70 text-white p-1 hover:bg-red-500/80 transition-colors"
        @click="removeCover"
      >
        <UIcon
          name="i-lucide-x"
          class="w-4 h-4"
        />
      </button>
    </div>

    <label
      class="flex items-center justify-center gap-2 w-full py-3 border-[0.1px] border-dashed border-dashcolor/50 hover:border-primary/50 cursor-pointer transition-colors text-sm text-zinc-500 hover:text-primary"
      :class="uploading ? 'opacity-60 pointer-events-none' : ''"
    >
      <input
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
      >
      <UIcon
        :name="uploading ? 'i-lucide-loader' : 'i-lucide-upload'"
        class="w-4 h-4"
        :class="uploading ? 'animate-spin' : ''"
      />
      {{ uploading ? 'Upload en cours...' : modelValue ? "Changer l'image" : 'Uploader une image' }}
    </label>
  </div>
</template>
