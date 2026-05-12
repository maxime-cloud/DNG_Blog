<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Nouvel article' })

const router = useRouter()
const toast = useToast()
const loading = ref(false)

const form = reactive({
  title: '',
  content: '',
  description: '',
  coverImage: '',
  categoryId: null as number | null,
  tags: [] as string[],
  seriesId: null as number | null,
  seriesOrder: null as number | null,
  metaTitle: '',
  metaDescription: '',
  scheduledAt: ''
})

const newTag = ref('')

const { data: categoriesData } = await useFetch('/api/categories')
const categories = computed(() => categoriesData.value?.data ?? [])

const { data: seriesData } = await useFetch('/api/series')
const seriesList = computed(() => seriesData.value?.data ?? [])

function addTag() {
  const t = newTag.value.trim()
  if (t && !form.tags.includes(t)) {
    form.tags.push(t)
  }
  newTag.value = ''
}

function removeTag(tag: string) {
  form.tags = form.tags.filter(t => t !== tag)
}

async function save(publish = false) {
  if (!form.title.trim()) {
    toast.add({ title: 'Le titre est requis', color: 'error' })
    return
  }
  loading.value = true
  try {
    const article = await $fetch('/api/articles', {
      method: 'POST',
      body: {
        title: form.title,
        content: form.content,
        description: form.description,
        coverImage: form.coverImage || undefined,
        categoryId: form.categoryId ?? undefined,
        tags: form.tags,
        seriesId: form.seriesId ?? undefined,
        seriesOrder: form.seriesOrder,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        scheduledAt: form.scheduledAt || undefined
      }
    })
    if (publish) {
      await $fetch(`/api/articles/${article.id}/publish`, { method: 'PATCH' })
    }
    toast.add({ title: publish ? 'Article publié' : 'Brouillon sauvegardé', color: 'success' })
    router.push('/admin/articles')
  } catch {
    toast.add({ title: 'Erreur lors de la sauvegarde', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-6xl">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/articles">
          <CUButton size="sm" logo-name="i-lucide-arrow-left" logo-position="left" label="Retour" />
        </NuxtLink>
        <h1 class="text-2xl font-bold text-[#0F0F0F] dark:text-white">Nouvel article</h1>
      </div>
      <div class="flex gap-2">
        <CUButton label="Sauvegarder" size="md" :loading="loading" @click="save(false)" />
        <CUButton
          label="Publier"
          size="md"
          :loading="loading"
          logo-name="i-lucide-send"
          logo-position="left"
          @click="save(true)"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main column -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium mb-1">Titre *</label>
          <CUInput v-model="form.title" placeholder="Titre de l'article" class="w-full text-lg" />
        </div>

        <!-- Excerpt -->
        <div>
          <label class="block text-sm font-medium mb-1">Extrait / Description</label>
          <textarea
            v-model="form.description"
            rows="2"
            class="w-full bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 outline-none text-sm resize-none"
            placeholder="Résumé court de l'article (affiché dans les cartes)..."
          />
        </div>

        <!-- Content -->
        <div>
          <label class="block text-sm font-medium mb-1">Contenu (Markdown)</label>
          <AdminMarkdownEditor v-model="form.content" />
        </div>

        <!-- SEO section -->
        <details class="border-[0.1px] border-dashed border-dashcolor/50">
          <summary class="px-4 py-3 cursor-pointer text-sm font-medium bg-[#EEE] dark:bg-[#111]">
            SEO (optionnel)
          </summary>
          <div class="p-4 flex flex-col gap-3">
            <div>
              <label class="block text-xs text-zinc-500 mb-1">Meta title</label>
              <CUInput
                v-model="form.metaTitle"
                placeholder="Meta title (défaut: titre de l'article)"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-xs text-zinc-500 mb-1">Meta description</label>
              <textarea
                v-model="form.metaDescription"
                rows="2"
                class="w-full bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 outline-none text-sm resize-none"
                placeholder="Meta description (max 160 chars)"
              />
            </div>
          </div>
        </details>
      </div>

      <!-- Sidebar -->
      <div class="flex flex-col gap-4">
        <!-- Cover image -->
        <div
          class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4"
        >
          <AdminCoverUpload v-model="form.coverImage" />
        </div>

        <!-- Category -->
        <div
          class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4"
        >
          <label class="block text-sm font-medium mb-2">Catégorie</label>
          <select
            v-model="form.categoryId"
            class="w-full bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none"
          >
            <option :value="null">Aucune catégorie</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Tags -->
        <div
          class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4"
        >
          <label class="block text-sm font-medium mb-2">Tags</label>
          <div class="flex gap-2 mb-2">
            <CUInput
              v-model="newTag"
              placeholder="Ajouter un tag"
              class="flex-1"
              @keyup.enter="addTag"
            />
            <CUButton size="sm" label="+" @click="addTag" />
          </div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-primary/10 border-[0.1px] border-dashed border-primary/40 text-primary cursor-pointer"
              @click="removeTag(tag)"
            >
              {{ tag }} ×
            </span>
          </div>
        </div>

        <!-- Series -->
        <div
          class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4"
        >
          <label class="block text-sm font-medium mb-2">Série</label>
          <select
            v-model="form.seriesId"
            class="w-full bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none mb-2"
          >
            <option :value="null">Aucune série</option>
            <option v-for="s in seriesList" :key="s.id" :value="s.id">
              {{ s.title }}
            </option>
          </select>
          <div v-if="form.seriesId">
            <label class="block text-xs text-zinc-500 mb-1">Ordre dans la série</label>
            <CUInput v-model.number="form.seriesOrder" type="number" min="1" class="w-full" />
          </div>
        </div>

        <!-- Scheduled publish -->
        <div
          class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4"
        >
          <label class="block text-sm font-medium mb-2">Publication planifiée</label>
          <input
            v-model="form.scheduledAt"
            type="datetime-local"
            class="w-full bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none"
          />
        </div>
      </div>
    </div>
  </div>
</template>
