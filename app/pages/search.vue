<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const query = ref((route.query.q as string) ?? '')
const results = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)

async function doSearch() {
  if (!query.value.trim()) return
  loading.value = true
  const data = await $fetch('/api/search', { query: { q: query.value, page: page.value } })
  results.value = data.data
  total.value = data.total
  loading.value = false
  router.push({ query: { q: query.value } })
}

watch(query, () => {
  page.value = 1
})
onMounted(() => {
  if (query.value) doSearch()
})

useSeoMeta({ title: 'Recherche' })
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="py-10 px-4 max-w-3xl mx-auto">
        <!-- Search bar -->
        <div class="flex gap-2 mb-8">
          <CUInput
            v-model="query"
            placeholder="Rechercher des articles..."
            class="flex-1"
            @keyup.enter="doSearch"
          />
          <CUButton
            label="Rechercher"
            @click="doSearch"
          />
        </div>

        <!-- Loading -->
        <div
          v-if="loading"
          class="text-center text-zinc-500 py-10"
        >
          Recherche en cours...
        </div>

        <!-- Results -->
        <div v-else-if="results.length">
          <p class="text-sm text-zinc-500 mb-4">
            {{ total }} résultat(s) pour "{{ query }}"
          </p>
          <div class="space-y-4">
            <NuxtLink
              v-for="r in results"
              :key="r.id"
              :to="`/article/${r.slug}`"
              class="block p-4 border-[0.1px] border-dashed border-dashcolor/50 hover:border-primary/60 transition"
            >
              <h3 class="font-semibold mb-1">{{ r.title }}</h3>
              <p class="text-sm text-zinc-500 line-clamp-2">{{ r.description }}</p>
              <p class="text-xs text-zinc-400 mt-2">
                {{ r.publishedAt ? new Date(r.publishedAt).toLocaleDateString('fr-FR') : '' }}
              </p>
            </NuxtLink>
          </div>
          <Pagination
            v-if="total > 20"
            :current-page="page"
            :total-pages="Math.ceil(total / 20)"
            class="mt-8"
            @update:page="
              (p: number) => {
                page = p
                doSearch()
              }
            "
          />
        </div>

        <!-- Empty state -->
        <div
          v-else-if="query && !loading"
          class="text-center py-20 text-zinc-500"
        >
          <p>Aucun résultat pour "{{ query }}"</p>
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
