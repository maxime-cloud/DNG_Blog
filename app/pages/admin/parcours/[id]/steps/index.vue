<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const pathId = Number(route.params.id)

interface Step {
  id: number
  stepOrder: number
  stepTitle: string | null
  article: { id: number, title: string, slug: string }
}

interface LearningPath {
  id: number
  title: string
  slug: string
  isPublished: boolean
  steps: Step[]
}

const { data, refresh } = await useAsyncData<{ data: LearningPath }>(
  `admin-path-${pathId}`,
  () => $fetch(`/api/admin/learning-paths/${pathId}`)
)
const path = computed(() => data.value?.data ?? null)

const stepsList = ref<Step[]>([])
watch(() => path.value?.steps, (newSteps) => {
  if (newSteps) stepsList.value = [...newSteps]
}, { immediate: true })

useSeoMeta({ title: computed(() => `Étapes — ${path.value?.title ?? ''}`) })

const articleSearch = ref('')
const articleResults = ref<{ id: number, title: string, slug: string }[]>([])
const searching = ref(false)

async function searchArticles() {
  if (!articleSearch.value.trim()) {
    articleResults.value = []
    return
  }
  searching.value = true
  try {
    const res = await $fetch<{ data: { id: number, title: string, slug: string }[] }>(
      '/api/admin/articles',
      { query: { search: articleSearch.value, limit: 10 } }
    )
    articleResults.value = res.data ?? []
  } finally {
    searching.value = false
  }
}

function isAlreadyInPath(articleId: number) {
  return path.value?.steps.some(s => s.article.id === articleId)
}

async function addStepImmediately(article: { id: number, title: string, slug: string }) {
  if (isAlreadyInPath(article.id)) {
    toast.error('Article déjà présent')
    return
  }

  try {
    const nextOrder = (path.value?.steps.length ?? 0) + 1
    await $fetch(`/api/admin/learning-paths/${pathId}/steps`, {
      method: 'POST',
      body: { articleId: article.id, stepOrder: nextOrder }
    })
    await refresh()
    toast.success(`"${article.title}" ajouté`)
  } catch {
    toast.error('Erreur lors de l\'ajout')
  }
}

async function deleteStep(stepId: number) {
  if (!await confirm('Supprimer cette étape du parcours ?')) return
  try {
    await $fetch(`/api/admin/learning-paths/${pathId}/steps/${stepId}`, { method: 'DELETE' })
    await refresh()
    toast.success('Étape supprimée')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}

async function handleReorder(newList: Step[]) {
  try {
    const reorderedSteps = newList.map((step, index) => ({
      id: step.id,
      stepOrder: index + 1
    }))
    await $fetch(`/api/admin/learning-paths/${pathId}/steps/reorder`, {
      method: 'PATCH',
      body: { steps: reorderedSteps }
    })
    toast.success('Ordre mis à jour')
  } catch {
    toast.error('Erreur lors de la mise à jour de l\'ordre')
    refresh()
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink :to="`/admin/parcours/${pathId}`" class="text-zinc-500 hover:text-white transition-colors">
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-white">Étapes du parcours</h1>
        <p v-if="path" class="text-sm text-zinc-500 mt-0.5">{{ path.title }}</p>
      </div>
    </div>

    <!-- Multi-Add section -->
    <div class="border-[0.1px] border-dashed border-dashcolor/50 p-4 mb-6 space-y-4 bg-CustomColor-900 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)]">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Ajouter des articles</p>
        <UPopover :popper="{ placement: 'bottom-start', offsetDistance: 8 }" :ui="{ content: 'bg-CustomColor-900 border-dashcolor/50 border-[0.1px] rounded-none shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] border-dashed ring-0 overflow-hidden', width: 'w-[400px] sm:w-[600px]' }">
          <template #default="{ open }">
            <div class="w-full max-w-md">
              <CUInput
                v-model="articleSearch"
                placeholder="Rechercher et cliquer pour ajouter..."
                :logo-name="searching ? 'i-lucide-loader-circle' : 'i-lucide-search'"
                @input="searchArticles"
              />
            </div>
          </template>

          <template #content>
            <UScrollArea v-if="articleResults.length" class="h-60">
              <div class="flex flex-col">
                <button
                  v-for="article in articleResults"
                  :key="article.id"
                  class="w-full text-left px-4 py-3 text-sm hover:bg-primary/10 transition-colors border-b border-dashed border-dashcolor/30 last:border-0 group flex items-center justify-between gap-4"
                  @click="addStepImmediately(article)"
                >
                  <div class="flex flex-col min-w-0">
                    <span class="font-bold text-white group-hover:text-primary transition-colors truncate">{{ article.title }}</span>
                    <span class="text-zinc-500 text-xs mt-0.5 truncate">{{ article.slug }}</span>
                  </div>
                  <div class="shrink-0">
                    <UIcon v-if="isAlreadyInPath(article.id)" name="i-lucide-check-circle" class="w-5 h-5 text-green-500" />
                    <UIcon v-else name="i-lucide-plus-circle" class="w-5 h-5 text-zinc-600 group-hover:text-primary" />
                  </div>
                </button>
              </div>
            </UScrollArea>
            <div v-else-if="articleSearch && !searching" class="p-4 text-sm text-zinc-500 italic bg-CustomColor-900">
              Aucun article trouvé pour "{{ articleSearch }}"
            </div>
          </template>
        </UPopover>
      </div>
    </div>

    <!-- Steps list with Draggable -->
    <div v-if="path?.steps.length">
      <AdminCUDraggableList v-model="stepsList" @reorder="handleReorder">
        <template #default="{ element: step }">
          <div class="min-w-0">
            <p class="font-medium text-sm text-white truncate">{{ step.stepTitle ?? step.article.title }}</p>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs text-zinc-500 truncate">{{ step.article.slug }}</span>
            </div>
          </div>
        </template>
        <template #actions="{ element: step }">
          <CUButton size="xs" logo-name="i-lucide-trash" class="hover:text-red-500" @click="deleteStep(step.id)" />
        </template>
      </AdminCUDraggableList>
    </div>

    <div v-else class="border-[0.1px] border-dashed border-dashcolor/50 p-8 text-center text-sm text-zinc-500">
      Aucune étape dans ce parcours. Recherchez des articles ci-dessus pour en ajouter.
    </div>
  </div>
</template>
