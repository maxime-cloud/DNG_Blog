<script setup lang="ts">
useSeoMeta({
  title: 'Catégories — StackTrace',
  description: 'Explorez les articles par catégorie : développement web, réseau, Linux et plus.'
})

interface Category {
  id: number
  slug: string
  name: string
  description: string | null
  color: string | null
  imageUrl: string | null
  _count: { articles: number }
}

const { data: categoriesData, pending } = await useFetch<{ data: Category[] }>('/api/categories')
const categories = computed(() => categoriesData.value?.data ?? [])
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="pt-10 mb-10 px-4">
        <SectionTitle label="Catégories" />
        <p class="text-sm text-[#F3F4F6]/60 mt-2">
          Parcourez les articles par thématique.
        </p>

        <!-- Loading -->
        <div
          v-if="pending"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
        >
          <SkeletonsCategoryCardSkeleton
            v-for="i in 6"
            :key="i"
            class="h-40"
          />
        </div>

        <!-- Grid -->
        <div
          v-else-if="categories.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
        >
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/categories/${cat.slug}`"
            class="group bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 flex flex-col gap-3 transition hover:border-blue-500/50"
          >
            <div class="flex items-center gap-3">
              <img
                v-if="cat.imageUrl"
                :src="cat.imageUrl"
                :alt="cat.name"
                class="w-10 h-10 object-contain shrink-0"
                loading="lazy"
              >
              <div
                v-else
                class="w-10 h-10 flex items-center justify-center border-[0.1px] border-dashed border-dashcolor/50 shrink-0"
              >
                <UIcon
                  name="i-lucide-folder"
                  class="w-5 h-5 text-zinc-400"
                />
              </div>
              <h3
                class="text-xl font-semibold leading-tight transition-colors"
                :style="cat.color ? `color: ${cat.color}` : ''"
              >
                {{ cat.name }}
              </h3>
            </div>

            <p
              v-if="cat.description"
              class="text-sm text-[#F3F4F6]/60 line-clamp-2 flex-1"
            >
              {{ cat.description }}
            </p>

            <div
              class="flex items-center justify-between pt-2 border-t border-dashed border-dashcolor/30 text-xs text-zinc-500"
            >
              <span class="flex items-center gap-1.5">
                <UIcon
                  name="i-lucide-file-text"
                  class="w-3.5 h-3.5"
                />
                {{ cat._count.articles }} article{{ cat._count.articles > 1 ? 's' : '' }}
              </span>
              <span class="flex items-center gap-1 group-hover:text-white transition-colors">
                <span>Explorer</span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="w-3.5 h-3.5"
                />
              </span>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4"
        >
          <UIcon
            name="i-lucide-folder-x"
            class="w-12 h-12"
          />
          <p>Aucune catégorie disponible pour le moment.</p>
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
