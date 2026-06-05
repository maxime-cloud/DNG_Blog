<script setup lang="ts">
definePageMeta({ middleware: 'author' })

useSeoMeta({ title: 'Mes statistiques' })

interface TopArticle {
  slug: string
  title: string
  status: string
  publishedAt: string | null
  viewsCount: number
  likesCount: number
  commentsCount: number
}

interface StatsResponse {
  totals: {
    articles: number
    drafts: number
    views: number
    likes: number
    comments: number
  }
  trends: { views: number }
  lastPublishedAt: string | null
  viewsSeries: { label: string, value: number }[]
  topArticles: TopArticle[]
  days: number
}

const { data, pending } = await useFetch<StatsResponse>('/api/users/me/stats')

const totals = computed(() => data.value?.totals)

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
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
      <div class="max-w-5xl mx-auto py-10 px-4">
        <div class="mb-8">
          <h1 class="text-3xl font-bold">
            Mes statistiques
          </h1>
          <p class="text-sm text-zinc-500 mt-2">
            Vue d'ensemble de la performance de vos articles.
          </p>
        </div>

        <!-- Loading -->
        <div
          v-if="pending"
          class="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div
            v-for="i in 4"
            :key="i"
            class="h-28 bg-[#111] border-[0.1px] border-dashed border-dashcolor/30 animate-pulse"
          />
        </div>

        <template v-else-if="totals">
          <!-- Stat cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <AdminStatsCard
              label="Articles publiés"
              :value="totals.articles"
              icon="i-lucide-file-text"
            />
            <AdminStatsCard
              label="Vues totales"
              :value="totals.views"
              icon="i-lucide-eye"
              :trend="data?.trends.views"
            />
            <AdminStatsCard
              label="Likes"
              :value="totals.likes"
              icon="i-lucide-heart"
            />
            <AdminStatsCard
              label="Commentaires"
              :value="totals.comments"
              icon="i-lucide-message-square"
            />
          </div>

          <!-- Secondary info -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-8">
            <span class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-pencil"
                class="w-3.5 h-3.5"
              />
              {{ totals.drafts }} brouillon{{ totals.drafts > 1 ? 's' : '' }}
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-activity"
                class="w-3.5 h-3.5"
              />
              Dernière publication : {{ formatDate(data?.lastPublishedAt ?? null) }}
            </span>
          </div>

          <!-- Views chart -->
          <div
            class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 mb-8"
          >
            <h2 class="text-base font-semibold text-white mb-4">
              Vues — {{ data?.days }} derniers jours
            </h2>
            <AdminChartLine
              v-if="data?.viewsSeries.length"
              :data="data.viewsSeries"
              :height="220"
            />
          </div>

          <!-- Top articles -->
          <div>
            <h2 class="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <UIcon
                name="i-lucide-flame"
                class="w-4 h-4 text-primary"
              />
              Vos articles les plus vus
            </h2>

            <div
              v-if="data?.topArticles.length"
              class="flex flex-col gap-3"
            >
              <NuxtLink
                v-for="(article, index) in data.topArticles"
                :key="article.slug"
                :to="`/article/${article.slug}`"
                class="group bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4 flex items-center gap-4 transition hover:border-blue-500/50"
              >
                <div
                  class="shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 border-[0.1px] border-dashed border-primary/40 rounded-none text-primary font-bold text-sm"
                >
                  {{ index + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm font-semibold text-[#F3F4F6] truncate transition-colors"
                  >
                    {{ article.title }}
                  </p>
                  <span
                    v-if="article.status !== 'PUBLISHED'"
                    class="text-xs text-yellow-500"
                  >
                    Brouillon
                  </span>
                </div>
                <div class="shrink-0 flex items-center gap-4 text-xs text-zinc-500">
                  <span class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-eye"
                      class="w-3.5 h-3.5"
                    />
                    {{ article.viewsCount }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-heart"
                      class="w-3.5 h-3.5"
                    />
                    {{ article.likesCount }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-message-square"
                      class="w-3.5 h-3.5"
                    />
                    {{ article.commentsCount }}
                  </span>
                </div>
              </NuxtLink>
            </div>

            <div
              v-else
              class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-8 text-center text-sm text-zinc-500"
            >
              Vous n'avez pas encore d'articles.
            </div>
          </div>
        </template>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
