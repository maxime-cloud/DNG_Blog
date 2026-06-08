<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Parcours d\'apprentissage' })

const { success, error: toastError } = useAppToast()
const { data, refresh } = await useFetch('/api/admin/learning-paths')
const showNew = ref(false)
const newPath = reactive({ title: '', description: '', difficulty: 'BEGINNER' })

async function create() {
  try {
    await $fetch('/api/admin/learning-paths', { method: 'POST', body: newPath })
    showNew.value = false
    Object.assign(newPath, { title: '', description: '', difficulty: 'BEGINNER' })
    refresh()
    success('Parcours créé avec succès')
  } catch (err: any) {
    toastError(err.data?.statusMessage || 'Erreur lors de la création')
  }
}
async function del(id: number) {
  try {
    await $fetch(`/api/admin/learning-paths/${id}`, { method: 'DELETE' })
    refresh()
    success('Parcours supprimé')
  } catch {
    toastError('Erreur lors de la suppression')
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between mb-6">
      <h1 class="text-2xl font-bold">
        Parcours
      </h1>
      <CUButton
        label="Nouveau parcours"
        logo-name="i-lucide-plus"
        @click="showNew = true"
      />
    </div>

    <div
      v-if="showNew"
      class="border-[0.1px] border-dashed border-dashcolor/50 p-4 mb-6 space-y-3"
    >
      <div class="grid grid-cols-2 gap-4">
        <CUInput
          v-model="newPath.title"
          placeholder="Titre"
        />
        <CUInput
          v-model="newPath.description"
          placeholder="Description"
        />
      </div>
      <div class="max-w-xs">
        <select
          v-model="newPath.difficulty"
          class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none w-full"
        >
          <option value="BEGINNER">
            Débutant
          </option>
          <option value="INTERMEDIATE">
            Intermédiaire
          </option>
          <option value="ADVANCED">
            Avancé
          </option>
        </select>
      </div>
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
        v-for="path in data?.data ?? []"
        :key="path.id"
        class="flex items-center justify-between p-4 border-[0.1px] border-dashed border-dashcolor/50"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 shrink-0 border-[0.1px] border-dashed border-dashcolor/30 flex items-center justify-center overflow-hidden">
            <img
              v-if="path.coverImageUrl"
              :src="path.coverImageUrl"
              :alt="path.title"
              class="w-full h-full object-cover"
            >
            <UIcon
              v-else
              name="i-lucide-image"
              class="w-5 h-5 text-zinc-400"
            />
          </div>
          <div>
            <p class="font-medium">
              {{ path.title }}
            </p>
            <p class="text-xs text-zinc-500">
              {{ path.difficulty }} — {{ path.steps?.length ?? path._count?.steps ?? 0 }} étapes
            </p>
          </div>
        </div>
        <div class="flex gap-2 items-center">
          <UBadge
            :label="path.isPublished ? 'Publié' : 'Brouillon'"
            :class="path.isPublished ? 'bg-green-600 text-white' : 'bg-zinc-600 text-white'"
            size="sm"
            class="rounded-none font-bold uppercase tracking-tight"
          />
          <NuxtLink :to="`/admin/parcours/${path.id}`">
            <CUButton
              size="xs"
              logo-name="i-lucide-pencil"
            />
          </NuxtLink>
          <CUButton
            size="xs"
            logo-name="i-lucide-trash"
            @click="del(path.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
