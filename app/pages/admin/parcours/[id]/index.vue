<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const { confirm } = useConfirm()
const pathId = Number(route.params.id)

const { data, refresh } = await useAsyncData(`admin-path-edit-${pathId}`, () =>
  $fetch(`/api/admin/learning-paths/${pathId}`)
)

const path = computed(() => data.value?.data ?? null)

const form = reactive({
  title: '',
  description: '',
  difficulty: 'BEGINNER',
  isPublished: false,
  coverImageUrl: ''
})

watch(path, (p) => {
  if (p) {
    form.title = p.title
    form.description = p.description ?? ''
    form.difficulty = p.difficulty
    form.isPublished = p.isPublished
    form.coverImageUrl = p.coverImageUrl ?? ''
  }
}, { immediate: true })

const saving = ref(false)

async function save() {
  saving.value = true
  try {
    await $fetch(`/api/admin/learning-paths/${pathId}`, {
      method: 'PATCH',
      body: form
    })
    toast.success('Parcours mis à jour')
    refresh()
  } catch {
    toast.error('Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

async function deletePath() {
  if (!await confirm('Supprimer définitivement ce parcours et toutes ses étapes ?')) return
  try {
    await $fetch(`/api/admin/learning-paths/${pathId}`, { method: 'DELETE' })
    toast.success('Parcours supprimé')
    router.push('/admin/parcours')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}
</script>

<template>
  <div class="p-6 max-w-4xl">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/admin/parcours" class="text-zinc-500 hover:text-white transition-colors">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Modifier le parcours</h1>
      <div class="ml-auto flex gap-3">
        <NuxtLink :to="`/admin/parcours/${pathId}/steps`">
          <CUButton label="Gérer les étapes" logo-name="i-lucide-list-ordered" />
        </NuxtLink>
        <CUButton label="Supprimer" logo-name="i-lucide-trash" class="border-red-500/50 text-red-500 hover:bg-red-500/10" @click="deletePath" />
      </div>
    </div>

    <div class="space-y-6 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-6 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)]">
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Titre du parcours</label>
          <CUInput v-model="form.title" placeholder="Ex: Linux Admin Débutant" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Description</label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="Décrivez ce que les lecteurs vont apprendre..."
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Difficulté</label>
            <select
              v-model="form.difficulty"
              class="w-full bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors rounded-none"
            >
              <option value="BEGINNER">Débutant</option>
              <option value="INTERMEDIATE">Intermédiaire</option>
              <option value="ADVANCED">Avancé</option>
            </select>
          </div>
          <div class="flex items-end pb-2">
            <label class="flex items-center gap-3 cursor-pointer group">
              <div class="relative flex items-center">
                <input type="checkbox" v-model="form.isPublished" class="sr-only peer">
                <div class="w-10 h-5 bg-zinc-800 border-[0.1px] border-dashed border-dashcolor/50 peer-checked:bg-primary/20 peer-checked:border-primary/50 transition-all"></div>
                <div class="absolute left-1 top-1 w-3 h-3 bg-zinc-500 peer-checked:bg-primary peer-checked:translate-x-5 transition-all"></div>
              </div>
              <span class="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                {{ form.isPublished ? 'Parcours publié' : 'Brouillon' }}
              </span>
            </label>
          </div>
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
