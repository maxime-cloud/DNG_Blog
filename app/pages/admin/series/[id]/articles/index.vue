<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const { confirm } = useConfirm()
const { success, error: toastError } = useAppToast()
const seriesId = Number(route.params.id)

interface Article {
  id: number
  title: string
  slug: string
  status: string
  seriesOrder: number | null
}

interface Series {
  id: number
  title: string
  articles: Article[]
}

const { data, refresh } = await useAsyncData<{ data: Series }>(
  `admin-series-${seriesId}`,
  () => $fetch(`/api/admin/series/${seriesId}`)
)
const series = computed(() => data.value?.data ?? null)

const articlesList = ref<Article[]>([])
watch(() => series.value?.articles, (newArticles) => {
  if (newArticles) articlesList.value = [...newArticles]
}, { immediate: true })

useSeoMeta({ title: computed(() => `Articles — ${series.value?.title ?? ''}`) })

const articleSearch = ref('')
const articleResults = ref<{ id: number, title: string, slug: string }[]>([])
const searching = ref(false)
const addingId = ref<number | null>(null)

async function searchArticles() {
  if (!articleSearch.value.trim()) {
    articleResults.value = []
    return
  }
  searching.value = true
  try {
    const res = await $fetch<{ data: { id: number, title: string, slug: string }[] }>(
      '/api/admin/articles',
      {
        query: { search: articleSearch.value, limit: 10 }
      }
    )
    articleResults.value = res.data ?? []
  } finally {
    searching.value = false
  }
}

function isAlreadyInSeries(articleId: number) {
  return articlesList.value.some(a => a.id === articleId)
}

async function addArticleToSeries(article: { id: number, title: string, slug: string }) {
  if (isAlreadyInSeries(article.id)) {
    toastError('Article déjà présent')
    return
  }

  addingId.value = article.id
  try {
    const nextOrder = articlesList.value.length + 1
    
    // Correct API endpoint for updating an article
    await $fetch(`/api/articles/${article.id}`, {
      method: 'PATCH',
      body: { 
        seriesId, 
        seriesOrder: nextOrder 
      }
    })
    
    await refresh()
    success(`"${article.title}" ajouté`)
  } catch (error: any) {
    console.error('Add to series error:', error)
    toastError(error.data?.statusMessage || 'Erreur lors de l\'ajout')
  } finally {
    addingId.value = null
  }
}

async function removeArticleFromSeries(articleId: number) {
  if (!await confirm('Retirer cet article de la série ?')) return
  try {
    await $fetch(`/api/articles/${articleId}`, {
      method: 'PATCH',
      body: { seriesId: null, seriesOrder: null }
    })
    await refresh()
    success('Article retiré de la série')
  } catch {
    toastError('Erreur lors du retrait')
  }
}

async function handleReorder(newList: Article[]) {
  try {
    const reorderedArticles = newList.map((article, index) => ({
      id: article.id,
      seriesOrder: index + 1
    }))

    await $fetch(`/api/admin/series/${seriesId}/reorder`, {
      method: 'PATCH',
      body: { articles: reorderedArticles }
    })
    
    success('Ordre mis à jour')
  } catch {
    toastError('Erreur lors de la mise à jour de l\'ordre')
    refresh()
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink
        :to="`/admin/series/${seriesId}`"
        class="text-zinc-500 hover:text-white transition-colors"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="w-4 h-4"
        />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-white">
          Articles de la série
        </h1>
        <p
          v-if="series"
          class="text-sm text-zinc-500 mt-0.5"
        >
          {{ series.title }}
        </p>
      </div>
    </div>

    <!-- Multi-Add section -->
    <div
      class="border-[0.1px] border-dashed border-dashcolor/50 p-4 mb-6 space-y-4 bg-CustomColor-900 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)]"
    >
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
          Ajouter des articles
        </p>
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
                  :disabled="addingId === article.id"
                  @click.stop="addArticleToSeries(article)"
                >
                  <div class="flex flex-col min-w-0">
                    <span class="font-bold text-white group-hover:text-primary transition-colors truncate">{{ article.title }}</span>
                    <span class="text-zinc-500 text-xs mt-0.5 truncate">{{ article.slug }}</span>
                  </div>
                  <div class="shrink-0">
                    <UIcon v-if="addingId === article.id" name="i-lucide-loader-circle" class="w-5 h-5 text-primary animate-spin" />
                    <UIcon v-else-if="isAlreadyInSeries(article.id)" name="i-lucide-check-circle" class="w-5 h-5 text-green-500" />
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

    <!-- Articles list with Draggable -->
    <div v-if="series?.articles.length">
      <AdminCUDraggableList
        v-model="articlesList"
        @reorder="handleReorder"
      >
        <template #default="{ element: article }">
          <div class="min-w-0">
            <p class="font-medium text-sm text-white truncate">
              {{ article.title }}
            </p>
            <div class="flex items-center gap-2 mt-0.5">
              <UBadge
                :label="article.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'"
                size="xs"
                variant="subtle"
              />
              <span class="text-xs text-zinc-500 truncate">
                {{ article.slug }}
              </span>
            </div>
          </div>
        </template>
        <template #actions="{ element: article }">
          <CUButton
            size="xs"
            logo-name="i-lucide-trash"
            class="hover:text-red-500"
            @click="removeArticleFromSeries(article.id)"
          />
        </template>
      </AdminCUDraggableList>
    </div>

    <div
      v-else
      class="border-[0.1px] border-dashed border-dashcolor/50 p-8 text-center text-sm text-zinc-500"
    >
      Aucun article dans cette série. Recherchez des articles ci-dessus pour en ajouter.
    </div>
  </div>
</template>
