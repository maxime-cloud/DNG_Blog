<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Analytiques' })

const period = ref('30')
const { data: overview } = await useFetch('/api/analytics/overview')
const { data: traffic, refresh: refreshTraffic } = await useFetch<{
  data: Array<{ viewDate: string; viewCount: number }>
}>('/api/analytics/traffic', {
  query: computed(() => ({ days: period.value }))
})
const { data: topArticles, refresh: refreshTop } = await useFetch<{
  data: Array<{ id: number; title: string; slug: string; _count?: { views: number } }>
}>('/api/analytics/top-articles', {
  query: computed(() => ({ period: `${period.value}d`, limit: 10 }))
})

watch(period, () => {
  refreshTraffic()
  refreshTop()
})
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Analytiques</h1>
      <select
        v-model="period"
        class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none"
      >
        <option value="7">7 jours</option>
        <option value="30">30 jours</option>
        <option value="90">90 jours</option>
      </select>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <AdminStatsCard
        label="Articles"
        :value="overview?.totalArticles ?? 0"
        icon="i-lucide-file-text"
      />
      <AdminStatsCard label="Vues totales" :value="overview?.totalViews ?? 0" icon="i-lucide-eye" />
      <AdminStatsCard
        label="Utilisateurs"
        :value="overview?.totalUsers ?? 0"
        icon="i-lucide-users"
      />
      <AdminStatsCard
        label="Abonnés"
        :value="overview?.totalSubscribers ?? 0"
        icon="i-lucide-mail"
      />
    </div>

    <!-- Traffic chart (simple table) -->
    <div
      class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4 mb-6"
    >
      <h2 class="font-semibold mb-4">Trafic journalier</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th class="text-left py-2 text-zinc-500">Date</th>
              <th class="text-right py-2 text-zinc-500">Vues</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="day in (traffic?.data ?? []).slice(-14)"
              :key="day.viewDate"
              class="border-t border-[0.1px] border-dashed border-dashcolor/30"
            >
              <td class="py-1.5">{{ new Date(day.viewDate).toLocaleDateString('fr-FR') }}</td>
              <td class="py-1.5 text-right">{{ day.viewCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Top articles -->
    <div
      class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4"
    >
      <h2 class="font-semibold mb-4">Top articles</h2>
      <div class="space-y-2">
        <div
          v-for="(article, i) in topArticles?.data ?? []"
          :key="article.id"
          class="flex items-center justify-between py-2 border-b border-[0.1px] border-dashed border-dashcolor/30 last:border-0"
        >
          <div class="flex items-center gap-2">
            <span class="text-xs text-zinc-400 w-5">{{ i + 1 }}</span>
            <span class="text-sm truncate max-w-xs">{{ article.title }}</span>
          </div>
          <span class="text-xs text-zinc-500 shrink-0">{{ article._count?.views ?? 0 }} vues</span>
        </div>
      </div>
    </div>
  </div>
</template>
