<script setup lang="ts">
useSeoMeta({
  title: 'Séries — StackTrace',
  description: 'Toutes les séries d\'articles du blog StackTrace'
})

interface Series {
  id: string
  slug: string
  title: string
  description: string | null
  coverImageUrl: string | null
  articlesCount: number
  firstArticleSlug: string | null
}

const { data: seriesData, pending } = await useFetch<{ data: Series[] }>('/api/series')
const seriesList = computed(() => seriesData.value?.data ?? [])
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="pt-10 mb-10 px-4">
        <SectionTitle label="Séries" />

        <!-- Loading -->
        <div
          v-if="pending"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
        >
          <div
            v-for="i in 6"
            :key="i"
            class="h-72 bg-[#111] border-[0.1px] border-dashed border-dashcolor/30 animate-pulse"
          />
        </div>

        <!-- Grid -->
        <div
          v-else-if="seriesList.length"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
        >
          <NuxtLink
            v-for="series in seriesList"
            :key="series.id"
            :to="`/series/${series.slug}`"
            class="group bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none flex flex-col transition hover:border-blue-500/30"
          >
            <!-- Cover -->
            <div class="h-44 overflow-hidden bg-[#111]">
              <img
                v-if="series.coverImageUrl"
                :src="series.coverImageUrl"
                :alt="series.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              >
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
              >
                <UIcon
                  name="i-lucide-layers"
                  class="w-10 h-10 text-zinc-400"
                />
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 p-5 flex flex-col gap-3">
              <div class="flex items-center gap-2 text-xs text-zinc-500">
                <UIcon
                  name="i-lucide-layers"
                  class="w-3.5 h-3.5 text-primary"
                />
                <span class="font-semibold uppercase tracking-wider text-primary">Série</span>
              </div>

              <h3
                class="text-base font-semibold text-[#F3F4F6] line-clamp-2 transition-colors leading-snug"
              >
                {{ series.title }}
              </h3>

              <p
                v-if="series.description"
                class="text-sm text-[#F3F4F6]/60 line-clamp-2 flex-1"
              >
                {{ series.description }}
              </p>

              <div
                class="flex items-center justify-between pt-2 border-t border-dashed border-dashcolor/30 text-xs text-zinc-500"
              >
                <div class="flex items-center gap-1.5">
                  <UIcon
                    name="i-lucide-book-open"
                    class="w-3.5 h-3.5"
                  />
                  <span>{{ series.articlesCount }} épisode{{
                    series.articlesCount > 1 ? 's' : ''
                  }}</span>
                </div>
                <div class="flex items-center gap-1 group-hover:text-white transition-colors">
                  <span>Voir la série</span>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="w-3.5 h-3.5"
                  />
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4"
        >
          <UIcon
            name="i-lucide-layers"
            class="w-12 h-12"
          />
          <p>Aucune série disponible pour le moment.</p>
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
