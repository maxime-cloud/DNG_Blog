<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useClipboard } from '@vueuse/core'

const { confirm } = useConfirm()

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Médiathèque' })

const { data, refresh } = await useFetch('/api/admin/media', { query: { limit: 48 } })
const fileInput = ref<HTMLInputElement | null>(null)
const { copy } = useClipboard()
const editingAltId = ref<number | null>(null)
const editAltText = ref('')

async function upload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files?.length) return
  const formData = new FormData()
  for (const file of files) formData.append('files', file)
  try {
    await $fetch('/api/admin/media/upload', { method: 'POST', body: formData })
    refresh()
    toast.success(`${files.length} fichier(s) uploadé(s)`)
  } catch {
    toast.error('Erreur lors de l\'upload')
  }
}

function copyUrl(url: string) {
  copy(url)
  toast.info('URL copiée dans le presse-papier !')
}

function startEditAlt(media: { id: number, altText: string | null }) {
  editingAltId.value = media.id
  editAltText.value = media.altText ?? ''
}

async function saveAlt(id: number) {
  try {
    await $fetch(`/api/admin/media/${id}`, {
      method: 'PATCH',
      body: { altText: editAltText.value }
    })
    editingAltId.value = null
    refresh()
    toast.success('Texte alternatif mis à jour')
  } catch {
    toast.error('Erreur lors de la mise à jour')
  }
}

async function del(id: number) {
  if (!await confirm('Supprimer ce média ?')) return
  try {
    await $fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    refresh()
    toast.success('Média supprimé')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between mb-6">
      <h1 class="text-2xl font-bold">
        Médiathèque
      </h1>
      <CUButton
        label="Uploader"
        logo-name="i-lucide-upload"
        @click="fileInput?.click()"
      />
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="upload"
    >

    <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      <div
        v-for="media in data?.items ?? data?.data ?? []"
        :key="media.id"
        class="group relative border-[0.1px] border-dashed border-dashcolor/50"
      >
        <div class="aspect-square overflow-hidden">
          <img
            :src="media.url"
            :alt="media.altText ?? media.filename"
            class="w-full h-full object-cover"
          >
        </div>

        <!-- Alt text edit -->
        <div
          v-if="editingAltId === media.id"
          class="p-1 space-y-1"
        >
          <input
            v-model="editAltText"
            placeholder="Texte alt..."
            class="w-full text-xs bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-2 py-1 outline-none text-white"
          >
          <div class="flex gap-1">
            <button
              class="text-xs text-primary hover:underline"
              @click="saveAlt(media.id)"
            >
              OK
            </button>
            <button
              class="text-xs text-zinc-400 hover:underline"
              @click="editingAltId = null"
            >
              ✕
            </button>
          </div>
        </div>
        <p
          v-else
          class="text-xs truncate px-1 py-0.5 bg-CustomColor-900 text-white"
        >
          {{ media.filename }}
        </p>

        <!-- Hover actions -->
        <div
          class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2"
        >
          <button
            class="text-white transition"
            @click="copyUrl(media.url)"
          >
            <UIcon
              name="i-lucide-copy"
              class="w-4 h-4"
            />
          </button>
          <button
            class="text-white hover:text-yellow-400 transition"
            @click="startEditAlt(media)"
          >
            <UIcon
              name="i-lucide-type"
              class="w-4 h-4"
            />
          </button>
          <button
            class="text-white hover:text-red-400 transition"
            @click="del(media.id)"
          >
            <UIcon
              name="i-lucide-trash"
              class="w-4 h-4"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
