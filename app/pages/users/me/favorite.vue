<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: favoritesData, pending } = useLazyFetch<any>('/api/users/me/favorites')
const favorites = computed(() => favoritesData.value?.data ?? [])
</script>

<template>
  <div class="pt-8">
    <SkeletonsArticleGridSkeleton v-if="pending" :count="3" />

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
