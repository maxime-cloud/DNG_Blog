<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })

const page = ref(1)
const search = ref('')
const status = ref('')

const { data, refresh } = await useFetch('/api/admin/articles', {
  query: computed(() => ({
    page: page.value,
    search: search.value || undefined,
    status: status.value || undefined,
    limit: 20
  }))
})

useSeoMeta({ title: 'Gestion des articles' })

const columns = [
  { key: 'title', label: 'Titre', sortable: true },
  { key: 'status', label: 'Statut' },
  { key: 'publishedAt', label: 'Publié le' },
  { key: 'actions', label: 'Actions' }
]

async function deleteArticle(id) {
  await $fetch(`/api/articles/${id}`, { method: 'DELETE' })
  refresh()
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-[#0F0F0F] dark:text-white">Articles</h1>
      <NuxtLink to="/admin/articles/new">
        <CUButton label="Nouvel article" logo-name="i-lucide-plus" logo-position="left" />
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex gap-3 mb-4">
      <CUInput v-model="search" placeholder="Rechercher..." />
      <select
        v-model="status"
        class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 px-3 text-sm text-[#0F0F0F] dark:text-white rounded-none"
      >
        <option value="">Tous les statuts</option>
        <option value="DRAFT">Brouillon</option>
        <option value="PUBLISHED">Publié</option>
        <option value="ARCHIVED">Archivé</option>
      </select>
    </div>

    <!-- DataTable with scoped slots -->
    <AdminDataTable
      :columns="columns"
      :rows="data?.data ?? []"
      :total="data?.total"
      :page="page"
      @page-change="page = $event"
    >
      <template #status="{ row }">
        <UBadge :label="row.status" size="xs" />
      </template>
      <template #publishedAt="{ row }">
        <span class="text-zinc-500">{{
          row.publishedAt ? new Date(row.publishedAt).toLocaleDateString('fr-FR') : '—'
        }}</span>
      </template>
      <template #actions="{ row }">
        <div class="flex gap-2">
          <NuxtLink :to="`/admin/articles/${row.id}/edit`">
            <CUButton size="xs" logo-name="i-lucide-pencil" logo-position="left" />
          </NuxtLink>
          <CUButton
            size="xs"
            logo-name="i-lucide-trash"
            logo-position="left"
            @click="deleteArticle(row.id)"
          />
        </div>
      </template>
    </AdminDataTable>
  </div>
</template>
