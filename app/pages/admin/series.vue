<script setup lang="ts">
import { toast } from 'vue-sonner'

const { confirm } = useConfirm()

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Séries' })

const { data, refresh } = await useFetch('/api/series')
const showNew = ref(false)
const newSeries = reactive({ title: '', description: '' })
const editingId = ref<number | null>(null)
const editForm = reactive({ title: '', description: '' })

async function create() {
  if (!newSeries.title.trim()) return
  try {
    await $fetch('/api/admin/series', { method: 'POST', body: newSeries })
    showNew.value = false
    Object.assign(newSeries, { title: '', description: '' })
    refresh()
    toast.success('Série créée')
  } catch {
    toast.error('Erreur lors de la création')
  }
}

function startEdit(s: { id: number, title: string, description: string | null }) {
  editingId.value = s.id
  editForm.title = s.title
  editForm.description = s.description ?? ''
}

async function saveEdit(id: number) {
  try {
    await $fetch(`/api/admin/series/${id}`, { method: 'PATCH', body: editForm })
    editingId.value = null
    refresh()
    toast.success('Série mise à jour')
  } catch {
    toast.error('Erreur lors de la mise à jour')
  }
}

async function togglePublish(s: { id: number, isPublished: boolean }) {
  try {
    await $fetch(`/api/admin/series/${s.id}`, {
      method: 'PATCH',
      body: { isPublished: !s.isPublished }
    })
    refresh()
    toast.success(s.isPublished ? 'Série dépubliée' : 'Série publiée')
  } catch {
    toast.error('Erreur')
  }
}

async function del(id: number) {
  if (!await confirm('Supprimer cette série ?')) return
  try {
    await $fetch(`/api/admin/series/${id}`, { method: 'DELETE' })
    refresh()
    toast.success('Série supprimée')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between mb-6">
      <h1 class="text-2xl font-bold">
        Séries
      </h1>
      <CUButton
        label="Nouvelle série"
        logo-name="i-lucide-plus"
        @click="showNew = true"
      />
    </div>

    <div
      v-if="showNew"
      class="border-[0.1px] border-dashed border-dashcolor/50 p-4 mb-6 space-y-3"
    >
      <CUInput
        v-model="newSeries.title"
        placeholder="Titre de la série"
      />
      <CUInput
        v-model="newSeries.description"
        placeholder="Description"
      />
      <div class="flex gap-2">
        <CUButton
          label="Créer"
          @click="create"
        />
        <CUButton
          label="Annuler"
          @click="showNew = false"
        />
      </div>
    </div>

    <div class="space-y-3">
      <div
        v-for="s in data?.data ?? []"
        :key="s.id"
        class="border-[0.1px] border-dashed border-dashcolor/50 p-4"
      >
        <div
          v-if="editingId === s.id"
          class="space-y-2"
        >
          <CUInput
            v-model="editForm.title"
            placeholder="Titre"
          />
          <CUInput
            v-model="editForm.description"
            placeholder="Description"
          />
          <div class="flex gap-2">
            <CUButton
              size="xs"
              label="Sauvegarder"
              @click="saveEdit(s.id)"
            />
            <CUButton
              size="xs"
              label="Annuler"
              @click="editingId = null"
            />
          </div>
        </div>
        <div
          v-else
          class="flex items-center justify-between"
        >
          <div>
            <p class="font-medium">
              {{ s.title }}
            </p>
            <p
              v-if="s.description"
              class="text-xs text-zinc-500 mt-0.5"
            >
              {{ s.description }}
            </p>
            <p class="text-xs text-zinc-500">
              {{ s.articlesCount ?? 0 }} épisodes
            </p>
          </div>
          <div class="flex gap-2 items-center">
            <UBadge
              :label="s.isPublished ? 'Publié' : 'Brouillon'"
              size="sm"
            />
            <CUButton
              size="xs"
              logo-name="i-lucide-pencil"
              @click="startEdit(s)"
            />
            <CUButton
              size="xs"
              :logo-name="s.isPublished ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click="togglePublish(s)"
            />
            <CUButton
              size="xs"
              logo-name="i-lucide-trash"
              @click="del(s.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
