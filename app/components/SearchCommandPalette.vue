<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'

const open = defineModel<boolean>('open', { default: false })

const router = useRouter()

interface SearchArticle {
  slug: string
  title: string
  description: string | null
  category: { name: string, slug: string, color: string | null } | null
}

interface SearchResponse {
  data: SearchArticle[]
  total: number
}

const searchTerm = ref('')
const debounced = refDebounced(searchTerm, 300)
const loading = ref(false)
const articles = ref<SearchArticle[]>([])
const total = ref(0)

watch(debounced, async (q) => {
  const term = q.trim()
  if (term.length < 1) {
    articles.value = []
    total.value = 0
    return
  }
  loading.value = true
  try {
    const res = await $fetch<SearchResponse>('/api/search', { query: { q: term, limit: 8 } })
    articles.value = res.data
    total.value = res.total
  } catch {
    articles.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
})

const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => {
  const result: CommandPaletteGroup<CommandPaletteItem>[] = []

  if (articles.value.length) {
    result.push({
      id: 'articles',
      label: 'Articles',
      ignoreFilter: true,
      items: articles.value.map(a => ({
        label: a.title,
        suffix: a.category?.name ?? undefined,
        description: a.description ?? undefined,
        icon: 'i-lucide-file-text',
        onSelect: () => goTo(`/article/${a.slug}`)
      }))
    })
  }

  if (total.value > 0) {
    result.push({
      id: 'actions',
      ignoreFilter: true,
      items: [
        {
          label: `Voir les ${total.value} résultat${total.value > 1 ? 's' : ''} pour « ${debounced.value} »`,
          icon: 'i-lucide-search',
          onSelect: () => goTo(`/search?q=${encodeURIComponent(debounced.value)}`)
        }
      ]
    })
  }

  return result
})

function goTo(path: string) {
  open.value = false
  router.push(path)
}

// Reset on close
watch(open, (val) => {
  if (!val) {
    searchTerm.value = ''
    articles.value = []
    total.value = 0
  }
})
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{
      overlay: 'bg-CustomColor-900/60 backdrop-blur-xs',
      content:
        'ring-0 rounded-none bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] divide-y-0'
    }"
  >
    <template #content>
      <UCommandPalette
        v-model:search-term="searchTerm"
        :groups="groups"
        :loading="loading"
        :fuse="{ matchAllWhenSearchEmpty: false }"
        placeholder="Rechercher un article..."
        icon="i-lucide-search"
        :close="{ color: 'neutral', variant: 'ghost' }"
        class="h-96 bg-CustomColor-900 rounded-none"
        :ui="{
          input: 'bg-CustomColor-900',
          item: 'rounded-none data-highlighted:bg-primary/10',
          itemLeadingIcon: 'text-primary'
        }"
        @update:open="open = $event"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center py-10 text-zinc-500 gap-3">
            <UIcon
              :name="debounced ? 'i-lucide-search-x' : 'i-lucide-search'"
              class="w-8 h-8"
            />
            <p class="text-sm">
              {{
                debounced
                  ? `Aucun résultat pour « ${debounced} »`
                  : 'Tapez pour rechercher des articles.'
              }}
            </p>
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>
