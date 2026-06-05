<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const pathId = Number(route.params.id)

interface Step {
  id: number
  stepOrder: number
  stepTitle: string | null
  article: { id: number, title: string, slug: string }
}

interface LearningPath {
  id: number
  title: string
  slug: string
  isPublished: boolean
  steps: Step[]
}

const { data, refresh } = await useFetch<{ data: LearningPath }>(
  `/api/admin/learning-paths/${pathId}`
)
const path = computed(() => data.value?.data ?? null)

useSeoMeta({ title: computed(() => `Étapes — ${path.value?.title ?? ''}`) })

const showAdd = ref(false)
const newStep = reactive({ articleId: '', stepOrder: '', stepTitle: '' })
const articleSearch = ref('')
const articleResults = ref<{ id: number, title: string, slug: string }[]>([])
const searching = ref(false)
const saving = ref(false)
const error = ref('')

async function searchArticles() {
  if (!articleSearch.value.trim()) {
    articleResults.value = []
    return
  }
  searching.value = true
  try {
    const res = await $fetch<{ data: { id: number, title: string, slug: string }[] }>(
      '/api/admin/articles',
      {
        query: { search: articleSearch.value, limit: 10 }
      }
    )
    articleResults.value = res.data ?? []
  } finally {
    searching.value = false
  }
}

function selectArticle(article: { id: number, title: string, slug: string }) {
  newStep.articleId = String(article.id)
  articleSearch.value = article.title
  articleResults.value = []
  if (!newStep.stepOrder) {
    newStep.stepOrder = String((path.value?.steps.length ?? 0) + 1)
  }
}

async function addStep() {
  if (!newStep.articleId || !newStep.stepOrder) return
  saving.value = true
  error.value = ''
  try {
    await $fetch(`/api/admin/learning-paths/${pathId}/steps`, {
      method: 'POST',
      body: {
        articleId: Number(newStep.articleId),
        stepOrder: Number(newStep.stepOrder),
        ...(newStep.stepTitle.trim() && { stepTitle: newStep.stepTitle.trim() })
      }
    })
    Object.assign(newStep, { articleId: '', stepOrder: '', stepTitle: '' })
    articleSearch.value = ''
    showAdd.value = false
    refresh()
  } catch (e) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage ?? 'Erreur lors de l\'ajout'
  } finally {
    saving.value = false
  }
}

async function deleteStep(stepId: number) {
  await $fetch(`/api/admin/learning-paths/${pathId}/steps/${stepId}`, { method: 'DELETE' })
  refresh()
}

async function moveStep(step: Step, direction: 'up' | 'down') {
  const steps = path.value?.steps ?? []
  const idx = steps.findIndex(s => s.id === step.id)
  if (direction === 'up' && idx === 0) return
  if (direction === 'down' && idx === steps.length - 1) return

  const other = steps[direction === 'up' ? idx - 1 : idx + 1]
  await $fetch(`/api/admin/learning-paths/${pathId}/steps/reorder`, {
    method: 'PATCH',
    body: {
      steps: [
        { id: step.id, stepOrder: other.stepOrder },
        { id: other.id, stepOrder: step.stepOrder }
      ]
    }
  })
  refresh()
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink
        to="/admin/parcours"
        class="text-zinc-500 hover:text-white transition-colors"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="w-4 h-4"
        />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold">
          Étapes du parcours
        </h1>
        <p
          v-if="path"
          class="text-sm text-zinc-500 mt-0.5"
        >
          {{ path.title }}
        </p>
      </div>
      <div class="ml-auto">
        <CUButton
          label="Ajouter une étape"
          logo-name="i-lucide-plus"
          @click="showAdd = !showAdd"
        />
      </div>
    </div>

    <!-- Add step form -->
    <div
      v-if="showAdd"
      class="border-[0.1px] border-dashed border-dashcolor/50 p-4 mb-6 space-y-3"
    >
      <p class="text-sm font-semibold">
        Ajouter une étape
      </p>

      <div class="relative">
        <CUInput
          v-model="articleSearch"
          placeholder="Rechercher un article par titre..."
          @input="searchArticles"
        />
        <div
          v-if="articleResults.length"
          class="absolute z-10 top-full left-0 right-0 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]"
        >
          <button
            v-for="article in articleResults"
            :key="article.id"
            class="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors border-b border-dashed border-dashcolor/30 last:border-0"
            @click="selectArticle(article)"
          >
            <span class="font-medium">{{ article.title }}</span>
            <span class="text-zinc-500 ml-2 text-xs">{{ article.slug }}</span>
          </button>
        </div>
      </div>

      <div class="flex gap-3">
        <CUInput
          v-model="newStep.stepOrder"
          placeholder="Ordre (ex: 1)"
          type="number"
          class="w-32"
        />
        <CUInput
          v-model="newStep.stepTitle"
          placeholder="Titre optionnel (surcharge le titre de l'article)"
          class="flex-1"
        />
      </div>

      <p
        v-if="error"
        class="text-red-400 text-sm"
      >
        {{ error }}
      </p>

      <div class="flex gap-2">
        <CUButton
          label="Ajouter"
          :loading="saving"
          @click="addStep"
        />
        <CUButton
          label="Annuler"
          @click="showAdd = false"
        />
      </div>
    </div>

    <!-- Steps list -->
    <div
      v-if="path?.steps.length"
      class="space-y-2"
    >
      <div
        v-for="(step, idx) in path.steps"
        :key="step.id"
        class="flex items-center gap-3 p-4 border-[0.1px] border-dashed border-dashcolor/50"
      >
        <!-- Order indicator -->
        <span
          class="shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 border-[0.1px] border-dashed border-primary/40 text-primary text-sm font-bold"
        >
          {{ step.stepOrder }}
        </span>

        <!-- Step info -->
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm truncate">
            {{ step.stepTitle ?? step.article.title }}
          </p>
          <p
            v-if="step.stepTitle"
            class="text-xs text-zinc-500 truncate"
          >
            {{ step.article.title }}
          </p>
          <p class="text-xs text-zinc-400">
            slug: {{ step.article.slug }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-1 shrink-0">
          <CUButton
            size="xs"
            logo-name="i-lucide-arrow-up"
            :disabled="idx === 0"
            @click="moveStep(step, 'up')"
          />
          <CUButton
            size="xs"
            logo-name="i-lucide-arrow-down"
            :disabled="idx === path!.steps.length - 1"
            @click="moveStep(step, 'down')"
          />
          <CUButton
            size="xs"
            logo-name="i-lucide-trash"
            @click="deleteStep(step.id)"
          />
        </div>
      </div>
    </div>

    <div
      v-else
      class="border-[0.1px] border-dashed border-dashcolor/50 p-8 text-center text-sm text-zinc-500"
    >
      Aucune étape dans ce parcours. Ajoutez la première étape.
    </div>
  </div>
</template>
