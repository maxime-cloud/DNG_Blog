<script setup lang="ts">
const route = useRoute()

interface SeriesArticle {
  id: string
  slug: string
  title: string
  publishedAt: string | null
}

interface Series {
  id: string
  title: string
  slug: string
  description: string | null
  coverImageUrl: string | null
  isPublished: boolean
  articles: SeriesArticle[]
}

const { data: seriesData, pending, error } = await useLazyFetch<{ data: Series }>(
  `/api/series/${route.params.slug}`
)

watch(error, (err) => {
  if (err) throw createError({ statusCode: 404, statusMessage: 'Série introuvable' })
})

const series = computed(() => seriesData.value?.data ?? null)

useSeoMeta({
  title: () => series.value?.title ?? 'Série',
  description: () => series.value?.description ?? ''
})

function formatDate(dateStr: string | null) {
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
      <div class="px-4 pt-10 pb-4">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <NuxtLink
            to="/"
            class="hover:text-[#F3F4F6] transition-colors"
          >
            Accueil
          </NuxtLink>
          <UIcon
            name="i-lucide-chevron-right"
            class="w-3 h-3"
          />
          <NuxtLink
            to="/series"
            class="hover:text-[#F3F4F6] transition-colors"
          >
            Séries
          </NuxtLink>
          <UIcon
            name="i-lucide-chevron-right"
            class="w-3 h-3"
          />
          <span class="text-[#F3F4F6] truncate max-w-[200px]">
            {{ series?.title }}
          </span>
        </nav>

        <!-- Header -->
        <div
          class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none mb-8"
        >
          <!-- Cover image -->
          <div
            v-if="series?.coverImageUrl"
            class="overflow-hidden rounded-none"
          >
            <img
              :src="series.coverImageUrl"
              :alt="series.title"
              class="w-full h-52 sm:h-64 object-cover"
              loading="eager"
            >
          </div>

          <div class="p-6 sm:p-8">
            <div class="flex items-center gap-2 mb-3">
              <UIcon
                name="i-lucide-layers"
                class="w-4 h-4 text-primary"
              />
              <span class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Série</span>
            </div>

            <h1
              class="text-[24px] sm:text-[32px] lg:text-[38px] font-bold text-[#FFFFFF] leading-tight mb-4"
            >
              {{ series?.title }}
            </h1>

            <p
              v-if="series?.description"
              class="text-base text-[#F3F4F6]/70 mb-4 max-w-3xl"
            >
              {{ series.description }}
            </p>

            <div class="flex items-center gap-2 text-sm text-zinc-500">
              <UIcon
                name="i-lucide-book-open"
                class="w-4 h-4"
              />
              <span>{{ series?.articles?.length ?? 0 }} épisode{{
                (series?.articles?.length ?? 0) > 1 ? 's' : ''
              }}</span>
            </div>
          </div>
        </div>

        <!-- Episode list -->
        <div class="mb-10">
          <h2 class="text-xl font-semibold text-[#FFFFFF] mb-4">
            Épisodes
          </h2>

          <div v-if="pending" class="flex flex-col gap-3">
             <div v-for="i in 3" :key="i" class="h-20 bg-white/5 animate-pulse border-[0.1px] border-dashed border-dashcolor/30" />
          </div>

          <div
            v-else-if="series?.articles?.length"
            class="flex flex-col gap-3"
          >
            <NuxtLink
              v-for="(article, index) in series.articles"
              :key="article.id"
              :to="`/article/${article.slug}`"
              class="group bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4 sm:p-5 flex items-center gap-4 transition hover:border-blue-500/50"
            >
              <!-- Episode number badge -->
              <div
                class="shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 border-[0.1px] border-dashed border-primary/40 rounded-none text-primary font-bold text-sm"
              >
                {{ index + 1 }}
              </div>

              <!-- Episode info -->
              <div class="flex-1 min-w-0">
                <p
                  class="text-[#F3F4F6] font-semibold text-sm sm:text-base truncate transition-colors"
                >
                  {{ article.title }}
                </p>
                <p
                  v-if="article.publishedAt"
                  class="text-xs text-zinc-500 mt-0.5"
                >
                  {{ formatDate(article.publishedAt) }}
                </p>
              </div>

              <!-- Arrow -->
              <UIcon
                name="i-lucide-arrow-right"
                class="shrink-0 w-4 h-4 text-zinc-500 group-hover:text-white transition-colors"
              />
            </NuxtLink>
          </div>

          <div
            v-else
            class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 text-center text-sm text-zinc-500"
          >
            Aucun épisode disponible pour le moment.
          </div>
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
