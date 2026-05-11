<script setup lang="ts">
definePageMeta({ name: 'article-detail' })

const route = useRoute()
const { fetchArticle, fetchRelated } = useArticles()
const { trackView } = useAnalytics()

interface ArticleCategory {
  id: number
  name: string
  slug: string
  color?: string
}

interface ArticleTag {
  id: number
  name: string
  slug: string
}

interface ArticleAuthor {
  id: string
  name: string
  image?: string | null
}

interface SeriesArticle {
  id: number
  slug: string
  title: string
  seriesOrder: number
}

interface ArticleSeries {
  id: number
  title: string
  slug: string
  articles?: SeriesArticle[]
}

interface ArticleDetail {
  id: string
  slug: string
  title: string
  description?: string
  coverImage?: string | null
  publishedAt?: string | null
  author?: ArticleAuthor | null
  category?: ArticleCategory | null
  tags?: ArticleTag[]
  series?: ArticleSeries | null
  seriesOrder?: number | null
  likesCount: number
}

interface LikeStatus {
  count: number
  liked: boolean
}

interface Heading {
  id: string
  text: string
  depth: 2 | 3
}

interface ContentNode {
  tag?: string
  type?: string
  value?: string
  props?: Record<string, unknown>
  children?: ContentNode[]
  component?: string
}

interface ContentBody {
  children: ContentNode[]
}

interface ContentWithBody {
  body?: ContentBody
  readingTime?: { text: string }
}

const slug = route.params.slug as string

// Fetch article metadata
const { data: article, error } = await useAsyncData<ArticleDetail>(
  `article-${slug}`,
  () => fetchArticle(slug) as Promise<ArticleDetail>
)

// Fetch likes status
const { data: likeStatus } = await useAsyncData<LikeStatus>(`article-likes-${slug}`, () =>
  $fetch<LikeStatus>(`/api/articles/${slug}/likes`)
)

// Fetch related articles
const { data: relatedArticles } = await useAsyncData<ArticleDetail[]>(
  `article-related-${slug}`,
  () => fetchRelated(slug) as Promise<ArticleDetail[]>
)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
}

// Track view server-side
if (import.meta.server) {
  await trackView(slug)
}

// Nuxt Content v3 — fetch the Markdown content
const { data: content } = await useAsyncData(`article-content-${slug}`, () =>
  queryCollection('blog').path(`/blog/${slug}`).first()
)

// Comments
const { comments, loading: commentsLoading, fetchComments } = useComments(slug)
onMounted(() => {
  fetchComments()
})

function extractHeadings(nodes: ContentNode[]): Heading[] {
  const result: Heading[] = []
  for (const node of nodes) {
    if ((node.tag === 'h2' || node.tag === 'h3') && node.props?.id) {
      const text = (node.children ?? [])
        .filter(c => c.type === 'text' || c.value)
        .map(c => c.value ?? c.children?.[0]?.value ?? '')
        .join('')
      result.push({
        id: node.props.id as string,
        text,
        depth: node.tag === 'h2' ? 2 : 3
      })
    }
  }
  return result
}

function hasDistroNode(nodes: ContentNode[]): boolean {
  for (const node of nodes) {
    if (node.tag === 'distro-block' || node.component === 'DistroBlock') return true
    if (node.children && hasDistroNode(node.children)) return true
  }
  return false
}

// Extract headings from content body for TableOfContents
const headings = computed<Heading[]>(() => {
  const body = (content.value as ContentWithBody | null)?.body
  if (!body?.children) return []
  return extractHeadings(body.children)
})

// Reading time from remark-reading-time
const readingTime = computed<string | null>(() => {
  return (content.value as ContentWithBody | null)?.readingTime?.text ?? null
})

// Detect if article has distro-specific blocks
const hasDistroBlocks = computed<boolean>(() => {
  const body = (content.value as ContentWithBody | null)?.body
  if (!body?.children) return false
  return hasDistroNode(body.children)
})

// Current page URL for share
const runtimeConfig = useRuntimeConfig()
const pageUrl = computed(() => {
  const origin = import.meta.client ? window.location.origin : ''
  const base = (runtimeConfig.public.siteUrl as string | undefined) ?? origin
  return `${base}/article/${slug}`
})

// Formatted date
function formatDate(dateStr?: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

useSeoMeta({
  title: () => article.value?.title ?? 'Article',
  description: () => article.value?.description ?? article.value?.title ?? '',
  ogTitle: () => article.value?.title ?? 'Article',
  ogImage: () => article.value?.coverImage ?? undefined
})
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="px-4 pt-10 pb-4">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <NuxtLink to="/" class="hover:text-[#0F0F0F] dark:hover:text-[#F3F4F6] transition-colors">
            Accueil
          </NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
          <NuxtLink
            to="/articles"
            class="hover:text-[#0F0F0F] dark:hover:text-[#F3F4F6] transition-colors"
          >
            Articles
          </NuxtLink>
          <template v-if="article?.category">
            <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
            <NuxtLink
              :to="`/categories/${article.category.slug}`"
              class="hover:text-[#0F0F0F] dark:hover:text-[#F3F4F6] transition-colors"
            >
              {{ article.category.name }}
            </NuxtLink>
          </template>
          <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
          <span class="text-[#0F0F0F] dark:text-[#F3F4F6] truncate max-w-[200px]">
            {{ article?.title }}
          </span>
        </nav>

        <!-- Article header -->
        <header class="mb-8">
          <!-- Category badge -->
          <div v-if="article?.category" class="mb-4">
            <NuxtLink :to="`/categories/${article.category.slug}`">
              <CUButton
                :label="article.category.name"
                size="sm"
                :style="
                  article.category.color
                    ? `color: ${article.category.color}; border-color: ${article.category.color}50`
                    : ''
                "
              />
            </NuxtLink>
          </div>

          <!-- Title -->
          <h1
            class="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#0F0F0F] dark:text-[#FFFFFF] leading-tight mb-4"
          >
            {{ article?.title }}
          </h1>

          <!-- Description -->
          <p
            v-if="article?.description"
            class="text-base text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70 mb-4 max-w-3xl"
          >
            {{ article.description }}
          </p>

          <!-- Meta row: author, date, reading time -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <!-- Author -->
            <div v-if="article?.author" class="flex items-center gap-2">
              <UAvatar
                :src="article.author.image ?? undefined"
                :alt="article.author.name"
                size="xs"
                class="rounded-none"
              />
              <span class="text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70 font-medium">
                {{ article.author.name }}
              </span>
            </div>

            <!-- Published date -->
            <div v-if="article?.publishedAt" class="flex items-center gap-1">
              <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
              <span>{{ formatDate(article.publishedAt) }}</span>
            </div>

            <!-- Reading time -->
            <div v-if="readingTime" class="flex items-center gap-1">
              <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
              <span>{{ readingTime }}</span>
            </div>

            <!-- Tags -->
            <div v-if="article?.tags?.length" class="flex items-center gap-1.5 flex-wrap">
              <NuxtLink
                v-for="tag in article.tags"
                :key="tag.slug"
                :to="`/tags/${tag.slug}`"
                class="text-xs text-zinc-500 hover:text-primary transition-colors"
              >
                #{{ tag.name }}
              </NuxtLink>
            </div>
          </div>
        </header>

        <!-- DistroSelector if article has distro blocks -->
        <div v-if="hasDistroBlocks" class="mb-6">
          <DistroSelector />
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="lg:flex lg:gap-8 px-4 pb-10">
        <!-- Main content -->
        <div class="flex-1 min-w-0">
          <!-- Cover image -->
          <div
            v-if="article?.coverImage"
            class="mb-8 bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none overflow-hidden"
          >
            <img
              :src="article.coverImage"
              :alt="article.title"
              class="w-full h-64 sm:h-80 lg:h-96 object-cover"
              loading="eager"
            />
          </div>

          <!-- Mobile: Table of Contents (before content) -->
          <div v-if="headings.length" class="mb-6 lg:hidden">
            <TableOfContents :headings="headings" />
          </div>

          <!-- Article content -->
          <div
            v-if="content"
            class="prose-article bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 sm:p-8 mb-6"
          >
            <ContentRenderer :value="content" />
          </div>

          <!-- Action bar -->
          <div
            class="flex flex-wrap items-center gap-3 py-4 px-4 mb-6 bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none"
          >
            <ArticleLikeButton
              v-if="article"
              :slug="article.slug"
              :initial-count="likeStatus?.count ?? article.likesCount ?? 0"
              :initial-liked="likeStatus?.liked ?? false"
            />
            <ArticleBookmarkButton v-if="article" :article-id="String(article.id)" />
            <div class="ml-auto">
              <ShareButtons :url="pageUrl" :title="article?.title ?? ''" />
            </div>
          </div>

          <!-- Series navigation -->
          <div v-if="article?.series?.articles?.length" class="mb-6">
            <SeriesNav
              :series="
                article.series as {
                  title: string
                  slug: string
                  articles: {
                    id: number
                    slug: string
                    title: string
                    seriesOrder: number
                  }[]
                }
              "
              :current-slug="slug"
            />
          </div>

          <!-- Related articles -->
          <section v-if="relatedArticles?.length" class="mb-8">
            <h2
              class="text-[24px] sm:text-[32px] font-bold text-[#0F0F0F] dark:text-[#FFFFFF] mb-4"
            >
              Articles similaires
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ArticleCard
                v-for="related in relatedArticles"
                :key="related.slug"
                :article="related"
                class="mx-0"
              />
            </div>
          </section>

          <!-- Comments section -->
          <section class="mb-8">
            <h2
              class="text-[24px] sm:text-[32px] font-bold text-[#0F0F0F] dark:text-[#FFFFFF] mb-4"
            >
              Commentaires
            </h2>

            <!-- Post a comment -->
            <div class="mb-6">
              <CommentForm :slug="slug" @submitted="fetchComments" />
            </div>

            <!-- Comments list -->
            <div v-if="commentsLoading" class="flex justify-center py-8">
              <UIcon name="i-lucide-loader-circle" class="w-6 h-6 text-zinc-500 animate-spin" />
            </div>

            <div v-else-if="comments.length" class="flex flex-col gap-4">
              <CommentItem
                v-for="comment in comments"
                :key="comment.id"
                :comment="comment as any"
                :slug="slug"
                @deleted="fetchComments"
              />
            </div>

            <div
              v-else
              class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 text-center text-sm text-zinc-500"
            >
              Aucun commentaire pour l'instant. Sois le premier !
            </div>
          </section>
        </div>

        <!-- Sidebar (desktop only) -->
        <aside class="hidden lg:block w-64 shrink-0">
          <div class="sticky top-20 flex flex-col gap-6">
            <!-- Table of contents -->
            <TableOfContents v-if="headings.length" :headings="headings" />

            <!-- Author card -->
            <div
              v-if="article?.author"
              class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4"
            >
              <p class="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                Auteur
              </p>
              <div class="flex items-center gap-3 mb-3">
                <UAvatar
                  :src="article.author.image ?? undefined"
                  :alt="article.author.name"
                  size="md"
                  class="rounded-none"
                />
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-[#0F0F0F] dark:text-[#F3F4F6] truncate">
                    {{ article.author.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>

<style scoped>
/* Article prose styles */
.prose-article :deep(h2),
.prose-article :deep(h3) {
  color: rgb(15, 15, 15);
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  scroll-margin-top: 5rem;
}

.dark .prose-article :deep(h2),
.dark .prose-article :deep(h3) {
  color: #ffffff;
}

.prose-article :deep(h2) {
  font-size: 1.5rem;
}

.prose-article :deep(h3) {
  font-size: 1.25rem;
}

.prose-article :deep(p) {
  color: rgba(15, 15, 15, 0.85);
  line-height: 1.75;
  margin-bottom: 1.25rem;
}

.dark .prose-article :deep(p) {
  color: rgba(243, 244, 246, 0.85);
}

.prose-article :deep(a) {
  color: rgb(59, 130, 246);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose-article :deep(a:hover) {
  opacity: 0.8;
}

.prose-article :deep(ul),
.prose-article :deep(ol) {
  color: rgba(15, 15, 15, 0.85);
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
}

.dark .prose-article :deep(ul),
.dark .prose-article :deep(ol) {
  color: rgba(243, 244, 246, 0.85);
}

.prose-article :deep(li) {
  margin-bottom: 0.25rem;
  line-height: 1.75;
}

.prose-article :deep(ul) {
  list-style-type: disc;
}

.prose-article :deep(ol) {
  list-style-type: decimal;
}

.prose-article :deep(blockquote) {
  border-left: 2px dashed rgba(15, 15, 15, 0.3);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: rgba(15, 15, 15, 0.6);
  font-style: italic;
}

.dark .prose-article :deep(blockquote) {
  border-left-color: rgba(229, 231, 235, 0.27);
  color: rgba(243, 244, 246, 0.6);
}

.prose-article :deep(hr) {
  border: none;
  border-top: 0.1px dashed rgba(15, 15, 15, 0.3);
  margin: 2rem 0;
}

.dark .prose-article :deep(hr) {
  border-top-color: rgba(229, 231, 235, 0.27);
}

.prose-article :deep(strong) {
  font-weight: 700;
  color: rgb(15, 15, 15);
}

.dark .prose-article :deep(strong) {
  color: #ffffff;
}

.prose-article :deep(code:not(pre code)) {
  font-size: 0.85em;
  padding: 0.15em 0.35em;
  background-color: rgba(15, 15, 15, 0.07);
  border: 0.1px solid rgba(15, 15, 15, 0.15);
  border-radius: 0;
}

.dark .prose-article :deep(code:not(pre code)) {
  background-color: rgba(255, 255, 255, 0.07);
  border-color: rgba(229, 231, 235, 0.2);
}

.prose-article :deep(pre) {
  margin: 1.5rem 0;
  border: 0.1px dashed rgba(229, 231, 235, 0.27);
  box-shadow:
    6px -7px 24px 0px rgb(0, 0, 0, 0.51),
    -6px 7px 24px 0px rgb(0, 0, 0, 0.51),
    0px -4px 4px 0px rgb(0, 0, 0, 0.51);
}

.prose-article :deep(img) {
  width: 100%;
  max-width: 100%;
  height: auto;
  border: 0.1px dashed rgba(15, 15, 15, 0.3);
  margin: 1.5rem 0;
}

.dark .prose-article :deep(img) {
  border-color: rgba(229, 231, 235, 0.27);
}

.prose-article :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.875rem;
}

.prose-article :deep(th),
.prose-article :deep(td) {
  border: 0.1px dashed rgba(15, 15, 15, 0.3);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.dark .prose-article :deep(th),
.dark .prose-article :deep(td) {
  border-color: rgba(229, 231, 235, 0.27);
  color: rgba(243, 244, 246, 0.85);
}

.prose-article :deep(th) {
  font-weight: 600;
  background-color: rgba(15, 15, 15, 0.04);
}

.dark .prose-article :deep(th) {
  background-color: rgba(255, 255, 255, 0.04);
}
</style>
