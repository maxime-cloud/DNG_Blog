<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Médiathèque' })

const { data, refresh } = await useFetch('/api/admin/media', { query: { limit: 24 } })
const fileInput = ref<HTMLInputElement | null>(null)

async function upload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files?.length) return
  const formData = new FormData()
  for (const file of files) formData.append('files', file)
  await $fetch('/api/admin/media/upload', { method: 'POST', body: formData })
  refresh()
}
async function del(id: number) {
  await $fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
  refresh()
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between mb-6">
      <h1 class="text-2xl font-bold">Médiathèque</h1>
      <CUButton label="Uploader" logoName="i-lucide-upload" @click="fileInput?.click()" />
    </div>
    <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="upload" />

    <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      <div
        v-for="media in data?.data ?? []"
        :key="media.id"
        class="group relative border-[0.1px] border-dashed border-dashcolor/50 aspect-square overflow-hidden"
      >
        <img
          :src="media.url"
          :alt="media.altText ?? media.filename"
          class="w-full h-full object-cover"
        />
        <div
          class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2"
        >
          <button @click="del(media.id)" class="text-white">
            <UIcon name="i-lucide-trash" class="w-4 h-4" />
          </button>
        </div>
        <p class="text-xs truncate p-1 bg-CustomLight dark:bg-CustomColor-900">
          {{ media.filename }}
        </p>
      </div>
    </div>
  </div>
</template>
