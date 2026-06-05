<script setup lang="ts">
const route = useRoute()
const { isLoggedIn } = useAuth()

interface LearningPathStep {
  id: number
  stepOrder: number
  stepTitle: string | null
  article: { slug: string, title: string } | null
  completed: boolean | null
}

interface UserProgress {
  completedSteps: number
  totalSteps: number
}

interface LearningPath {
  id: string
  title: string
  slug: string
  description: string | null
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  coverImageUrl: string | null
  isPublished: boolean
  steps: LearningPathStep[]
  userProgress: UserProgress | null
}

const { data: pathData, error } = await useFetch<{ data: LearningPath }>(
  `/api/learning-paths/${route.params.slug}`
)

if (error.value) throw createError({ statusCode: 404, statusMessage: 'Parcours introuvable' })

const path = computed(() => pathData.value?.data ?? null)

useSeoMeta({
  title: () => path.value?.title ?? 'Parcours',
  description: () => path.value?.description ?? ''
})

const difficultyLabel: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé'
}

const difficultyColor: Record<string, string> = {
  BEGINNER: 'text-green-500 border-green-500/40',
  INTERMEDIATE: 'text-yellow-500 border-yellow-500/40',
  ADVANCED: 'text-red-500 border-red-500/40'
}

const progressPercent = computed(() => {
  const p = path.value?.userProgress
  if (!p || p.totalSteps === 0) return 0
  return Math.round((p.completedSteps / p.totalSteps) * 100)
})

const showProgress = computed(() => isLoggedIn.value && (path.value?.steps?.length ?? 0) > 0)
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="px-4 pt-10 pb-4">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <NuxtLink
            to="/"
            class="hover:text-[#F3F4F6] transition-colors"
          >
            Accueil
          </NuxtLink>
          <UIcon
            name="i-lucide-chevron-right"
            class="w-3 h-3"
          />
          <NuxtLink
            to="/training"
            class="hover:text-[#F3F4F6] transition-colors"
          >
            Parcours
          </NuxtLink>
          <UIcon
            name="i-lucide-chevron-right"
            class="w-3 h-3"
          />
          <span class="text-[#F3F4F6] truncate max-w-[200px]">
            {{ path?.title }}
          </span>
        </nav>

        <!-- Header card -->
        <div
          class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none mb-8"
        >
          <!-- Cover image -->
          <div
            v-if="path?.coverImageUrl"
            class="overflow-hidden rounded-none"
          >
            <img
              :src="path.coverImageUrl"
              :alt="path.title"
              class="w-full h-52 sm:h-64 object-cover"
              loading="eager"
            >
          </div>

          <div class="p-6 sm:p-8">
            <!-- Difficulty badge + label -->
            <div class="flex items-center gap-3 mb-3">
              <UIcon
                name="i-lucide-graduation-cap"
                class="w-4 h-4 text-primary"
              />
              <span class="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Parcours d'apprentissage
              </span>
              <span
                v-if="path?.difficulty"
                :class="difficultyColor[path.difficulty]"
                class="text-xs font-semibold px-2 py-0.5 border-[0.1px] border-dashed rounded-none"
              >
                {{ difficultyLabel[path.difficulty] ?? path.difficulty }}
              </span>
            </div>

            <h1
              class="text-[24px] sm:text-[32px] lg:text-[38px] font-bold text-[#FFFFFF] leading-tight mb-4"
            >
              {{ path?.title }}
            </h1>

            <p
              v-if="path?.description"
              class="text-base text-[#F3F4F6]/70 mb-5 max-w-3xl"
            >
              {{ path.description }}
            </p>

            <div class="flex items-center gap-4 text-sm text-zinc-500 mb-5">
              <div class="flex items-center gap-1.5">
                <UIcon
                  name="i-lucide-list-ordered"
                  class="w-4 h-4"
                />
                <span>
                  {{ path?.steps?.length ?? 0 }} étape{{
                    (path?.steps?.length ?? 0) > 1 ? 's' : ''
                  }}
                </span>
              </div>
              <div
                v-if="showProgress && path?.userProgress"
                class="flex items-center gap-1.5"
              >
                <UIcon
                  name="i-lucide-check-circle"
                  class="w-4 h-4 text-green-500"
                />
                <span>
                  {{ path.userProgress.completedSteps }}/{{ path.userProgress.totalSteps }}
                  complétées
                </span>
              </div>
            </div>

            <!-- Progress bar (logged in only) -->
            <div v-if="showProgress">
              <div class="flex items-center justify-between mb-1.5 text-xs text-zinc-500">
                <span>Progression</span>
                <span>{{ progressPercent }}%</span>
              </div>
              <div
                class="w-full h-1.5 bg-[#F3F4F6]/10 border-[0.1px] border-dashed border-dashcolor/30 rounded-none overflow-hidden"
              >
                <div
                  class="h-full bg-primary transition-all duration-500"
                  :style="{ width: `${progressPercent}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Step list -->
        <div class="mb-10">
          <h2 class="text-xl font-semibold text-[#FFFFFF] mb-4">
            Étapes du parcours
          </h2>

          <div
            v-if="path?.steps?.length"
            class="flex flex-col gap-3"
          >
            <NuxtLink
              v-for="step in path.steps"
              :key="step.id"
              :to="step.article ? `/training/${route.params.slug}/${step.article.slug}` : '#'"
              class="group bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4 sm:p-5 flex items-center gap-4 transition hover:border-blue-500/50"
            >
              <!-- Step number or checkmark -->
              <div
                class="shrink-0 w-10 h-10 flex items-center justify-center border-[0.1px] border-dashed rounded-none text-sm font-bold"
                :class="
                  step.completed
                    ? 'bg-green-500/10 border-green-500/40 text-green-500'
                    : 'bg-primary/10 border-primary/40 text-primary'
                "
              >
                <UIcon
                  v-if="step.completed"
                  name="i-lucide-check"
                  class="w-5 h-5"
                />
                <span v-else>{{ step.stepOrder }}</span>
              </div>

              <!-- Step info -->
              <div class="flex-1 min-w-0">
                <p
                  class="text-[#F3F4F6] font-semibold text-sm sm:text-base truncate transition-colors"
                  :class="{ 'line-through text-zinc-500': step.completed }"
                >
                  {{ step.stepTitle ?? step.article?.title ?? `Étape ${step.stepOrder}` }}
                </p>
                <p
                  v-if="step.stepTitle && step.article?.title"
                  class="text-xs text-zinc-500 mt-0.5 truncate"
                >
                  {{ step.article.title }}
                </p>
              </div>

              <!-- Completed badge or arrow -->
              <div class="shrink-0">
                <span
                  v-if="step.completed"
                  class="text-xs text-green-500 font-semibold"
                >
                  Terminé
                </span>
                <UIcon
                  v-else
                  name="i-lucide-arrow-right"
                  class="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors"
                />
              </div>
              </div>
            </NuxtLink>
          </div>

          <div
            v-else
            class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-6 text-center text-sm text-zinc-500"
          >
            Aucune étape disponible pour le moment.
          </div>
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
