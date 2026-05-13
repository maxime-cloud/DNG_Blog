<script setup lang="ts">
const route = useRoute()
const router = useRouter()

interface CategoryArticle {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImageUrl: string | null
  publishedAt: string | null
  author: { name: string, image: string | null }
  _count: { comments: number, likes: number }
}

interface Category {
  id: string
  slug: string
  name: string
  description: string | null
  color: string | null
  imageUrl: string | null
  articles: {
    data: CategoryArticle[]
    meta: { page: number, limit: number, total: number, totalPages: number }
  }
}

const page = ref(Number(route.query.page) || 1)

const { data: categoryData, error } = await useFetch<{ data: Category }>(
  `/api/categories/${route.params.slug}`,
  { query: computed(() => ({ page: page.value, limit: 9 })) }
)

if (error.value) throw createError({ statusCode: 404, statusMessage: 'Catégorie introuvable' })

const category = computed(() => categoryData.value?.data ?? null)
const articles = computed(() => category.value?.articles?.data ?? [])
const totalPages = computed(() => category.value?.articles?.meta?.totalPages ?? 1)

useSeoMeta({
  title: () => `${category.value?.name ?? 'Catégorie'} — StackTrace`,
  description: () =>
    category.value?.description ?? `Articles de la catégorie ${category.value?.name}`
})

function changePage(p: number) {
  page.value = p
  router.push({ query: { page: p > 1 ? p : undefined }, replace: true })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function normalizeArticle(a: CategoryArticle) {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    description: a.excerpt,
    coverImage: a.coverImageUrl,
    publishedAt: a.publishedAt,
    author: a.author,
    category: {
      name: category.value?.name ?? '',
      slug: category.value?.slug ?? '',
      color: category.value?.color ?? null
    },
    likesCount: a._count.likes,
    _count: { comments: a._count.comments }
  }
}
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="pt-10 mb-10 px-4">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <NuxtLink
            to="/"
            class="hover:text-[#0F0F0F] dark:hover:text-[#F3F4F6] transition-colors"
          >
            Accueil
          </NuxtLink>
          <UIcon
            name="i-lucide-chevron-right"
            class="w-3 h-3"
          />
          <NuxtLink
            to="/categories"
            class="hover:text-[#0F0F0F] dark:hover:text-[#F3F4F6] transition-colors"
          >
            Catégories
          </NuxtLink>
          <UIcon
            name="i-lucide-chevron-right"
            class="w-3 h-3"
          />
          <span class="text-[#0F0F0F] dark:text-[#F3F4F6] truncate max-w-[200px]">
            {{ category?.name }}
          </span>
        </nav>

        <!-- Category header -->
        <div
          class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 sm:p-8 mb-10 flex items-center gap-4"
        >
          <img
            v-if="category?.imageUrl"
            :src="category.imageUrl"
            :alt="category.name"
            class="w-12 h-12 object-contain"
          >
          <div class="flex-1">
            <h1
              class="text-[24px] sm:text-[32px] font-bold text-[#0F0F0F] dark:text-[#FFFFFF] leading-tight"
              :style="category?.color ? `color: ${category.color}` : ''"
            >
              {{ category?.name }}
            </h1>
            <p
              v-if="category?.description"
              class="text-sm text-[#0F0F0F]/60 dark:text-[#F3F4F6]/60 mt-1"
            >
              {{ category.description }}
            </p>
            <p class="text-xs text-zinc-500 mt-2">
              {{ category?.articles?.meta?.total ?? 0 }} article{{
                (category?.articles?.meta?.total ?? 0) > 1 ? 's' : ''
              }}
            </p>
          </div>
        </div>

        <!-- Articles grid -->
        <div
          v-if="articles.length"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <ArticleCard
            v-for="article in articles"
            :key="article.id"
            :article="normalizeArticle(article)"
          />
        </div>

        <!-- Empty -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4"
        >
          <UIcon
            name="i-lucide-file-x"
            class="w-12 h-12"
          />
          <p>Aucun article dans cette catégorie.</p>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="mt-10"
        >
          <Pagination
            :current-page="page"
            :total-pages="totalPages"
            :on-page-change="changePage"
          />
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
