<script setup lang="ts">
const route = useRoute()
const router = useRouter()

interface TagArticle {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImageUrl: string | null
  publishedAt: string | null
  author: { name: string, image: string | null }
  _count: { comments: number, likes: number }
}

interface Tag {
  id: string
  slug: string
  name: string
  articles: {
    data: TagArticle[]
    meta: { page: number, limit: number, total: number, totalPages: number }
  }
}

const page = ref(Number(route.query.page) || 1)

const { data: tagData, error } = await useFetch<{ data: Tag }>(`/api/tags/${route.params.slug}`, {
  query: computed(() => ({ page: page.value, limit: 9 }))
})

if (error.value) throw createError({ statusCode: 404, statusMessage: 'Tag introuvable' })

const tag = computed(() => tagData.value?.data ?? null)
const articles = computed(() => tag.value?.articles?.data ?? [])
const totalPages = computed(() => tag.value?.articles?.meta?.totalPages ?? 1)

useSeoMeta({
  title: () => `#${tag.value?.name ?? 'Tag'} — StackTrace`,
  description: () => `Articles taggés ${tag.value?.name}`
})

function changePage(p: number) {
  page.value = p
  router.push({ query: { page: p > 1 ? p : undefined }, replace: true })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function normalizeArticle(a: TagArticle) {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    description: a.excerpt,
    coverImage: a.coverImageUrl,
    publishedAt: a.publishedAt,
    author: a.author,
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
          <span class="text-[#0F0F0F] dark:text-[#F3F4F6]">#{{ tag?.name }}</span>
        </nav>

        <!-- Tag header -->
        <div
          class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 sm:p-8 mb-10 flex items-center gap-3"
        >
          <span class="text-3xl font-bold text-primary">#</span>
          <div>
            <h1 class="text-[24px] sm:text-[32px] font-bold text-[#0F0F0F] dark:text-[#FFFFFF]">
              {{ tag?.name }}
            </h1>
            <p class="text-xs text-zinc-500 mt-1">
              {{ tag?.articles?.meta?.total ?? 0 }} article{{
                (tag?.articles?.meta?.total ?? 0) > 1 ? 's' : ''
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
            name="i-lucide-tag"
            class="w-12 h-12"
          />
          <p>Aucun article pour ce tag.</p>
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
