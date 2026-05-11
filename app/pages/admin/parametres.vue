<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Paramètres' })

const { data: settings } = await useFetch('/api/admin/settings')
const form = reactive({ siteName: '', articlesPerPage: 12, notificationEmail: '' })
watch(
  settings,
  val => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)
const toast = useToast()

async function save() {
  await $fetch('/api/admin/settings', { method: 'PATCH', body: form })
  toast.add({ title: 'Paramètres sauvegardés', color: 'success' })
}
</script>

<template>
  <div class="p-6 max-w-xl">
    <h1 class="text-2xl font-bold mb-6">Paramètres généraux</h1>

    <form @submit.prevent="save" class="space-y-5">
      <div>
        <label class="text-sm font-medium block mb-1">Nom du site</label>
        <CUInput v-model="form.siteName" placeholder="DNGBlog" />
      </div>
      <div>
        <label class="text-sm font-medium block mb-1">Articles par page</label>
        <CUInput v-model="form.articlesPerPage" type="number" min="1" max="50" />
      </div>
      <div>
        <label class="text-sm font-medium block mb-1">Email de notification admin</label>
        <CUInput v-model="form.notificationEmail" type="email" />
      </div>
      <CUButton type="submit" label="Sauvegarder" />
    </form>
  </div>
</template>
