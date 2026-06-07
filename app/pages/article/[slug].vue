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
  content?: string | null
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
const { data: relatedArticles, pending: relatedPending } = await useAsyncData<ArticleDetail[]>(
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

// Fetch the article body parsed to MDC AST. Parsing happens server-side
// (see /api/articles/[slug]/content) so the Markdown processor never ships
// to the client — only the rendered AST does.
const { data: parsed } = await useAsyncData(`article-content-${slug}`, () =>
  $fetch(`/api/articles/${slug}/content`)
)

// Comments
const { comments, loading: commentsLoading, fetchComments } = useComments(slug)

const articleContent = useTemplateRef<HTMLElement>('articleContent')

onMounted(() => {
  fetchComments()
  addCopyButtons()
})

function addCopyButtons() {
  nextTick(() => {
    const container = articleContent.value
    if (!container) return

    container.querySelectorAll('pre').forEach(pre => {
      if (pre.querySelector('.copy-btn')) return

      const btn = document.createElement('button')
      btn.className = 'copy-btn'
      btn.setAttribute('aria-label', 'Copier')
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`

      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.innerText ?? pre.innerText
        await navigator.clipboard.writeText(code)
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
        btn.classList.add('copied')
        setTimeout(() => {
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`
          btn.classList.remove('copied')
        }, 2000)
      })

      pre.style.position = 'relative'
      pre.appendChild(btn)
    })
  })
}

function hasDistroNode(nodes: ContentNode[]): boolean {
  for (const node of nodes) {
    if (node.tag === 'distro-block' || node.component === 'DistroBlock') return true
    if (node.children && hasDistroNode(node.children)) return true
  }
  return false
}

interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

// Extract headings (h2/h3) from the parsed Markdown toc for TableOfContents
const headings = computed<Heading[]>(() => {
  const links = (parsed.value as { toc?: { links?: TocLink[] } } | null)?.toc?.links
  if (!links) return []
  const result: Heading[] = []
  const walk = (items: TocLink[]) => {
    for (const item of items) {
      if (item.depth === 2 || item.depth === 3) {
        result.push({ id: item.id, text: item.text, depth: item.depth as 2 | 3 })
      }
      if (item.children?.length) walk(item.children)
    }
  }
  walk(links)
  return result
})

// Reading time estimated from the Markdown word count (~200 words/min)
const readingTime = computed<string | null>(() => {
  const text = article.value?.content
  if (!text) return null
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (!words) return null
  return `${Math.max(1, Math.ceil(words / 200))} min de lecture`
})

// Detect if article has distro-specific blocks
const hasDistroBlocks = computed<boolean>(() => {
  const body = (parsed.value as ContentWithBody | null)?.body
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
          <NuxtLink to="/" class="hover:text-[#F3F4F6] transition-colors"> Accueil </NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
          <NuxtLink to="/articles" class="hover:text-[#F3F4F6] transition-colors">
            Articles
          </NuxtLink>
          <template v-if="article?.category">
            <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
            <NuxtLink
              :to="`/categories/${article.category.slug}`"
              class="hover:text-[#F3F4F6] transition-colors"
            >
              {{ article.category.name }}
            </NuxtLink>
          </template>
          <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
          <span class="text-[#F3F4F6] truncate max-w-[200px]">
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
            class="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#FFFFFF] leading-tight mb-4"
          >
            {{ article?.title }}
          </h1>

          <!-- Description -->
          <p v-if="article?.description" class="text-base text-[#F3F4F6]/70 mb-4 max-w-3xl">
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
              <span class="text-[#F3F4F6]/70 font-medium">
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
                class="text-xs text-zinc-500 hover:text-white transition-colors"
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
            class="mb-8 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none overflow-hidden"
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
            v-if="article?.content"
            ref="articleContent"
            class="prose-article bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 sm:p-8 mb-6"
          >
            <ContentRenderer v-if="parsed" :value="parsed" />
          </div>

          <!-- Action bar -->
          <div
            class="flex flex-wrap items-center gap-3 py-4 px-4 mb-6 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none"
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
          <section v-if="relatedPending || relatedArticles?.length" class="mb-8">
            <h2 class="text-[24px] sm:text-[32px] font-bold text-[#FFFFFF] mb-4">
              Articles similaires
            </h2>
            
            <div v-if="relatedPending" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SkeletonsArticleCardSkeleton v-for="i in 2" :key="i" />
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            <h2 class="text-[24px] sm:text-[32px] font-bold text-[#FFFFFF] mb-4">Commentaires</h2>

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
                :comment="comment"
                :slug="slug"
                @deleted="fetchComments"
              />
            </div>

            <div
              v-else
              class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 text-center text-sm text-zinc-500"
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
              class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4"
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
                  <p class="text-sm font-semibold text-[#F3F4F6] truncate">
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
/* Article prose styles — dark mode only (texte clair par défaut) */
.prose-article :deep(h2),
.prose-article :deep(h3) {
  color: #ffffff;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  scroll-margin-top: 5rem;
}

.prose-article :deep(h2) {
  font-size: 1.5rem;
}

.prose-article :deep(h3) {
  font-size: 1.25rem;
}

.prose-article :deep(p) {
  color: rgba(243, 244, 246, 0.85);
  line-height: 1.75;
  margin-bottom: 1.25rem;
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
  color: rgba(243, 244, 246, 0.85);
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
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
  border-left: 2px dashed rgba(229, 231, 235, 0.27);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: rgba(243, 244, 246, 0.6);
  font-style: italic;
}

.prose-article :deep(hr) {
  border: none;
  border-top: 0.1px dashed rgba(229, 231, 235, 0.27);
  margin: 2rem 0;
}

.prose-article :deep(strong) {
  font-weight: 700;
  color: #ffffff;
}

.prose-article :deep(code:not(pre code)) {
  font-size: 0.85em;
  padding: 0.15em 0.35em;
  color: rgba(243, 244, 246, 0.9);
  background-color: rgba(255, 255, 255, 0.07);
  border: 0.1px solid rgba(229, 231, 235, 0.2);
  border-radius: 0;
}

.prose-article :deep(pre) {
  margin: 1.5rem 0;
  padding: 1.25rem;
  border: 0.1px dashed rgba(229, 231, 235, 0.27);
  box-shadow:
    6px -7px 24px 0px rgb(0, 0, 0, 0.51),
    -6px 7px 24px 0px rgb(0, 0, 0, 0.51),
    0px -4px 4px 0px rgb(0, 0, 0, 0.51);
  position: relative;
}

.prose-article :deep(.copy-btn) {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(255, 255, 255, 0.08);
  border: 0.1px solid rgba(229, 231, 235, 0.2);
  color: rgba(229, 231, 235, 0.7);
  cursor: pointer;
  transition: all 0.15s ease;
  opacity: 0.6;
}

.prose-article :deep(pre:hover .copy-btn) {
  opacity: 1;
}

.prose-article :deep(.copy-btn:hover) {
  background: oklch(62.7% 0.194 149.214 / 0.2);
  border-color: oklch(62.7% 0.194 149.214 / 0.5);
  color: #fff;
}

.prose-article :deep(.copy-btn.copied) {
  color: oklch(62.7% 0.194 149.214);
  border-color: oklch(62.7% 0.194 149.214 / 0.4);
}

.prose-article :deep(img) {
  width: 100%;
  max-width: 100%;
  height: auto;
  border: 0.1px dashed rgba(229, 231, 235, 0.27);
  margin: 1.5rem 0;
}

.prose-article :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.875rem;
}

.prose-article :deep(th),
.prose-article :deep(td) {
  border: 0.1px dashed rgba(229, 231, 235, 0.27);
  color: rgba(243, 244, 246, 0.85);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.prose-article :deep(th) {
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.04);
}
</style>
