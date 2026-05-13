<script setup lang="ts">
import { useQuery, keepPreviousData } from '@tanstack/vue-query'
import { queryKeys } from '~/composables/queryKeys'

useSeoMeta({
  title: 'Articles — StackTrace',
  description:
    'Tutoriels pratiques et guides techniques en développement web, réseau informatique et Linux.'
})

const route = useRoute()
const router = useRouter()

const sortOptions = [
  { label: 'Plus récents', value: 'date' },
  { label: 'Plus populaires', value: 'popular' },
  { label: 'Tendance', value: 'trending' }
]

const filters = reactive({
  search: (route.query.search as string) || '',
  category: (route.query.category as string) || '',
  sort: (route.query.sort as string) || 'date',
  page: Number(route.query.page) || 1
})

const searchInput = ref(filters.search)

const debouncedSearch = useDebounceFn((val: string) => {
  filters.search = val
  filters.page = 1
}, 400)

interface ArticleAuthor {
  name: string
  image: string | null
}

interface ArticleCategory {
  name: string
  slug: string
  color: string | null
}

interface ArticleListItem {
  id: string
  slug: string
  title: string
  description: string | null
  coverImage: string | null
  publishedAt: string | null
  author: ArticleAuthor
  category: ArticleCategory | null
  tags: ArticleCategory[]
  likesCount: number
  _count: { comments: number }
}

interface ArticlesMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface ArticlesResponse {
  data: ArticleListItem[]
  meta: ArticlesMeta
}

function syncUrl(newFilters: typeof filters) {
  const query: Record<string, string | undefined> = {}
  if (newFilters.search) query.search = newFilters.search
  if (newFilters.category) query.category = newFilters.category
  if (newFilters.sort && newFilters.sort !== 'date') query.sort = newFilters.sort
  if (newFilters.page > 1) query.page = String(newFilters.page)
  router.replace({ query })
}

watch(searchInput, val => debouncedSearch(val))
watch(filters, syncUrl, { deep: true })

const { data: categoriesData } = await useFetch<{
  data: {
    name: string
    slug: string
    color: string | null
    imageUrl: string | null
    _count: { articles: number }
  }[]
}>('/api/categories')
const categories = computed(() => categoriesData.value?.data ?? [])

const activeCategoryName = computed(
  () => categories.value.find(c => c.slug === filters.category)?.name ?? ''
)

const queryFilters = computed(() => ({
  page: filters.page,
  limit: 9,
  category: filters.category || undefined,
  search: filters.search || undefined,
  sort: filters.sort
}))

const { data, isPending, isError, refetch } = useQuery({
  queryKey: computed(() => queryKeys.articles.list(queryFilters.value as Record<string, unknown>)),
  queryFn: () => $fetch<ArticlesResponse>('/api/articles', { params: queryFilters.value }),
  placeholderData: keepPreviousData
})

const articles = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)

const hasActiveFilters = computed(() => !!(filters.search || filters.category))

function changeCategory(slug: string) {
  filters.category = filters.category === slug ? '' : slug
  filters.page = 1
}

function clearCategory() {
  filters.category = ''
  filters.page = 1
}

function resetAllFilters() {
  filters.search = ''
  filters.category = ''
  filters.sort = 'date'
  filters.page = 1
  searchInput.value = ''
}

function clearSearch() {
  searchInput.value = ''
  filters.search = ''
  filters.page = 1
}

const gridRef = ref<HTMLElement | null>(null)

function changePage(p: number) {
  filters.page = p
  nextTick(() => {
    gridRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="pt-10 mb-10 px-4">
        <!-- Header -->
        <div class="mb-8">
          <SectionTitle label="Articles" />
          <p class="text-sm text-[#0F0F0F]/60 dark:text-[#F3F4F6]/60 mt-2">
            Tutoriels pratiques, guides techniques et retours d'expérience.
          </p>
          <p v-if="meta" class="text-xs text-zinc-500 mt-1">
            {{ meta.total }} article{{ meta.total > 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Search + sort -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <div class="relative flex-1">
            <CUInput
              v-model="searchInput"
              placeholder="Rechercher un article..."
              :leading-icon="'i-lucide-search'"
              class="w-full"
            />
            <button
              v-if="searchInput"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              @click="clearSearch"
            >
              <UIcon name="i-lucide-x" class="w-4 h-4" />
            </button>
          </div>

          <USelect
            v-model="filters.sort"
            :options="sortOptions"
            value-key="value"
            label-key="label"
            :ui="{
              base: 'bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-CustomColor-900/30 dark:border-dashcolor/50 rounded-none shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]'
            }"
            @change="filters.page = 1"
          />
        </div>

        <!-- Category filters -->
        <div class="flex flex-wrap gap-2 mb-4">
          <CUButton
            :style="
              !filters.category
                ? 'border: 0.1px solid oklch(70.7% 0.165 254.624 / 0.5); color: oklch(70.7% 0.165 254.624)'
                : ''
            "
            label="Tous"
            size="md"
            @click="clearCategory"
          />
          <CUButton
            v-for="cat in categories"
            :key="cat.slug"
            :avatar="
              cat.imageUrl
                ? { class: 'rounded-none', src: cat.imageUrl, loading: 'lazy' }
                : undefined
            "
            :style="
              filters.category === cat.slug
                ? `border: 0.1px solid ${cat.color}; color: ${cat.color}`
                : ''
            "
            :label="cat.name"
            size="md"
            @click="changeCategory(cat.slug)"
          />
        </div>

        <!-- Active filter chips -->
        <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 mb-6">
          <div
            v-if="filters.category"
            class="flex items-center gap-1 text-xs border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 px-2 py-1 text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70"
          >
            <span>Catégorie : {{ activeCategoryName }}</span>
            <button class="ml-1 hover:text-red-400" @click="clearCategory">
              <UIcon name="i-lucide-x" class="w-3 h-3" />
            </button>
          </div>

          <div
            v-if="filters.search"
            class="flex items-center gap-1 text-xs border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 px-2 py-1 text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70"
          >
            <span>Recherche : "{{ filters.search }}"</span>
            <button class="ml-1 hover:text-red-400" @click="clearSearch">
              <UIcon name="i-lucide-x" class="w-3 h-3" />
            </button>
          </div>

          <CUButton label="Tout effacer" size="xs" variant="ghost" @click="resetAllFilters" />
        </div>

        <!-- Grid anchor -->
        <div ref="gridRef" />

        <!-- Loading -->
        <SkeletonsArticleGridSkeleton v-if="isPending" :count="9" />

        <!-- Error -->
        <div
          v-else-if="isError"
          class="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4"
        >
          <UIcon name="i-lucide-wifi-off" class="w-12 h-12" />
          <p class="text-base">Impossible de charger les articles.</p>
          <CUButton label="Réessayer" @click="() => refetch()" />
        </div>

        <!-- Empty (filters active) -->
        <div
          v-else-if="articles.length === 0 && hasActiveFilters"
          class="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4"
        >
          <UIcon name="i-lucide-search-x" class="w-12 h-12" />
          <p class="text-base">Aucun article ne correspond à votre recherche.</p>
          <CUButton label="Effacer les filtres" @click="resetAllFilters" />
        </div>

        <!-- Empty (no articles) -->
        <div
          v-else-if="articles.length === 0"
          class="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4"
        >
          <UIcon name="i-lucide-file-x" class="w-12 h-12" />
          <p class="text-base">Aucun article publié pour le moment.</p>
        </div>

        <!-- Articles grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
        </div>

        <!-- Pagination -->
        <div v-if="meta && meta.totalPages > 1" class="mt-10">
          <Pagination
            :current-page="filters.page"
            :total-pages="meta.totalPages"
            :on-page-change="changePage"
          />
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
