<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Changelog' })

const { data, refresh } = await useFetch('/api/changelog', { query: { limit: 50 } })
const showNew = ref(false)
const newEntry = reactive({ type: 'FEATURE', title: '', description: '' })

async function create() {
  await $fetch('/api/admin/changelog', {
    method: 'POST',
    body: { ...newEntry, publishedAt: new Date().toISOString() }
  })
  showNew.value = false
  Object.assign(newEntry, { type: 'FEATURE', title: '', description: '' })
  refresh()
}
async function del(id: number) {
  await $fetch(`/api/admin/changelog/${id}`, { method: 'DELETE' })
  refresh()
}

const typeColors: Record<string, string> = {
  FEATURE: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  FIX: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  CONTENT: 'bg-blue-100 text-blue-700',
  DESIGN: 'bg-purple-100 text-purple-700',
  PERF: 'bg-orange-100 text-orange-700',
  SECURITY: 'bg-yellow-100 text-yellow-700'
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between mb-6">
      <h1 class="text-2xl font-bold">Changelog</h1>
      <CUButton label="Nouvelle entrée" logoName="i-lucide-plus" @click="showNew = true" />
    </div>

    <div v-if="showNew" class="border-[0.1px] border-dashed border-dashcolor/50 p-4 mb-6 space-y-3">
      <select
        v-model="newEntry.type"
        class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none w-full"
      >
        <option
          v-for="t in ['FEATURE', 'FIX', 'CONTENT', 'DESIGN', 'PERF', 'SECURITY']"
          :key="t"
          :value="t"
        >
          {{ t }}
        </option>
      </select>
      <CUInput v-model="newEntry.title" placeholder="Titre" />
      <textarea
        v-model="newEntry.description"
        rows="3"
        placeholder="Description..."
        class="w-full bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 text-sm outline-none rounded-none"
      />
      <div class="flex gap-2">
        <CUButton label="Créer" @click="create" />
        <CUButton label="Annuler" @click="showNew = false" />
      </div>
    </div>

    <div class="space-y-3">
      <div
        v-for="entry in data?.data ?? []"
        :key="entry.id"
        class="flex items-start justify-between p-4 border-[0.1px] border-dashed border-dashcolor/50"
      >
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span
              :class="typeColors[entry.type]"
              class="text-xs px-2 py-0.5 font-medium rounded-none"
              >{{ entry.type }}</span
            >
            <span class="text-xs text-zinc-400">{{
              new Date(entry.publishedAt).toLocaleDateString('fr-FR')
            }}</span>
          </div>
          <p class="font-medium text-sm">{{ entry.title }}</p>
          <p v-if="entry.description" class="text-xs text-zinc-500 mt-0.5">
            {{ entry.description }}
          </p>
        </div>
        <CUButton size="xs" logoName="i-lucide-trash" @click="del(entry.id)" />
      </div>
    </div>
  </div>
</template>
