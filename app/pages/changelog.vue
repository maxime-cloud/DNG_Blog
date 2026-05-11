<script setup lang="ts">
const { data } = await useFetch('/api/changelog', { query: { limit: 50 } })
useSeoMeta({ title: 'Changelog' })
const typeColors: Record<string, string> = {
  FEATURE: 'text-green-600 bg-green-50 dark:bg-green-950',
  FIX: 'text-red-600 bg-red-50 dark:bg-red-950',
  CONTENT: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
  DESIGN: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
  PERF: 'text-orange-600 bg-orange-50 dark:bg-orange-950',
  SECURITY: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950'
}
const typeLabels: Record<string, string> = {
  FEATURE: 'Feature',
  FIX: 'Fix',
  CONTENT: 'Content',
  DESIGN: 'Design',
  PERF: 'Perf',
  SECURITY: 'Sécurité'
}
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="py-10 px-4 max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold mb-2">Changelog</h1>
        <p class="text-zinc-500 mb-10">Historique des mises à jour du blog.</p>
        <div class="space-y-6">
          <div v-for="entry in data?.data ?? []" :key="entry.id" class="flex gap-4">
            <div class="flex flex-col items-center">
              <div class="w-2 h-2 rounded-none bg-primary mt-2 shrink-0" />
              <div class="w-px flex-1 bg-primary/20 mt-2" />
            </div>
            <div class="pb-6 flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span
                  :class="typeColors[entry.type]"
                  class="text-xs font-medium px-2 py-0.5 rounded-none"
                  >{{ typeLabels[entry.type] }}</span
                >
                <span class="text-xs text-zinc-400">{{
                  new Date(entry.publishedAt).toLocaleDateString('fr-FR')
                }}</span>
              </div>
              <h3 class="font-semibold">{{ entry.title }}</h3>
              <p v-if="entry.description" class="text-sm text-zinc-500 mt-1">
                {{ entry.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
