<script setup lang="ts">
interface ArticleAuthor {
  name: string
  image?: string | null
}

interface ArticleCategory {
  name: string
  slug: string
  color?: string | null
  colorb?: string | null
}

interface ArticleTag {
  name: string
  slug: string
}

interface ArticleCount {
  comments?: number
  likes?: number
}

interface Article {
  id?: string
  slug: string
  title: string
  description?: string | null
  excerpt?: string | null
  coverImage?: string | null
  coverImageUrl?: string | null
  publishedAt?: string | Date | null
  author?: ArticleAuthor | null
  category?: ArticleCategory | null
  tags?: ArticleTag[]
  likesCount?: number
  _count?: ArticleCount
}

const props = defineProps<{ article: Article }>()

const cover = computed(() => props.article.coverImage ?? props.article.coverImageUrl ?? null)
const excerpt = computed(() => props.article.description ?? props.article.excerpt ?? null)
const likes = computed(() => props.article.likesCount ?? props.article._count?.likes ?? 0)
const comments = computed(() => props.article._count?.comments ?? 0)

function formatDate(date?: string | Date | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div
    v-motion-fade-visible
    class="bg-CustomColor-900 flex flex-col flex-1 border-dashcolor/50 border-[0.1px] shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] transition hover:border-blue-500/30 group"
  >
    <!-- Cover image -->
    <NuxtLink :to="`/article/${article.slug}`">
      <div class="overflow-hidden h-48 bg-[#111]">
        <img
          v-if="cover"
          :src="cover"
          :alt="article.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <UIcon name="i-lucide-image-off" class="w-10 h-10 text-zinc-400" />
        </div>
      </div>
    </NuxtLink>

    <!-- Content -->
    <div class="flex-1 p-5 flex flex-col gap-3">
      <!-- Category + date -->
      <div class="flex items-center justify-between gap-2 text-xs text-zinc-500">
        <NuxtLink
          v-if="article.category"
          :to="`/categories/${article.category.slug}`"
          class="font-semibold uppercase tracking-wider hover:text-primary transition-colors"
          :style="article.category.color ? `color: ${article.category.color}` : ''"
        >
          {{ article.category.name }}
        </NuxtLink>
        <span v-else />
        <time v-if="article.publishedAt" :datetime="String(article.publishedAt)">
          {{ formatDate(article.publishedAt) }}
        </time>
      </div>

      <!-- Title -->
      <NuxtLink :to="`/article/${article.slug}`">
        <h3 class="text-base font-semibold text-[#F3F4F6] leading-snug line-clamp-2">
          {{ article.title }}
        </h3>
      </NuxtLink>

      <!-- Excerpt -->
      <p v-if="excerpt" class="text-sm text-[#F3F4F6]/60 line-clamp-2 flex-1">
        {{ excerpt }}
      </p>

      <!-- Footer: author + stats -->
      <div
        class="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-dashed border-dashcolor/30"
      >
        <!-- Author -->
        <div v-if="article.author" class="flex items-center gap-2 text-xs text-zinc-500">
          <UAvatar
            :src="article.author.image ?? undefined"
            :alt="article.author.name"
            size="xs"
            class="rounded-none"
          />
          <span>{{ article.author.name }}</span>
        </div>
        <span v-else />

        <!-- Stats -->
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 text-xs text-zinc-500">
            <UIcon name="i-lucide-heart" class="w-3.5 h-3.5" />
            <span>{{ likes }}</span>
          </div>
          <div v-if="comments > 0" class="flex items-center gap-1 text-xs text-zinc-500">
            <UIcon name="i-lucide-message-circle" class="w-3.5 h-3.5" />
            <span>{{ comments }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
