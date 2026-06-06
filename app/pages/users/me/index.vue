<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user: authUser } = useAuth()
const editModalOpen = ref(false)

// Fetch full profile
const { data: profile, refresh: refreshProfile } = await useFetch<any>('/api/users/me')

// Tabs definition
const tabs = computed(() => {
  const items = [
    { label: 'Favoris', icon: 'i-lucide-bookmark', slot: 'favorites' }
  ]
  
  if (profile.value?.role === 'author' || profile.value?.role === 'admin') {
    items.push({ label: 'Statistiques', icon: 'i-lucide-bar-chart-3', slot: 'stats' })
  }
  
  return items
})

// Favorites state
const { data: favoritesData, pending: favoritesPending } = useLazyFetch<any>('/api/users/me/favorites')
const favorites = computed(() => favoritesData.value?.data ?? [])

// Stats state
const { data: statsData, pending: statsPending } = useLazyFetch<any>('/api/users/me/stats', {
  immediate: profile.value?.role === 'author' || profile.value?.role === 'admin'
})

function formatJoinDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  })
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

useSeoMeta({ title: 'Mon Tableau de Bord' })
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="px-4 pt-10 pb-16">
        <!-- Hero Section -->
        <div class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] p-6 sm:p-10 mb-8 relative overflow-hidden">
          <!-- Background decoration -->
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div class="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
            <!-- Avatar -->
            <div class="relative group">
              <UAvatar
                :src="profile?.image ?? '/user-avatar.png'"
                :alt="profile?.name"
                size="3xl"
                class="rounded-none border-[0.1px] border-dashed border-dashcolor/50 p-1"
              />
            </div>

            <!-- Profile Info -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-3 mb-2">
                <h1 class="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">
                  {{ profile?.name }}
                </h1>
                <span
                  v-if="profile?.role && profile.role !== 'reader'"
                  class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-[0.1px] border-dashed rounded-none"
                  :class="profile.role === 'admin' ? 'text-primary border-primary/40 bg-primary/5' : 'text-blue-500 border-blue-500/40 bg-blue-500/5'"
                >
                  {{ profile.role === 'admin' ? 'Administrateur' : 'Auteur' }}
                </span>
              </div>

              <p v-if="profile?.bio" class="text-zinc-400 text-sm max-w-2xl mb-4 leading-relaxed">
                {{ profile.bio }}
              </p>
              <p v-else class="text-zinc-600 text-sm italic mb-4">
                Aucune biographie renseignée.
              </p>

              <!-- Meta -->
              <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500">
                <div class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
                  <span>Inscrit en {{ formatJoinDate(profile?.createdAt) }}</span>
                </div>
                
                <a v-if="profile?.githubUrl" :href="profile.githubUrl" target="_blank" class="flex items-center gap-1.5 hover:text-white transition-colors">
                  <UIcon name="i-simple-icons-github" class="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>

                <a v-if="profile?.websiteUrl" :href="profile.websiteUrl" target="_blank" class="flex items-center gap-1.5 hover:text-white transition-colors">
                  <UIcon name="i-lucide-globe" class="w-3.5 h-3.5" />
                  <span>Site Web</span>
                </a>
              </div>
            </div>

            <!-- Actions -->
            <div class="shrink-0 pt-4 md:pt-0">
              <CUButton
                label="Modifier mon profil"
                logo-name="i-lucide-settings"
                size="md"
                class="w-full sm:w-auto"
                @click="editModalOpen = true"
              />
            </div>
          </div>
        </div>

        <!-- Dashboard Content with Tabs -->
        <div class="max-w-5xl mx-auto">
          <UTabs :items="tabs" :ui="{
            list: {
              background: 'bg-transparent',
              marker: { background: 'bg-primary' },
              tab: { 
                base: 'rounded-none border-b-[0.1px] border-dashed border-dashcolor/50 px-6 py-3',
                active: 'text-primary font-bold',
                inactive: 'text-zinc-500 hover:text-zinc-300'
              }
            }
          }">
            <!-- Favorites Tab -->
            <template #favorites>
              <div class="pt-8">
                <div v-if="favoritesPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div v-for="i in 3" :key="i" class="h-64 bg-white/5 animate-pulse border-[0.1px] border-dashed border-dashcolor/30" />
                </div>

                <div v-else-if="favorites.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ArticleCard 
                    v-for="fav in favorites" 
                    :key="fav.article.id" 
                    :article="fav.article" 
                  />
                </div>

                <div v-else class="flex flex-col items-center justify-center py-20 border-[0.1px] border-dashed border-dashcolor/50 bg-CustomColor-900 text-center">
                  <UIcon name="i-lucide-bookmark" class="w-12 h-12 text-zinc-700 mb-4" />
                  <h3 class="text-white font-semibold mb-1">Aucun favori</h3>
                  <p class="text-zinc-500 text-sm max-w-xs">
                    Commencez à explorer pour sauvegarder vos articles préférés.
                  </p>
                  <CUButton to="/articles" label="Parcourir les articles" class="mt-6" size="sm" variant="outline" />
                </div>
              </div>
            </template>

            <!-- Statistics Tab -->
            <template #stats>
              <div class="pt-8">
                <div v-if="statsPending" class="space-y-8">
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
          </UTabs>
        </div>
      </div>

      <!-- Modals -->
      <UserProfileModal 
        v-if="profile"
        v-model:open="editModalOpen" 
        :user="profile"
        @updated="refreshProfile"
      />
    </BaseLayaoutContent>
  </NoAdminPage>
</template>

<style scoped>
:deep(.relative) {
  border-radius: 0 !important;
}
</style>
