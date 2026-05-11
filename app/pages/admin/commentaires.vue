<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Modération des commentaires' })

const status = ref('')
const page = ref(1)
const { data, refresh } = await useFetch('/api/admin/comments', {
  query: computed(() => ({ page: page.value, limit: 20, status: status.value || undefined }))
})

async function approve(id: number) {
  await $fetch(`/api/admin/comments/${id}/approve`, { method: 'PATCH' })
  refresh()
}
async function reject(id: number) {
  await $fetch(`/api/admin/comments/${id}/reject`, { method: 'PATCH' })
  refresh()
}
async function del(id: number) {
  await $fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
  refresh()
}

const columns = [
  { key: 'content', label: 'Commentaire' },
  { key: 'user', label: 'Auteur' },
  { key: 'article', label: 'Article' },
  { key: 'status', label: 'Statut' },
  { key: 'createdAt', label: 'Date' },
  { key: 'actions', label: 'Actions' }
]
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Modération des commentaires</h1>

    <div class="flex gap-3 mb-4">
      <select
        v-model="status"
        class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none"
      >
        <option value="">Tous</option>
        <option value="PENDING">En attente</option>
        <option value="APPROVED">Approuvés</option>
        <option value="REJECTED">Rejetés</option>
        <option value="SPAM">Spam</option>
      </select>
    </div>

    <AdminDataTable
      :columns="columns"
      :rows="data?.data ?? []"
      :total="data?.total"
      :page="page"
      @page-change="page = $event"
    >
      <template #content="{ row }">
        <span class="line-clamp-2 text-sm max-w-xs">{{ row.content }}</span>
      </template>
      <template #user="{ row }">
        <span class="text-sm">{{ row.user?.name ?? 'Anonyme' }}</span>
      </template>
      <template #article="{ row }">
        <span class="text-sm">{{ row.article?.title }}</span>
      </template>
      <template #status="{ row }">
        <UBadge :label="row.status" size="xs" />
      </template>
      <template #createdAt="{ row }">
        <span class="text-sm text-zinc-500">{{
          new Date(row.createdAt).toLocaleDateString('fr-FR')
        }}</span>
      </template>
      <template #actions="{ row }">
        <div class="flex gap-1">
          <CUButton v-if="row.status === 'PENDING'" size="xs" label="✓" @click="approve(row.id)" />
          <CUButton v-if="row.status === 'PENDING'" size="xs" label="✗" @click="reject(row.id)" />
          <CUButton size="xs" logoName="i-lucide-trash" @click="del(row.id)" />
        </div>
      </template>
    </AdminDataTable>
  </div>
</template>
