<script setup lang="ts">
const route = useRoute()
const { isLoggedIn } = useAuth()
const { markStepComplete, markStepIncomplete } = useLearningPaths()

const pathSlug = route.params.slug as string
const stepSlug = route.params.stepSlug as string

interface PathStep {
  id: number
  stepOrder: number
  stepTitle: string | null
  articleSlug: string | null
  isCompleted: boolean | null
}

interface StepArticle {
  id: number
  title: string
  slug: string
  excerpt: string | null
  coverImageUrl: string | null
  publishedAt: string | null
  author: { id: string; name: string; image: string | null } | null
  tags: { id: number; name: string; slug: string }[]
  categories: { id: number; name: string; slug: string }[]
}

interface StepData {
  path: {
    id: number
    title: string
    slug: string
    stepsCount: number
    steps: PathStep[]
  }
  step: {
    id: number
    stepOrder: number
    stepTitle: string | null
    isCompleted: boolean
    article: StepArticle
  }
  navigation: {
    prev: { stepOrder: number | null; stepTitle: string | null; articleSlug: string | null }
    next: { stepOrder: number | null; stepTitle: string | null; articleSlug: string | null }
  }
}

interface ContentNode {
  tag?: string
  type?: string
  value?: string
  props?: Record<string, unknown>
  children?: ContentNode[]
}

interface Heading {
  id: string
  text: string
  depth: 2 | 3
}

const { data: stepData, error } = await useFetch<{ data: StepData }>(
  `/api/learning-paths/${pathSlug}/steps/${stepSlug}`
)

if (error.value) throw createError({ statusCode: 404, statusMessage: 'Étape introuvable' })

const stepInfo = computed(() => stepData.value?.data ?? null)
const path = computed(() => stepInfo.value?.path ?? null)
const step = computed(() => stepInfo.value?.step ?? null)
const nav = computed(() => stepInfo.value?.navigation ?? null)

const { data: content } = await useAsyncData(`step-content-${stepSlug}`, () =>
  queryCollection('blog').path(`/blog/${stepSlug}`).first()
)

useSeoMeta({
  title: () =>
    step.value
      ? `${step.value.stepTitle ?? step.value.article.title} — ${path.value?.title} | StackTrace`
      : 'Étape',
  description: () => step.value?.article.excerpt ?? '',
  ogImage: () => step.value?.article.coverImageUrl ?? undefined
})

const isCompleted = ref(step.value?.isCompleted ?? false)
const toggling = ref(false)

async function toggleComplete() {
  if (!isLoggedIn.value || toggling.value || !step.value) return
  toggling.value = true
  const prev = isCompleted.value
  isCompleted.value = !prev
  try {
    if (prev) {
      await markStepIncomplete(pathSlug, step.value.id)
    } else {
      await markStepComplete(pathSlug, step.value.id)
    }
  } catch {
    isCompleted.value = prev
  } finally {
    toggling.value = false
  }
}

function extractHeadings(nodes: ContentNode[]): Heading[] {
  const result: Heading[] = []
  for (const node of nodes) {
    if ((node.tag === 'h2' || node.tag === 'h3') && node.props?.id) {
      const text = (node.children ?? [])
        .filter(c => c.type === 'text' || c.value)
        .map(c => c.value ?? (c.children as ContentNode[] | undefined)?.[0]?.value ?? '')
        .join('')
      result.push({ id: node.props.id as string, text, depth: node.tag === 'h2' ? 2 : 3 })
    }
  }
  return result
}

const headings = computed<Heading[]>(() => {
  const body = (content.value as { body?: { children: ContentNode[] } } | null)?.body
  if (!body?.children) return []
  return extractHeadings(body.children)
})

const readingTime = computed<string | null>(() => {
  return (content.value as { readingTime?: { text: string } } | null)?.readingTime?.text ?? null
})

const progressPercent = computed(() => {
  if (!path.value?.steps?.length) return 0
  const completed = path.value.steps.filter(s => s.isCompleted).length
  return Math.round((completed / path.value.steps.length) * 100)
})

function formatDate(dateStr?: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <!-- Path context bar -->
      <div
        class="sticky top-12 lg:top-16 z-40 bg-CustomColor-900 border-b border-dashed border-[0.1px] border-primary/20 border-dashcolor/40"
      >
        <div class="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
          <NuxtLink
            :to="`/training/${pathSlug}`"
            class="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors shrink-0"
          >
            <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5" />
            <span class="truncate max-w-[160px] sm:max-w-xs">{{ path?.title }}</span>
          </NuxtLink>

          <div class="ml-auto flex items-center gap-3 shrink-0">
            <span class="text-xs text-zinc-500 whitespace-nowrap">
              Étape {{ step?.stepOrder }} / {{ path?.stepsCount }}
            </span>
            <div
              class="hidden sm:block w-24 h-1 bg-[#F3F4F6]/10 border-[0.1px] border-dashed border-dashcolor/30 rounded-none overflow-hidden"
            >
              <div
                class="h-full bg-primary transition-all duration-500"
                :style="{ width: `${progressPercent}%` }"
              />
            </div>
            <span class="hidden sm:inline text-xs text-zinc-500">{{ progressPercent }}%</span>
          </div>
        </div>
      </div>

      <div class="px-4 pt-8 pb-4">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-zinc-500 mb-6 flex-wrap">
          <NuxtLink to="/" class="hover:text-[#F3F4F6] transition-colors"> Accueil </NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
          <NuxtLink to="/training" class="hover:text-[#F3F4F6] transition-colors">
            Parcours
          </NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
          <NuxtLink
            :to="`/training/${pathSlug}`"
            class="hover:text-[#F3F4F6] transition-colors truncate max-w-[120px]"
          >
            {{ path?.title }}
          </NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
          <span class="text-[#F3F4F6] truncate max-w-[160px]">
            {{ step?.stepTitle ?? step?.article.title }}
          </span>
        </nav>

        <!-- Step header -->
        <header class="mb-8">
          <div class="flex items-center gap-2 mb-3">
            <span
              class="inline-flex items-center justify-center w-7 h-7 text-xs font-bold bg-primary/10 border-[0.1px] border-dashed border-primary/40 text-primary rounded-none"
            >
              {{ step?.stepOrder }}
            </span>
            <span class="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Étape {{ step?.stepOrder }}
            </span>
          </div>

          <h1
            class="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#FFFFFF] leading-tight mb-4"
          >
            {{ step?.stepTitle ?? step?.article.title }}
          </h1>

          <p v-if="step?.article.excerpt" class="text-base text-[#F3F4F6]/70 mb-4 max-w-3xl">
            {{ step.article.excerpt }}
          </p>

          <div class="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <div v-if="step?.article.author" class="flex items-center gap-2">
              <UAvatar
                :src="step.article.author.image ?? undefined"
                :alt="step.article.author.name"
                size="xs"
                class="rounded-none"
              />
              <span class="text-[#F3F4F6]/70 font-medium">
                {{ step.article.author.name }}
              </span>
            </div>
            <div v-if="step?.article.publishedAt" class="flex items-center gap-1">
              <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
              <span>{{ formatDate(step.article.publishedAt) }}</span>
            </div>
            <div v-if="readingTime" class="flex items-center gap-1">
              <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
              <span>{{ readingTime }}</span>
            </div>
          </div>
        </header>
      </div>

      <!-- Two-column layout -->
      <div class="lg:flex lg:gap-8 px-4 pb-10">
        <!-- Main content -->
        <div class="flex-1 min-w-0">
          <!-- Cover image -->
          <div
            v-if="step?.article.coverImageUrl"
            class="mb-8 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none overflow-hidden"
          >
            <img
              :src="step.article.coverImageUrl"
              :alt="step.article.title"
              class="w-full h-64 sm:h-80 lg:h-96 object-cover"
              loading="eager"
            />
          </div>

          <!-- Mobile: Table of Contents -->
          <div v-if="headings.length" class="mb-6 lg:hidden">
            <TableOfContents :headings="headings" />
          </div>

          <!-- Article content -->
          <div
            v-if="content"
            class="prose-article bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 sm:p-8 mb-6"
          >
            <ContentRenderer :value="content" />
          </div>

          <div
            v-else
            class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 sm:p-8 mb-6 text-center text-sm text-zinc-500"
          >
            Contenu non disponible.
          </div>

          <!-- Mark complete button -->
          <div
            class="mb-6 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4 flex items-center justify-between gap-4"
          >
            <div class="flex items-center gap-2 text-sm text-zinc-500">
              <UIcon name="i-lucide-trophy" class="w-4 h-4" />
              <span>Progression du parcours</span>
            </div>

            <UTooltip v-if="!isLoggedIn" text="Connectez-vous pour suivre votre progression">
              <CUButton label="Marquer comme terminé" logo-name="i-lucide-check" disabled />
            </UTooltip>

            <CUButton
              v-else-if="!isCompleted"
              label="Marquer comme terminé"
              logo-name="i-lucide-check"
              :loading="toggling"
              @click="toggleComplete"
            />

            <CUButton
              v-else
              label="Étape terminée"
              logo-name="i-lucide-check-circle"
              :loading="toggling"
              class="border-green-500/40 text-green-500"
              @click="toggleComplete"
            />
          </div>

          <!-- Bottom navigation -->
          <div class="flex gap-3 mb-8">
            <NuxtLink
              v-if="nav?.prev.articleSlug"
              :to="`/training/${pathSlug}/${nav.prev.articleSlug}`"
              class="flex-1 group bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4 flex items-center gap-3 transition hover:border-blue-500/50"
            >
              <UIcon
                name="i-lucide-arrow-left"
                class="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors shrink-0"
              />
              <div class="min-w-0">
                <p class="text-xs text-zinc-500 mb-0.5">Étape précédente</p>
                <p
                  class="text-sm font-medium text-[#F3F4F6] truncate group-hover:text-white transition-colors"
                >
                  {{ nav.prev.stepTitle }}
                </p>
              </div>
            </NuxtLink>
            <div
              v-else
              class="flex-1 bg-[#F3F4F6]/5 border-[0.1px] border-dashed border-dashcolor/20 rounded-none p-4 flex items-center gap-3 opacity-40"
            >
              <UIcon name="i-lucide-arrow-left" class="w-4 h-4 text-zinc-500 shrink-0" />
              <span class="text-sm text-zinc-500">Première étape</span>
            </div>

            <NuxtLink
              v-if="nav?.next.articleSlug"
              :to="`/training/${pathSlug}/${nav.next.articleSlug}`"
              class="flex-1 group bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4 flex items-center justify-end gap-3 transition hover:border-blue-500/50"
            >
              <div class="min-w-0 text-right">
                <p class="text-xs text-zinc-500 mb-0.5">Étape suivante</p>
                <p
                  class="text-sm font-medium text-[#F3F4F6] truncate group-hover:text-white transition-colors"
                >
                  {{ nav.next.stepTitle }}
                </p>
              </div>
              <UIcon
                name="i-lucide-arrow-right"
                class="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors shrink-0"
              />
            </NuxtLink>
            <div
              v-else
              class="flex-1 bg-[#F3F4F6]/5 border-[0.1px] border-dashed border-dashcolor/20 rounded-none p-4 flex items-center justify-end gap-3 opacity-40"
            >
              <span class="text-sm text-zinc-500">Dernière étape</span>
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-zinc-500 shrink-0" />
            </div>
          </div>
        </div>

        <!-- Sidebar (desktop only) -->
        <aside class="hidden lg:block w-64 shrink-0">
          <div class="sticky top-32 flex flex-col gap-6">
            <!-- Table of contents -->
            <TableOfContents v-if="headings.length" :headings="headings" />

            <!-- Steps list -->
            <div
              class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4"
            >
              <p class="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                Étapes du parcours
              </p>
              <div class="flex flex-col gap-1.5">
                <NuxtLink
                  v-for="s in path?.steps"
                  :key="s.id"
                  :to="s.articleSlug ? `/training/${pathSlug}/${s.articleSlug}` : '#'"
                  class="flex items-center gap-2.5 p-2 rounded-none transition group"
                  :class="
                    s.articleSlug === stepSlug
                      ? 'bg-primary/10 border-[0.1px] border-dashed border-primary/40'
                      : 'hover:bg-[#0F0F0F]/5 hover:bg-[#F3F4F6]/5'
                  "
                >
                  <div
                    class="shrink-0 w-5 h-5 flex items-center justify-center border-[0.1px] border-dashed rounded-none text-[10px] font-bold"
                    :class="
                      s.isCompleted
                        ? 'bg-green-500/10 border-green-500/40 text-green-500'
                        : s.articleSlug === stepSlug
                          ? 'bg-primary/20 border-primary/50 text-primary'
                          : 'bg-[#F3F4F6]/5 border-[#0F0F0F]/20 border-dashcolor/30 text-zinc-500'
                    "
                  >
                    <UIcon v-if="s.isCompleted" name="i-lucide-check" class="w-3 h-3" />
                    <span v-else>{{ s.stepOrder }}</span>
                  </div>
                  <span
                    class="text-xs truncate transition-colors"
                    :class="
                      s.articleSlug === stepSlug
                        ? 'text-primary font-medium'
                        : 'text-zinc-500 group-hover:text-[#F3F4F6]'
                    "
                  >
                    {{ s.stepTitle ?? `Étape ${s.stepOrder}` }}
                  </span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>

<style scoped>
.prose-article :deep(h2),
.prose-article :deep(h3) {
  color: rgb(15, 15, 15);
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  scroll-margin-top: 8rem;
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
tyle>
