<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: statsData, pending } = useLazyFetch<any>('/api/users/me/stats')

function formatNumber(n: number) {
  return new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}
</script>

<template>
  <div class="pt-8">
    <div v-if="pending" class="space-y-8">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-28 bg-white/5 animate-pulse border-[0.1px] border-dashed border-dashcolor/30" />
      </div>
    </div>

    <div v-else-if="statsData" class="space-y-8">
      <!-- Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Articles publiés"
          :value="statsData.totals.articles"
          icon="i-lucide-file-text"
        />
        <AdminStatsCard
          label="Vues totales"
          :value="statsData.totals.views"
          icon="i-lucide-eye"
          :trend="statsData.trends.views"
        />
        <AdminStatsCard
          label="Likes"
          :value="statsData.totals.likes"
          icon="i-lucide-heart"
        />
        <AdminStatsCard
          label="Commentaires"
          :value="statsData.totals.comments"
          icon="i-lucide-message-square"
        />
      </div>

      <!-- Views chart -->
      <div
        class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] p-6"
      >
        <h2 class="text-base font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-2">
          <UIcon name="i-lucide-bar-chart" class="w-4 h-4 text-primary" />
          Évolution des vues (30 jours)
        </h2>
        <AdminChartLine
          v-if="statsData.viewsSeries.length"
          :data="statsData.viewsSeries"
          :height="240"
        />
      </div>

      <!-- Top Articles -->
      <div v-if="statsData.topArticles.length">
        <h2 class="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-tight">
          <UIcon name="i-lucide-trending-up" class="w-4 h-4 text-primary" />
          Articles les plus performants
        </h2>
        <div class="flex flex-col gap-3">
          <NuxtLink
            v-for="(article, index) in statsData.topArticles"
            :key="article.slug"
            :to="`/article/${article.slug}`"
            class="group bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4 flex items-center gap-4 transition hover:border-primary/50"
          >
            <div class="w-8 h-8 flex items-center justify-center border-[0.1px] border-dashed border-dashcolor/50 text-xs font-bold text-zinc-500 group-hover:text-primary transition-colors">
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
                {{ article.title }}
              </p>
            </div>
            <div class="flex items-center gap-4 text-xs text-zinc-500">
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-eye" class="w-3.5 h-3.5" />
                {{ formatNumber(article.viewsCount) }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-heart" class="w-3.5 h-3.5" />
                {{ formatNumber(article.likesCount) }}
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-20 border-[0.1px] border-dashed border-dashcolor/50 bg-CustomColor-900 text-center text-zinc-500">
      <UIcon name="i-lucide-bar-chart-3" class="w-12 h-12 mb-4 opacity-20" />
      <p>Aucune donnée statistique disponible.</p>
    </div>
  </div>
</template>
