<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(false)
const id = Number(route.params.id)

const { data: articleData, error } = await useFetch(`/api/admin/articles/${id}`)
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })

useSeoMeta({ title: () => `Éditer — ${articleData.value?.title ?? ''}` })

const form = reactive({
  title: articleData.value?.title ?? '',
  content: articleData.value?.content ?? '',
  description: articleData.value?.excerpt ?? '',
  coverImage: articleData.value?.coverImageUrl ?? '',
  categoryId: articleData.value?.category?.id ?? (null as number | null),
  tags: (articleData.value?.tags ?? []) as string[],
  seriesId: articleData.value?.series?.id ?? (null as number | null),
  seriesOrder: articleData.value?.seriesOrder ?? (null as number | null),
  metaTitle: articleData.value?.metaTitle ?? '',
  metaDescription: articleData.value?.metaDescription ?? '',
  status: articleData.value?.status ?? 'DRAFT'
})

const newTag = ref('')

const { data: categoriesData } = await useFetch('/api/categories')
const categories = computed(() => categoriesData.value?.data ?? [])

const { data: seriesData } = await useFetch('/api/series')
const seriesList = computed(() => seriesData.value?.data ?? [])

const { data: tagsData } = await useFetch('/api/tags')
const popularTags = computed(() => (tagsData.value?.data ?? []).slice(0, 6).map((t: any) => t.name))

const { data: revisionsData, refresh: refreshRevisions } = await useFetch(
  `/api/admin/articles/${id}/revisions`
)
const revisions = computed(() => revisionsData.value?.data ?? [])

function addTag() {
  const t = newTag.value.trim()
  if (t && !form.tags.includes(t)) form.tags.push(t)
  newTag.value = ''
}

function removeTag(tag: string) {
  form.tags = form.tags.filter(t => t !== tag)
}

function togglePopularTag(tag: string) {
  if (form.tags.includes(tag)) removeTag(tag)
  else form.tags.push(tag)
}

async function save() {
  if (!form.title.trim()) {
    toast.add({ title: 'Le titre est requis', color: 'error' })
    return
  }
  loading.value = true
  try {
    await $fetch(`/api/articles/${id}`, {
      method: 'PATCH',
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
        metaDescription: form.metaDescription || undefined
      }
    })
    toast.add({ title: 'Article mis à jour', color: 'success' })
    refreshRevisions()
  } catch {
    toast.add({ title: 'Erreur lors de la sauvegarde', color: 'error' })
  } finally {
    loading.value = false
  }
}

async function publish() {
  loading.value = true
  try {
    await save()
    await $fetch(`/api/articles/${id}/publish`, { method: 'PATCH' })
    form.status = 'PUBLISHED'
    toast.add({ title: 'Article publié', color: 'success' })
  } catch {
    toast.add({ title: 'Erreur lors de la publication', color: 'error' })
  } finally {
    loading.value = false
  }
}

async function archive() {
  await $fetch(`/api/articles/${id}/archive`, { method: 'PATCH' })
  form.status = 'ARCHIVED'
  toast.add({ title: 'Article archivé', color: 'success' })
}

async function restoreRevision(revisionId: number) {
  await $fetch(`/api/admin/articles/${id}/revisions/restore`, {
    method: 'POST',
    body: { revisionId }
  })
  toast.add({ title: 'Révision restaurée', color: 'success' })
  router.go(0)
}
</script>

<template>
  <div class="p-6 max-w-6xl">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/articles">
          <CUButton size="sm" logo-name="i-lucide-arrow-left" logo-position="left" label="Retour" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold text-white">Éditer l'article</h1>
          <UBadge :label="form.status" size="sm" class="mt-1" />
        </div>
      </div>
      <div class="flex gap-2">
        <CUButton label="Sauvegarder" size="md" :loading="loading" @click="save" />
        <CUButton
          v-if="form.status !== 'PUBLISHED'"
          label="Publier"
          size="md"
          :loading="loading"
          logo-name="i-lucide-send"
          logo-position="left"
          @click="publish"
        />
        <CUButton
          v-if="form.status === 'PUBLISHED'"
          label="Archiver"
          size="md"
          logo-name="i-lucide-archive"
          logo-position="left"
          @click="archive"
        />
      </div>
    </div>

    <!-- Revisions selector -->
    <div
      v-if="revisions.length"
      class="mb-4 flex items-center gap-3 p-3 bg-[#111] border-[0.1px] border-dashed border-dashcolor/50"
    >
      <UIcon name="i-lucide-history" class="w-4 h-4 text-zinc-500" />
      <span class="text-sm text-zinc-500">Révisions :</span>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="rev in revisions"
          :key="rev.id"
          class="text-xs px-2 py-1 border-[0.1px] border-dashed border-dashcolor/50 hover:border-primary/50 hover:text-primary transition-colors"
          @click="restoreRevision(rev.id)"
        >
          {{
            new Date(rev.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })
          }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main column -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium mb-1">Titre *</label>
          <CUInput v-model="form.title" placeholder="Titre de l'article" class="w-full" />
        </div>

        <!-- Excerpt -->
        <div>
          <label class="block text-sm font-medium mb-1">Extrait / Description</label>
          <textarea
            v-model="form.description"
            rows="2"
            class="w-full bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 outline-none text-sm resize-none"
            placeholder="Résumé court affiché dans les cartes..."
          />
        </div>

        <!-- Content editor -->
        <div>
          <label class="block text-sm font-medium mb-1">Contenu (Markdown)</label>
          <AdminMarkdownEditor v-model="form.content" />
        </div>

        <!-- SEO -->
        <details class="border-[0.1px] border-dashed border-dashcolor/50">
          <summary class="px-4 py-3 cursor-pointer text-sm font-medium bg-[#111]">
            SEO (optionnel)
          </summary>
          <div class="p-4 flex flex-col gap-3">
            <div>
              <label class="block text-xs text-zinc-500 mb-1">Meta title</label>
              <CUInput
                v-model="form.metaTitle"
                placeholder="Défaut : titre de l'article"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-xs text-zinc-500 mb-1">Meta description</label>
              <textarea
                v-model="form.metaDescription"
                rows="2"
                class="w-full bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 outline-none text-sm resize-none"
                placeholder="Max 160 caractères"
              />
            </div>
          </div>
        </details>
      </div>

      <!-- Sidebar -->
      <div class="flex flex-col gap-4">
        <!-- Cover image -->
        <div class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4">
          <AdminCoverUpload v-model="form.coverImage" />
        </div>

        <!-- Category -->
        <div class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4">
          <label class="block text-sm font-medium mb-2">Catégorie</label>
          <select
            v-model="form.categoryId"
            class="w-full bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none"
          >
            <option :value="null">Aucune catégorie</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Tags -->
        <div class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4">
          <label class="block text-sm font-medium mb-2">Tags</label>

          <!-- Top 6 popular tags -->
          <div v-if="popularTags.length" class="flex flex-wrap gap-1 mb-3">
            <button
              v-for="tag in popularTags"
              :key="tag"
              type="button"
              class="inline-flex items-center text-xs px-2 py-0.5 border-[0.1px] border-dashed transition-colors cursor-pointer"
              :class="
                form.tags.includes(tag)
                  ? 'bg-primary border-primary text-white'
                  : 'bg-[#111] border-dashcolor/50 text-[#F3F4F6]/70 hover:border-primary/50 hover:text-[#F3F4F6]'
              "
              @click="togglePopularTag(tag)"
            >
              {{ tag }}
            </button>
          </div>

          <!-- Custom tag input -->
          <div class="flex gap-2 mb-2">
            <CUInput
              v-model="newTag"
              placeholder="Ajouter un tag personnalisé"
              class="flex-1"
              @keyup.enter="addTag"
            />
            <CUButton size="sm" label="+" @click="addTag" />
          </div>

          <!-- Selected tags -->
          <div v-if="form.tags.length" class="flex flex-wrap gap-1">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-[#1a1a1a] border-[0.1px] border-dashed border-dashcolor/50 text-[#F3F4F6] cursor-pointer hover:border-red-400/50 hover:text-red-400 transition-colors"
              @click="removeTag(tag)"
            >
              {{ tag }} ×
            </span>
          </div>
        </div>

        <!-- Series -->
        <div class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-4">
          <label class="block text-sm font-medium mb-2">Série</label>
          <select
            v-model="form.seriesId"
            class="w-full bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none mb-2"
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
      </div>
    </div>
  </div>
</template>
