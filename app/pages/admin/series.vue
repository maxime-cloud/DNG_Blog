<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Séries' })

const { data, refresh } = await useFetch('/api/series')
const showNew = ref(false)
const newSeries = reactive({ title: '', description: '' })

async function create() {
  await $fetch('/api/admin/series', { method: 'POST', body: newSeries })
  showNew.value = false
  Object.assign(newSeries, { title: '', description: '' })
  refresh()
}
async function del(id: number) {
  await $fetch(`/api/admin/series/${id}`, { method: 'DELETE' })
  refresh()
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between mb-6">
      <h1 class="text-2xl font-bold">Séries</h1>
      <CUButton label="Nouvelle série" logoName="i-lucide-plus" @click="showNew = true" />
    </div>

    <div v-if="showNew" class="border-[0.1px] border-dashed border-dashcolor/50 p-4 mb-6 space-y-3">
      <CUInput v-model="newSeries.title" placeholder="Titre de la série" />
      <CUInput v-model="newSeries.description" placeholder="Description" />
      <div class="flex gap-2">
        <CUButton label="Créer" @click="create" />
        <CUButton label="Annuler" @click="showNew = false" />
      </div>
    </div>

    <div class="space-y-3">
      <div
        v-for="s in data?.data ?? []"
        :key="s.id"
        class="flex items-center justify-between p-4 border-[0.1px] border-dashed border-dashcolor/50"
      >
        <div>
          <p class="font-medium">{{ s.title }}</p>
          <p class="text-xs text-zinc-500">{{ s._count?.articles ?? 0 }} épisodes</p>
        </div>
        <div class="flex gap-2">
          <UBadge :label="s.isPublished ? 'Publié' : 'Brouillon'" size="xs" />
          <CUButton size="xs" logoName="i-lucide-trash" @click="del(s.id)" />
        </div>
      </div>
    </div>
  </div>
</template>
