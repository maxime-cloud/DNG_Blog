<script setup>
definePageMeta({ middleware: "auth" });

const { data: favorites, pending } = await useFetch("/api/users/me/favorites", {
  query: { limit: 20, page: 1 },
});

useSeoMeta({ title: "Mes favoris" });
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="py-10 px-4">
        <h1 class="text-3xl font-bold mb-8">Mes favoris</h1>
        <div v-if="pending">Chargement...</div>
        <div
          v-else-if="!favorites?.data?.length"
          class="text-center py-20 text-zinc-500"
        >
          Aucun article en favori pour l'instant.
        </div>
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <ArticleCard
            v-for="article in favorites.data"
            :key="article.id"
            :article="article"
          />
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
