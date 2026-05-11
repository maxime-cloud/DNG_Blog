<script setup lang="ts">
useSeoMeta({
  title: "Parcours d'apprentissage — StackTrace",
  description: "Progressez avec des parcours d'apprentissage structurés"
})

const { isLoggedIn } = useAuth()

interface LearningPath {
  id: string
  slug: string
  title: string
  description: string | null
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  coverImageUrl: string | null
  _count: { steps: number }
  userProgress: { completedSteps: number } | null
}

const { data: pathsData, pending } = await useFetch<{ data: LearningPath[] }>('/api/learning-paths')
const paths = computed(() => pathsData.value?.data ?? [])

const selectedDifficulty = ref<string | null>(null)

const filtered = computed(() =>
  selectedDifficulty.value
    ? paths.value.filter(p => p.difficulty === selectedDifficulty.value)
    : paths.value
)

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

const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

function progressPercent(path: LearningPath) {
  const prog = path.userProgress
  if (!prog || path._count.steps === 0) return 0
  return Math.round((prog.completedSteps / path._count.steps) * 100)
}
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="pt-10 mb-10 px-4">
        <SectionTitle label="Parcours d'apprentissage" />

        <!-- Difficulty filters -->
        <div class="flex flex-wrap gap-2 mt-6 mb-8">
          <CUButton
            :style="
              !selectedDifficulty
                ? 'border: 0.1px solid oklch(70.7% 0.165 254.624/ 0.5); color: oklch(70.7% 0.165 254.624)'
                : ''
            "
            label="Tous les niveaux"
            size="md"
            @click="selectedDifficulty = null"
          />
          <CUButton
            v-for="d in difficulties"
            :key="d"
            :label="difficultyLabel[d]"
            :style="selectedDifficulty === d ? 'border: 0.1px solid currentColor' : ''"
            :class="selectedDifficulty === d ? difficultyColor[d] : ''"
            size="md"
            @click="selectedDifficulty = d"
          />
        </div>

        <!-- Loading -->
        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="i in 6"
            :key="i"
            class="h-80 bg-[#EEE] dark:bg-[#111] border-[0.1px] border-dashed border-primary/20 dark:border-dashcolor/30 animate-pulse"
          />
        </div>

        <!-- Grid -->
        <div
          v-else-if="filtered.length"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <NuxtLink
            v-for="path in filtered"
            :key="path.id"
            :to="`/training/${path.slug}`"
            class="group bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none flex flex-col transition hover:border-blue-500/30"
          >
            <!-- Cover -->
            <div class="h-44 overflow-hidden bg-[#EEE] dark:bg-[#111]">
              <img
                v-if="path.coverImageUrl"
                :src="path.coverImageUrl"
                :alt="path.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-lucide-graduation-cap" class="w-10 h-10 text-zinc-400" />
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 p-5 flex flex-col gap-3">
              <!-- Difficulty badge -->
              <div class="flex items-center gap-2">
                <span
                  :class="difficultyColor[path.difficulty]"
                  class="text-xs font-semibold px-2 py-0.5 border-[0.1px] border-dashed rounded-none"
                >
                  {{ difficultyLabel[path.difficulty] ?? path.difficulty }}
                </span>
                <span class="text-xs text-zinc-500 flex items-center gap-1">
                  <UIcon name="i-lucide-list-ordered" class="w-3.5 h-3.5" />
                  {{ path._count.steps }} étape{{ path._count.steps > 1 ? 's' : '' }}
                </span>
              </div>

              <h3
                class="text-base font-semibold text-[#0F0F0F] dark:text-[#F3F4F6] line-clamp-2 group-hover:text-primary transition-colors leading-snug"
              >
                {{ path.title }}
              </h3>

              <p
                v-if="path.description"
                class="text-sm text-[#0F0F0F]/60 dark:text-[#F3F4F6]/60 line-clamp-2 flex-1"
              >
                {{ path.description }}
              </p>

              <!-- Progress bar (connected users) -->
              <div v-if="isLoggedIn && path.userProgress && path._count.steps > 0" class="mt-auto">
                <div class="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span>Progression</span>
                  <span>{{ progressPercent(path) }}%</span>
                </div>
                <div
                  class="w-full h-1 bg-[#0F0F0F]/10 dark:bg-[#F3F4F6]/10 rounded-none overflow-hidden"
                >
                  <div
                    class="h-full bg-primary transition-all"
                    :style="{ width: `${progressPercent(path)}%` }"
                  />
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty -->
        <div v-else class="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4">
          <UIcon name="i-lucide-graduation-cap" class="w-12 h-12" />
          <p>Aucun parcours disponible pour le moment.</p>
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
