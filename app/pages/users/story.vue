<script setup>
definePageMeta({ middleware: 'auth' })

const { data: history, refresh } = await useFetch('/api/users/me/history', {
  query: { limit: 50 }
})

async function clearHistory() {
  await $fetch('/api/users/me/history', { method: 'DELETE' })
  refresh()
}

useSeoMeta({ title: 'Mon historique' })
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="py-10 px-4">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-bold">
            Historique de lecture
          </h1>
          <CUButton
            v-if="history?.data?.length"
            label="Effacer l'historique"
            logo-name="i-lucide-trash"
            @click="clearHistory"
          />
        </div>

        <div
          v-if="!history?.data?.length"
          class="text-center py-20 text-zinc-500"
        >
          Votre historique est vide.
        </div>
        <div
          v-else
          class="space-y-4"
        >
          <div
            v-for="item in history.data"
            :key="item.articleId"
            class="flex items-center gap-4 p-4 border-[0.1px] border-dashed border-dashcolor/50"
          >
            <div class="flex-1">
              <NuxtLink
                :to="`/article/${item.article.slug}`"
                class="font-medium hover:text-primary"
              >
                {{ item.article.title }}
              </NuxtLink>
              <p class="text-xs text-zinc-500 mt-1">
                Lu le {{ new Date(item.viewedAt).toLocaleDateString("fr-FR") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
