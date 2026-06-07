<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const { confirm } = useConfirm()
const seriesId = Number(route.params.id)

const { data, refresh } = await useAsyncData(`admin-series-edit-${seriesId}`, () =>
  $fetch(`/api/admin/series/${seriesId}`)
)

const series = computed(() => data.value?.data ?? null)

const form = reactive({
  title: '',
  description: '',
  isPublished: false,
  coverImageUrl: ''
})

watch(series, (s) => {
  if (s) {
    form.title = s.title
    form.description = s.description ?? ''
    form.isPublished = s.isPublished
    form.coverImageUrl = s.coverImageUrl ?? ''
  }
}, { immediate: true })

const saving = ref(false)

async function save() {
  saving.value = true
  try {
    await $fetch(`/api/admin/series/${seriesId}`, {
      method: 'PATCH',
      body: form
    })
    toast.success('Série mise à jour')
    refresh()
  } catch {
    toast.error('Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

async function deleteSeries() {
  if (!await confirm('Supprimer définitivement cette série ? Les articles ne seront pas supprimés mais ne seront plus liés à cette série.')) return
  try {
    await $fetch(`/api/admin/series/${seriesId}`, { method: 'DELETE' })
    toast.success('Série supprimée')
    router.push('/admin/series')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}
</script>

<template>
  <div class="p-6 max-w-4xl">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/admin/series" class="text-zinc-500 hover:text-white transition-colors">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Modifier la série</h1>
      <div class="ml-auto flex gap-3">
        <NuxtLink :to="`/admin/series/${seriesId}/articles`">
          <CUButton label="Gérer les articles" logo-name="i-lucide-list-ordered" />
        </NuxtLink>
        <CUButton label="Supprimer" logo-name="i-lucide-trash" class="border-red-500/50 text-red-500 hover:bg-red-500/10" @click="deleteSeries" />
      </div>
    </div>

    <div class="space-y-6 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-6 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)]">
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Titre de la série</label>
          <CUInput v-model="form.title" placeholder="Ex: Apprendre Nuxt 4" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Description</label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="Décrivez le thème de cette série..."
          ></textarea>
        </div>

        <div>
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative flex items-center">
              <input type="checkbox" v-model="form.isPublished" class="sr-only peer">
              <div class="w-10 h-5 bg-zinc-800 border-[0.1px] border-dashed border-dashcolor/50 peer-checked:bg-primary/20 peer-checked:border-primary/50 transition-all"></div>
              <div class="absolute left-1 top-1 w-3 h-3 bg-zinc-500 peer-checked:bg-primary peer-checked:translate-x-5 transition-all"></div>
            </div>
            <span class="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
              {{ form.isPublished ? 'Série publiée' : 'Brouillon' }}
            </span>
          </label>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Image de couverture</label>
          <div class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4">
            <AdminCoverUpload v-model="form.coverImageUrl" />
          </div>
        </div>
      </div>

      <div class="pt-4 flex justify-end">
        <CUButton
          label="Enregistrer les modifications"
          logo-name="i-lucide-save"
          :loading="saving"
          @click="save"
        />
      </div>
    </div>
  </div>
</template>
