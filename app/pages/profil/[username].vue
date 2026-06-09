<script setup lang="ts">
const route = useRoute()

interface PopularArticle {
  slug: string
  title: string
  coverImage: string | null
  publishedAt: string | null
  viewsCount: number
  likesCount: number
}

interface ProfileStats {
  totalArticles: number
  totalViews: number
  totalLikes: number
  lastPublishedAt: string | null
  popularArticles: PopularArticle[]
}

interface UserProfile {
  id: string
  name: string
  image: string | null
  bio: string | null
  githubUrl: string | null
  websiteUrl: string | null
  role: 'reader' | 'author' | 'admin'
  createdAt: string
  _count: { articles: number }
  stats: ProfileStats | null
}

interface Article {
  id: string
  slug: string
  title: string
  description: string | null
  coverImage: string | null
  publishedAt: string | null
  category: { name: string, slug: string, color: string | null } | null
  likesCount: number
}

const { data: user, error } = await useFetch<UserProfile>(`/api/users/${route.params.username}`)

if (error.value) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })

useSeoMeta({
  title: () => user.value?.name ?? 'Profil'
})

const activeTab = ref<'articles' | 'activite'>('articles')

const canShowArticles = computed(
  () => user.value?.role === 'author' || user.value?.role === 'admin'
)

const {
  data: articlesData,
  pending: articlesPending,
  execute: fetchArticles
} = useLazyFetch<{ data: Article[], meta: { total: number } }>(
  () => `/api/articles?authorId=${user.value?.id}`,
  { immediate: false }
)

watch(
  activeTab,
  (val) => {
    if (val === 'articles' && canShowArticles.value && !articlesData.value) {
      fetchArticles()
    }
  },
  { immediate: true }
)

const articles = computed(() => articlesData.value?.data ?? [])

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatJoinDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  })
}

const stats = computed(() => user.value?.stats ?? null)

function formatNumber(n: number) {
  return new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="px-4 pt-10 pb-10 min-h-[80vh]">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <NuxtLink
            to="/"
            class="hover:text-[#F3F4F6] transition-colors"
          > Accueil </NuxtLink>
          <UIcon
            name="i-lucide-chevron-right"
            class="w-3 h-3"
          />
          <span class="text-[#F3F4F6] truncate max-w-[200px]">
            {{ user?.name }}
          </span>
        </nav>

        <!-- Profile header -->
        <div
          class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 sm:p-8 mb-8"
        >
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <!-- Avatar -->
            <UAvatar
              :src="user?.image ?? undefined"
              :alt="user?.name"
              size="xl"
              class="rounded-none shrink-0"
            />

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h1 class="text-xl lg:text-2xl font-semibold text-[#FFFFFF]">
                  {{ user?.name }}
                </h1>
                <!-- Role badge -->
                <span
                  v-if="user?.role && user.role !== 'reader'"
                  class="text-xs font-semibold px-2 py-0.5 border-[0.1px] border-dashed rounded-none"
                  :class="
                    user.role === 'admin'
                      ? 'text-primary border-primary/40 bg-primary/5'
                      : 'text-blue-500 border-blue-500/40 bg-blue-500/5'
                  "
                >
                  {{ user.role === 'admin' ? 'Admin' : 'Auteur' }}
                </span>
              </div>

              <p
                v-if="user?.bio"
                class="text-sm text-[#F3F4F6]/70 mb-3 max-w-xl"
              >
                {{ user.bio }}
              </p>

              <!-- Meta row -->
              <div class="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                <div
                  v-if="user?.createdAt"
                  class="flex items-center gap-1.5"
                >
                  <UIcon
                    name="i-lucide-calendar"
                    class="w-3.5 h-3.5"
                  />
                  <span>Membre depuis {{ formatJoinDate(user.createdAt) }}</span>
                </div>

                <div
                  v-if="canShowArticles"
                  class="flex items-center gap-1.5"
                >
                  <UIcon
                    name="i-lucide-file-text"
                    class="w-3.5 h-3.5"
                  />
                  <span>{{ user?._count?.articles ?? 0 }} article{{
                    (user?._count?.articles ?? 0) > 1 ? 's' : ''
                  }}</span>
                </div>

                <!-- GitHub link -->
                <a
                  v-if="user?.githubUrl"
                  :href="user.githubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 hover:text-[#F3F4F6] transition-colors"
                >
                  <UIcon
                    name="i-simple-icons-github"
                    class="w-3.5 h-3.5"
                  />
                  <span>GitHub</span>
                </a>

                <!-- Website link -->
                <a
                  v-if="user?.websiteUrl"
                  :href="user.websiteUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 hover:text-[#F3F4F6] transition-colors"
                >
                  <UIcon
                    name="i-lucide-globe"
                    class="w-3.5 h-3.5"
                  />
                  <span>Site web</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats (author/admin) -->
        <div
          v-if="canShowArticles && stats"
          class="mb-8"
        >
          <!-- Totals -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div
              v-for="card in [
                { label: 'Articles', value: stats.totalArticles, icon: 'i-lucide-file-text' },
                { label: 'Vues', value: stats.totalViews, icon: 'i-lucide-eye' },
                { label: 'Likes', value: stats.totalLikes, icon: 'i-lucide-heart' }
              ]"
              :key="card.label"
              class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4 sm:p-5"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-zinc-500">
                    {{ card.label }}
                  </p>
                  <p class="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {{ formatNumber(card.value) }}
                  </p>
                </div>
                <UIcon
                  :name="card.icon"
                  class="w-6 h-6 sm:w-7 sm:h-7 text-primary opacity-60"
                />
              </div>
            </div>
          </div>

          <!-- Last activity -->
          <p
            v-if="stats.lastPublishedAt"
            class="flex items-center gap-1.5 text-sm text-zinc-500 mb-6"
          >
            <UIcon
              name="i-lucide-activity"
              class="w-3.5 h-3.5"
            />
            <span>Dernière publication le {{ formatDate(stats.lastPublishedAt) }}</span>
          </p>

          <!-- Popular articles -->
          <div v-if="stats.popularArticles.length">
            <h2 class="text-base font-semibold text-[#FFFFFF] mb-3 flex items-center gap-2">
              <UIcon
                name="i-lucide-flame"
                class="w-4 h-4 text-primary"
              />
              Articles populaires
            </h2>
            <div class="flex flex-col gap-3">
              <NuxtLink
                v-for="(article, index) in stats.popularArticles"
                :key="article.slug"
                :to="`/article/${article.slug}`"
                class="group bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4 flex items-center gap-4 transition hover:border-blue-500/50"
              >
                <div
                  class="shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 border-[0.1px] border-dashed border-primary/40 rounded-none text-primary font-bold text-sm"
                >
                  {{ index + 1 }}
                </div>
                <p
                  class="flex-1 min-w-0 text-sm font-semibold text-[#F3F4F6] truncate transition-colors"
                >
                  {{ article.title }}
                </p>
                <div class="shrink-0 flex items-center gap-4 text-xs text-zinc-500">
                  <span class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-eye"
                      class="w-3.5 h-3.5"
                    />
                    {{ formatNumber(article.viewsCount) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-heart"
                      class="w-3.5 h-3.5"
                    />
                    {{ formatNumber(article.likesCount) }}
                  </span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Tabs (only for author/admin) -->
        <div v-if="canShowArticles">
          <!-- Tab buttons -->
          <div class="flex border-b-[0.1px] border-dashed border-dashcolor/50 mb-6">
            <button
              class="px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-[1px]"
              :class="
                activeTab === 'articles'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-zinc-500 hover:text-[#F3F4F6]'
              "
              @click="activeTab = 'articles'"
            >
              Articles
            </button>
            <button
              class="px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-[1px]"
              :class="
                activeTab === 'activite'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-zinc-500 hover:text-[#F3F4F6]'
              "
              @click="activeTab = 'activite'"
            >
              Activité
            </button>
          </div>

          <!-- Articles tab -->
          <div v-if="activeTab === 'articles'">
            <!-- Loading -->
            <div
              v-if="articlesPending"
              class="pt-4"
            >
              <SkeletonsArticleGridSkeleton :count="3" />
            </div>

            <!-- Articles grid -->
            <div
              v-else-if="articles.length"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
            >
              <NuxtLink
                v-for="article in articles"
                :key="article.id"
                :to="`/article/${article.slug}`"
                class="group bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none flex flex-col transition hover:border-blue-500/50"
              >
                <!-- Cover -->
                <div
                  v-if="article.coverImage"
                  class="overflow-hidden"
                >
                  <img
                    :src="article.coverImage"
                    :alt="article.title"
                    class="w-full h-40 object-cover"
                    loading="lazy"
                  >
                </div>

                <div class="p-4 flex flex-col flex-1">
                  <!-- Category -->
                  <div
                    v-if="article.category"
                    class="mb-2"
                  >
                    <span
                      class="text-xs font-semibold"
                      :style="article.category.color ? `color: ${article.category.color}` : ''"
                    >
                      {{ article.category.name }}
                    </span>
                  </div>

                  <!-- Title -->
                  <h3
                    class="text-base font-semibold text-[#F3F4F6] mb-2 leading-snug transition-colors"
                  >
                    {{ article.title }}
                  </h3>

                  <!-- Description -->
                  <p
                    v-if="article.description"
                    class="text-sm text-zinc-500 mb-3 line-clamp-2 flex-1"
                  >
                    {{ article.description }}
                  </p>

                  <!-- Date + likes -->
                  <div class="flex items-center justify-between text-xs text-zinc-500 mt-auto">
                    <span v-if="article.publishedAt">{{ formatDate(article.publishedAt) }}</span>
                    <div class="flex items-center gap-1">
                      <UIcon
                        name="i-lucide-heart"
                        class="w-3 h-3"
                      />
                      <span>{{ article.likesCount }}</span>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <!-- Empty state -->
            <div
              v-else
              class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-8 text-center text-sm text-zinc-500"
            >
              Aucun article publié pour le moment.
            </div>
          </div>

          <!-- Activité tab -->
          <div v-else-if="activeTab === 'activite'">
            <div
              class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-8 text-center text-sm text-zinc-500"
            >
              <UIcon
                name="i-lucide-activity"
                class="w-8 h-8 mx-auto mb-3 text-zinc-400"
              />
              <p>L'historique d'activité sera disponible prochainement.</p>
            </div>
          </div>
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
