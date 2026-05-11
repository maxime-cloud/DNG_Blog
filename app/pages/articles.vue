<script setup lang="ts">
useSeoMeta({
  title: 'Articles — StackTrace',
  description: 'Tous les articles du blog StackTrace'
})

const route = useRoute()
const router = useRouter()

const page = ref(Number(route.query.page) || 1)
const selectedCategory = ref<string | undefined>((route.query.ct as string) || undefined)

const { data: categoriesData } = await useFetch<{
  data: {
    name: string
    slug: string
    color: string | null
    colorb: string | null
    imageUrl: string | null
  }[]
}>('/api/categories')
const categories = computed(() => categoriesData.value?.data ?? [])

const {
  data: articlesData,
  pending,
  refresh
} = await useFetch<{
  data: {
    id: string
    slug: string
    title: string
    description: string | null
    coverImage: string | null
    publishedAt: string | null
    author: { name: string; image: string | null }
    category: { name: string; slug: string; color: string | null } | null
    tags: { name: string; slug: string }[]
    likesCount: number
    _count: { comments: number }
  }[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}>('/api/articles', {
  query: computed(() => ({
    page: page.value,
    limit: 9,
    category: selectedCategory.value
  }))
})

const articles = computed(() => articlesData.value?.data ?? [])
const totalPages = computed(() => articlesData.value?.meta?.totalPages ?? 1)

function changeCategory(slug: string | undefined) {
  selectedCategory.value = slug
  page.value = 1
  router.push({
    query: { ct: slug || undefined, page: undefined },
    replace: true
  })
}

function changePage(p: number) {
  page.value = p
  router.push({ query: { ...route.query, page: p > 1 ? p : undefined }, replace: true })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => route.query.ct,
  val => {
    selectedCategory.value = val as string | undefined
  }
)
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="pt-10 mb-10 px-4">
        <SectionTitle label="Articles">
          <NuxtLink to="/search">
            <CUButton
              label="Rechercher"
              class="md:flex hidden"
              size="lg"
              logo-position="left"
              logo-name="i-lucide-search"
            />
          </NuxtLink>
        </SectionTitle>

        <!-- Category filters -->
        <div class="flex flex-wrap gap-2 mt-6 mb-8">
          <CUButton
            :style="
              !selectedCategory
                ? 'border: 0.1px solid oklch(70.7% 0.165 254.624/ 0.5); color: oklch(70.7% 0.165 254.624)'
                : ''
            "
            label="Tous"
            size="md"
            @click="changeCategory(undefined)"
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
              selectedCategory === cat.slug
                ? `border: 0.1px solid ${cat.colorb ?? cat.color}; color: ${cat.color}`
                : ''
            "
            :label="cat.name"
            size="md"
            @click="changeCategory(cat.slug)"
          />
        </div>

        <!-- Loading -->
        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="i in 9"
            :key="i"
            class="h-80 bg-[#EEE] dark:bg-[#111] border-[0.1px] border-dashed border-primary/20 dark:border-dashcolor/30 animate-pulse"
          />
        </div>

        <!-- Articles grid -->
        <div
          v-else-if="articles.length"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4">
          <UIcon name="i-lucide-file-x" class="w-12 h-12" />
          <p class="text-base">Aucun article pour le moment.</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-10">
          <Pagination :current-page="page" :total-pages="totalPages" :on-page-change="changePage" />
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
