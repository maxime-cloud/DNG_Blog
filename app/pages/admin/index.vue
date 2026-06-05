<script setup>
import { gsap } from 'gsap'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Dashboard Admin' })

const { data: overview } = await useFetch('/api/analytics/overview', { query: { days: 30 } })
const { data: topArticles } = await useFetch('/api/analytics/top-articles', { query: { limit: 5 } })
const { data: recentComments } = await useFetch('/api/admin/comments', { query: { limit: 5 } })
const { data: growth } = await useFetch('/api/analytics/growth', { query: { days: 30 } })
const { data: commentsTrend } = await useFetch('/api/analytics/comments-trend', {
  query: { days: 30 }
})
const { data: statusDist } = await useFetch('/api/analytics/status')

function fmtDay(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const subsSpark = computed(() => (growth.value?.subscribers ?? []).map(d => d.count))
const usersSpark = computed(() => (growth.value?.users ?? []).map(d => d.count))
const subsTotal = computed(() => subsSpark.value.reduce((a, b) => a + b, 0))
const usersTotal = computed(() => usersSpark.value.reduce((a, b) => a + b, 0))

const commentsData = computed(() =>
  (commentsTrend.value?.data ?? []).map(d => ({ label: fmtDay(d.date), value: d.count }))
)

const STATUS_COLORS = {
  PUBLISHED: '#22c55e',
  DRAFT: '#71717a',
  REVIEW: '#f59e0b',
  ARCHIVED: '#ef4444'
}
const STATUS_LABELS = {
  PUBLISHED: 'Publié',
  DRAFT: 'Brouillon',
  REVIEW: 'Révision',
  ARCHIVED: 'Archivé'
}
const statusData = computed(() =>
  (statusDist.value?.data ?? [])
    .filter(s => s.count > 0)
    .map(s => ({
      label: STATUS_LABELS[s.status] ?? s.status,
      value: s.count,
      color: STATUS_COLORS[s.status]
    }))
)

const kpiContainer = ref(null)
let ctx = null

onMounted(() => {
  if (!kpiContainer.value) return
  ctx = gsap.context(() => {
    gsap.from('.kpi-card', {
      y: 30,
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out'
    })
  }, kpiContainer.value)
})

onUnmounted(() => ctx?.revert())
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6 text-white">Dashboard</h1>

    <!-- KPI engagement + trend -->
    <div ref="kpiContainer" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AdminStatsCard
        class="kpi-card"
        label="Vues (30j)"
        :value="overview?.totalViews ?? 0"
        icon="i-lucide-eye"
        :trend="overview?.trends?.views"
      />
      <AdminStatsCard
        class="kpi-card"
        label="Commentaires"
        :value="overview?.totalComments ?? 0"
        icon="i-lucide-message-square"
        :trend="overview?.trends?.comments"
      />
      <AdminStatsCard
        class="kpi-card"
        label="Likes"
        :value="overview?.totalLikes ?? 0"
        icon="i-lucide-heart"
      />
      <AdminStatsCard
        class="kpi-card"
        label="Favoris"
        :value="overview?.totalFavorites ?? 0"
        icon="i-lucide-bookmark"
      />
    </div>

    <!-- Growth sparklines -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <AdminPanel>
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="text-sm text-zinc-500 truncate">Nouveaux abonnés (30j)</p>
            <p class="text-3xl font-bold text-white mt-1">+{{ subsTotal }}</p>
          </div>
          <div class="shrink-0">
            <AdminChartSparkline :data="subsSpark" color="#f59e0b" :width="140" :height="48" />
          </div>
        </div>
      </AdminPanel>
      <AdminPanel>
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="text-sm text-zinc-500 truncate">Nouveaux utilisateurs (30j)</p>
            <p class="text-3xl font-bold text-white mt-1">+{{ usersTotal }}</p>
          </div>
          <div class="shrink-0">
            <AdminChartSparkline :data="usersSpark" color="#14b8a6" :width="140" :height="48" />
          </div>
        </div>
      </AdminPanel>
    </div>

    <!-- Comments trend + Status -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <AdminPanel title="Commentaires par jour" subtitle="30 derniers jours">
        <AdminChartLine :data="commentsData" color="#3b82f6" :height="200" />
      </AdminPanel>
      <AdminPanel title="Répartition des articles">
        <AdminChartDonut :data="statusData" :height="200" />
      </AdminPanel>
    </div>

    <!-- Popular articles + Recent comments -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AdminPanel title="Articles populaires">
        <div
          v-for="article in topArticles?.data ?? []"
          :key="article.id"
          class="flex justify-between items-center py-2 border-b border-[0.1px] border-dashed border-dashcolor/30 last:border-0"
        >
          <span class="text-sm truncate text-white">{{ article.title }}</span>
          <span class="text-xs text-zinc-500 ml-2 shrink-0"
            >{{ article.viewsCount ?? 0 }} vues</span
          >
        </div>
        <p v-if="!topArticles?.data?.length" class="text-sm text-zinc-500 py-4 text-center">
          Aucun article
        </p>
      </AdminPanel>

      <AdminPanel title="Commentaires récents">
        <div
          v-for="comment in recentComments?.data ?? []"
          :key="comment.id"
          class="py-2 border-b border-[0.1px] border-dashed border-dashcolor/30 last:border-0"
        >
          <p class="text-sm truncate text-white">
            {{ comment.content }}
          </p>
          <div class="flex gap-2 mt-1">
            <UBadge :label="comment.status" size="sm" />
          </div>
        </div>
        <p v-if="!recentComments?.data?.length" class="text-sm text-zinc-500 py-4 text-center">
          Aucun commentaire
        </p>
      </AdminPanel>
    </div>
  </div>
</template>
