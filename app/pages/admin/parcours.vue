<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: "Parcours d'apprentissage" })

const { data, refresh } = await useFetch('/api/admin/learning-paths')
const showNew = ref(false)
const newPath = reactive({ title: '', description: '', difficulty: 'BEGINNER' })

async function create() {
  await $fetch('/api/admin/learning-paths', { method: 'POST', body: newPath })
  showNew.value = false
  Object.assign(newPath, { title: '', description: '', difficulty: 'BEGINNER' })
  refresh()
}
async function del(id: number) {
  await $fetch(`/api/admin/learning-paths/${id}`, { method: 'DELETE' })
  refresh()
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between mb-6">
      <h1 class="text-2xl font-bold">Parcours</h1>
      <CUButton label="Nouveau parcours" logoName="i-lucide-plus" @click="showNew = true" />
    </div>

    <div v-if="showNew" class="border-[0.1px] border-dashed border-dashcolor/50 p-4 mb-6 space-y-3">
      <CUInput v-model="newPath.title" placeholder="Titre" />
      <CUInput v-model="newPath.description" placeholder="Description" />
      <select
        v-model="newPath.difficulty"
        class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none w-full"
      >
        <option value="BEGINNER">Débutant</option>
        <option value="INTERMEDIATE">Intermédiaire</option>
        <option value="ADVANCED">Avancé</option>
      </select>
      <div class="flex gap-2">
        <CUButton label="Créer" @click="create" />
        <CUButton label="Annuler" @click="showNew = false" />
      </div>
    </div>

    <div class="space-y-3">
      <div
        v-for="path in data?.data ?? []"
        :key="path.id"
        class="flex items-center justify-between p-4 border-[0.1px] border-dashed border-dashcolor/50"
      >
        <div>
          <p class="font-medium">{{ path.title }}</p>
          <p class="text-xs text-zinc-500">
            {{ path.difficulty }} — {{ path.steps?.length ?? path._count?.steps ?? 0 }} étapes
          </p>
        </div>
        <div class="flex gap-2 items-center">
          <UBadge :label="path.isPublished ? 'Publié' : 'Brouillon'" size="xs" />
          <NuxtLink :to="`/admin/parcours/${path.id}/steps`">
            <CUButton size="xs" label="Étapes" logoName="i-lucide-list-ordered" />
          </NuxtLink>
          <CUButton size="xs" logoName="i-lucide-trash" @click="del(path.id)" />
        </div>
      </div>
    </div>
  </div>
</template>
