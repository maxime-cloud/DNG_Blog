<script setup>
import { gsap } from 'gsap'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: overview } = await useFetch('/api/analytics/overview')
const { data: topArticles } = await useFetch('/api/analytics/top-articles', { query: { limit: 5 } })
const { data: recentComments } = await useFetch('/api/admin/comments', { query: { limit: 5 } })

useSeoMeta({ title: 'Dashboard Admin' })

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
      stagger: 0.1,
      ease: 'power2.out'
    })
    document.querySelectorAll('.kpi-value').forEach((el) => {
      const target = Number(el.textContent) || 0
      gsap.from(
        { val: 0 },
        {
          val: target,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate() {
            el.textContent = String(Math.round(this.targets()[0].val))
          }
        }
      )
    })
  }, kpiContainer.value)
})

onUnmounted(() => ctx?.revert())
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6 text-[#0F0F0F] dark:text-white">
      Dashboard
    </h1>

    <div
      ref="kpiContainer"
      class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      <AdminStatsCard
        class="kpi-card"
        label="Articles"
        :value="overview?.totalArticles ?? 0"
        icon="i-lucide-file-text"
      >
        <template #value>
          <span class="kpi-value text-3xl font-bold mt-1 text-[#0F0F0F] dark:text-white">{{
            overview?.totalArticles ?? 0
          }}</span>
        </template>
      </AdminStatsCard>
      <AdminStatsCard
        class="kpi-card"
        label="Vues totales"
        :value="overview?.totalViews ?? 0"
        icon="i-lucide-eye"
      />
      <AdminStatsCard
        class="kpi-card"
        label="Utilisateurs"
        :value="overview?.totalUsers ?? 0"
        icon="i-lucide-users"
      />
      <AdminStatsCard
        class="kpi-card"
        label="Abonnés newsletter"
        :value="overview?.totalSubscribers ?? 0"
        icon="i-lucide-mail"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 p-4 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none"
      >
        <h2 class="text-lg font-semibold mb-4 text-[#0F0F0F] dark:text-white">
          Articles populaires
        </h2>
        <div
          v-for="article in topArticles?.data ?? []"
          :key="article.id"
          class="flex justify-between items-center py-2 border-b border-[0.1px] border-dashed border-dashcolor/30 last:border-0"
        >
          <span class="text-sm truncate text-[#0F0F0F] dark:text-white">{{ article.title }}</span>
          <span class="text-xs text-zinc-500 ml-2 shrink-0">{{ article._count?.views ?? article.viewsCount ?? 0 }} vues</span>
        </div>
        <p
          v-if="!topArticles?.data?.length"
          class="text-sm text-zinc-500 py-4 text-center"
        >
          Aucun article
        </p>
      </div>

      <div
        class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 p-4 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none"
      >
        <h2 class="text-lg font-semibold mb-4 text-[#0F0F0F] dark:text-white">
          Commentaires récents
        </h2>
        <div
          v-for="comment in recentComments?.data ?? []"
          :key="comment.id"
          class="py-2 border-b border-[0.1px] border-dashed border-dashcolor/30 last:border-0"
        >
          <p class="text-sm truncate text-[#0F0F0F] dark:text-white">
            {{ comment.content }}
          </p>
          <div class="flex gap-2 mt-1">
            <UBadge
              :label="comment.status"
              size="xs"
            />
          </div>
        </div>
        <p
          v-if="!recentComments?.data?.length"
          class="text-sm text-zinc-500 py-4 text-center"
        >
          Aucun commentaire
        </p>
      </div>
    </div>
  </div>
</template>
