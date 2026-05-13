<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Paramètres' })

const { data: settings } = await useFetch('/api/admin/settings')
const form = reactive({ siteName: '', articlesPerPage: 12, notificationEmail: '' })
const saving = ref(false)

watch(
  settings,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)

async function save() {
  saving.value = true
  try {
    await $fetch('/api/admin/settings', { method: 'PATCH', body: form })
    toast.success('Paramètres sauvegardés')
  } catch {
    toast.error('Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-xl">
    <h1 class="text-2xl font-bold mb-6">
      Paramètres généraux
    </h1>

    <form
      class="space-y-5"
      @submit.prevent="save"
    >
      <div>
        <label class="text-sm font-medium block mb-1 text-[#0F0F0F] dark:text-white">Nom du site</label>
        <CUInput
          v-model="form.siteName"
          placeholder="DNGBlog"
        />
      </div>
      <div>
        <label class="text-sm font-medium block mb-1 text-[#0F0F0F] dark:text-white">Articles par page</label>
        <CUInput
          v-model="form.articlesPerPage"
          type="number"
          min="1"
          max="50"
        />
      </div>
      <div>
        <label class="text-sm font-medium block mb-1 text-[#0F0F0F] dark:text-white">Email de notification admin</label>
        <CUInput
          v-model="form.notificationEmail"
          type="email"
        />
      </div>
      <CUButton
        type="submit"
        :loading="saving"
        label="Sauvegarder"
        logo-name="i-lucide-save"
      />
    </form>
  </div>
</template>
