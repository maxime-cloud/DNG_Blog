<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Gestion des utilisateurs' })

const search = ref('')
const page = ref(1)
const { data, refresh } = await useFetch('/api/admin/users', {
  query: computed(() => ({ page: page.value, limit: 20, search: search.value || undefined }))
})

async function changeRole(id: string, role: string) {
  await $fetch(`/api/admin/users/${id}/role`, { method: 'PATCH', body: { role } })
  refresh()
}
async function ban(id: string) {
  await $fetch(`/api/admin/users/${id}/ban`, { method: 'PATCH' })
  refresh()
}
async function unban(id: string) {
  await $fetch(`/api/admin/users/${id}/unban`, { method: 'PATCH' })
  refresh()
}

const columns = [
  { key: 'name', label: 'Nom' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Rôle' },
  { key: 'banned', label: 'Statut' },
  { key: 'createdAt', label: 'Inscription' },
  { key: 'actions', label: 'Actions' }
]
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Utilisateurs</h1>

    <div class="mb-4">
      <CUInput v-model="search" placeholder="Rechercher..." />
    </div>

    <AdminDataTable
      :columns="columns"
      :rows="data?.data ?? []"
      :total="data?.total"
      :page="page"
      @page-change="page = $event"
    >
      <template #name="{ row }">
        <div class="flex items-center gap-2">
          <UAvatar :src="row.image" size="xs" />
          <span class="text-sm">{{ row.name }}</span>
        </div>
      </template>
      <template #email="{ row }"
        ><span class="text-sm">{{ row.email }}</span></template
      >
      <template #role="{ row }"><UBadge :label="row.role" size="xs" /></template>
      <template #banned="{ row }">
        <UBadge
          :label="row.banned ? 'Banni' : 'Actif'"
          :color="row.banned ? 'error' : 'success'"
          size="xs"
        />
      </template>
      <template #createdAt="{ row }">
        <span class="text-sm text-zinc-500">{{
          new Date(row.createdAt).toLocaleDateString('fr-FR')
        }}</span>
      </template>
      <template #actions="{ row }">
        <div class="flex gap-1">
          <select
            class="text-xs border-[0.1px] border-dashed border-dashcolor/50 bg-CustomLight dark:bg-CustomColor-900 px-1 py-0.5 rounded-none"
            @change="changeRole(row.id, ($event.target as HTMLSelectElement).value)"
          >
            <option value="reader" :selected="row.role === 'reader'">Reader</option>
            <option value="author" :selected="row.role === 'author'">Author</option>
            <option value="admin" :selected="row.role === 'admin'">Admin</option>
          </select>
          <CUButton v-if="!row.banned" size="xs" label="Bannir" @click="ban(row.id)" />
          <CUButton v-else size="xs" label="Débannir" @click="unban(row.id)" />
        </div>
      </template>
    </AdminDataTable>
  </div>
</template>
