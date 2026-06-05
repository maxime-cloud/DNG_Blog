<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Analytiques' })

const period = ref('30')
const topSort = ref<'views' | 'likes'>('views')

const query = computed(() => ({ days: period.value }))

const { data: overview } = await useFetch('/api/analytics/overview', { query })
const { data: traffic } = await useFetch<{ data: Array<{ date: string, views: number }> }>(
  '/api/analytics/traffic',
  { query }
)
const { data: commentsTrend } = await useFetch<{ data: Array<{ date: string, count: number }> }>(
  '/api/analytics/comments-trend',
  { query }
)
const { data: growth } = await useFetch<{
  subscribers: Array<{ date: string, count: number }>
  users: Array<{ date: string, count: number }>
}>('/api/analytics/growth', { query })

const { data: topArticles } = await useFetch<{
  data: Array<{ id: number, title: string, slug: string, viewsCount: number, likesCount: number }>
}>('/api/analytics/top-articles', {
  query: computed(() => ({ period: `${period.value}d`, sort: topSort.value, limit: 10 }))
})
const { data: categories } = await useFetch<{
  data: Array<{ name: string, slug: string, color: string, count: number }>
}>('/api/analytics/categories')
const { data: referrers } = await useFetch<{ data: Array<{ referrer: string, count: number }> }>(
  '/api/analytics/referrers'
)
const { data: statusDist } = await useFetch<{ data: Array<{ status: string, count: number }> }>(
  '/api/analytics/status'
)
const { data: topAuthors } = await useFetch<{
  data: Array<{
    id: string
    name: string
    image: string | null
    articlesCount: number
    viewsCount: number
  }>
}>('/api/analytics/top-authors', { query: { limit: 6 } })
const { data: publications } = await useFetch<{ data: Array<{ date: string, count: number }> }>(
  '/api/analytics/publications',
  { query: { days: 365 } }
)

function fmtDay(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const trafficData = computed(() =>
  (traffic.value?.data ?? []).map(d => ({ label: fmtDay(d.date), value: d.views }))
)
const commentsData = computed(() =>
  (commentsTrend.value?.data ?? []).map(d => ({ label: fmtDay(d.date), value: d.count }))
)
const topArticlesData = computed(() =>
  (topArticles.value?.data ?? []).map(a => ({
    label: a.title,
    value: topSort.value === 'likes' ? a.likesCount : a.viewsCount,
    sub: topSort.value === 'likes' ? `${a.viewsCount} vues` : `${a.likesCount} ❤`
  }))
)
const categoriesData = computed(() =>
  (categories.value?.data ?? []).map(c => ({ label: c.name, value: c.count, color: c.color }))
)
const referrersData = computed(() =>
  (referrers.value?.data ?? []).slice(0, 8).map(r => ({ label: r.referrer, value: r.count }))
)

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: '#22c55e',
  DRAFT: '#71717a',
  REVIEW: '#f59e0b',
  ARCHIVED: '#ef4444'
}
const STATUS_LABELS: Record<string, string> = {
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

const subscribersData = computed(() =>
  (growth.value?.subscribers ?? []).map(d => ({ label: fmtDay(d.date), value: d.count }))
)
const usersData = computed(() =>
  (growth.value?.users ?? []).map(d => ({ label: fmtDay(d.date), value: d.count }))
)
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-white">
        Analytiques
      </h1>
      <select
        v-model="period"
        class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none text-white"
      >
        <option value="7">
          7 jours
        </option>
        <option value="30">
          30 jours
        </option>
        <option value="90">
          90 jours
        </option>
      </select>
    </div>

    <!-- KPIs with trends -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AdminStatsCard
        label="Vues"
        :value="overview?.totalViews ?? 0"
        icon="i-lucide-eye"
        :trend="overview?.trends?.views"
      />
      <AdminStatsCard
        label="Commentaires"
        :value="overview?.totalComments ?? 0"
        icon="i-lucide-message-square"
        :trend="overview?.trends?.comments"
      />
      <AdminStatsCard
        label="Abonnés"
        :value="overview?.totalSubscribers ?? 0"
        icon="i-lucide-mail"
        :trend="overview?.trends?.subscribers"
      />
      <AdminStatsCard
        label="Utilisateurs"
        :value="overview?.totalUsers ?? 0"
        icon="i-lucide-users"
        :trend="overview?.trends?.users"
      />
    </div>

    <!-- Traffic -->
    <AdminPanel
      title="Trafic journalier"
      :subtitle="`Vues sur les ${period} derniers jours`"
      class="mb-6"
    >
      <AdminChartLine
        :data="trafficData"
        color="#22c55e"
        :height="260"
      />
    </AdminPanel>

    <!-- Top articles + Categories -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <AdminPanel title="Top articles">
        <template #actions>
          <div class="flex border-[0.1px] border-dashcolor/50">
            <button
              v-for="s in ['views', 'likes'] as const"
              :key="s"
              class="text-xs px-3 py-1 transition-colors"
              :class="topSort === s ? 'bg-primary text-white' : 'text-zinc-500 hover:text-white'"
              @click="topSort = s"
            >
              {{ s === 'views' ? 'Vues' : 'Likes' }}
            </button>
          </div>
        </template>
        <AdminChartBar :data="topArticlesData" />
      </AdminPanel>

      <AdminPanel title="Articles par catégorie">
        <AdminChartDonut
          :data="categoriesData"
          :height="220"
        />
      </AdminPanel>
    </div>

    <!-- Comments trend + Referrers -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <AdminPanel title="Commentaires par jour">
        <AdminChartLine
          :data="commentsData"
          color="#3b82f6"
          :height="220"
        />
      </AdminPanel>

      <AdminPanel
        title="Sources de trafic"
        subtitle="Top referrers"
      >
        <AdminChartBar
          :data="referrersData"
          color="#a855f7"
        />
      </AdminPanel>
    </div>

    <!-- Status + Top authors -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <AdminPanel title="Répartition par statut">
        <AdminChartDonut
          :data="statusData"
          :height="220"
        />
      </AdminPanel>

      <AdminPanel
        title="Top auteurs"
        subtitle="Par vues cumulées"
      >
        <div class="space-y-3">
          <div
            v-for="(author, i) in topAuthors?.data ?? []"
            :key="author.id"
            class="flex items-center gap-3"
          >
            <span class="text-xs text-zinc-500 w-4 shrink-0">{{ i + 1 }}</span>
            <UAvatar
              :src="author.image ?? undefined"
              :alt="author.name"
              size="xs"
              class="rounded-none shrink-0"
            />
            <span class="text-sm text-[#F3F4F6] truncate flex-1">{{ author.name }}</span>
            <span class="text-xs text-zinc-500 shrink-0">
              {{ author.viewsCount }} vues · {{ author.articlesCount }} art.
            </span>
          </div>
          <p
            v-if="!topAuthors?.data?.length"
            class="text-sm text-zinc-500 py-4 text-center"
          >
            Aucun auteur
          </p>
        </div>
      </AdminPanel>
    </div>

    <!-- Growth: subscribers + users -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <AdminPanel
        title="Nouveaux abonnés"
        :subtitle="`${period} derniers jours`"
      >
        <AdminChartLine
          :data="subscribersData"
          color="#f59e0b"
          :height="180"
        />
      </AdminPanel>
      <AdminPanel
        title="Nouveaux utilisateurs"
        :subtitle="`${period} derniers jours`"
      >
        <AdminChartLine
          :data="usersData"
          color="#14b8a6"
          :height="180"
        />
      </AdminPanel>
    </div>

    <!-- Publications heatmap -->
    <AdminPanel
      title="Calendrier de publication"
      subtitle="12 derniers mois"
    >
      <AdminChartHeatmap :data="publications?.data ?? []" />
    </AdminPanel>
  </div>
</template>
