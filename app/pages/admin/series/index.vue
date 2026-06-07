<script setup lang="ts">
import { toast } from 'vue-sonner'

const { confirm } = useConfirm()

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Séries' })

const { data, refresh } = await useFetch('/api/series')
const showNew = ref(false)
const newSeries = reactive({ title: '', description: '' })

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
              :color="s.isPublished ? 'green' : 'neutral'"
              variant="subtle"
              size="sm"
              class="rounded-none font-bold uppercase tracking-tight"
            />
            <NuxtLink :to="`/admin/series/${s.id}`">
              <CUButton
                size="xs"
                logo-name="i-lucide-pencil"
              />
            </NuxtLink>
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
