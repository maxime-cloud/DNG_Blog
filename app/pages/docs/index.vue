<script setup>
definePageMeta({ layout: 'docs' })

const { fetchDocsNav } = useDocs()
const navigation = await fetchDocsNav()

useSeoMeta({
  title: 'Documentation',
  description: 'Documentation technique du blog'
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-4">
    <h1 class="text-4xl font-bold mb-4">
      Documentation
    </h1>
    <p class="text-zinc-500 mb-10">
      Guides techniques, références et tutoriels.
    </p>

    <!-- Category cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NuxtLink
        v-for="section in navigation"
        :key="section.path"
        :to="section.children?.[0]?.path ?? section.path"
        class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-6 hover:border-primary/60 transition block"
      >
        <h2 class="text-lg font-semibold mb-2">{{ section.title }}</h2>
        <p class="text-sm text-zinc-500">
          {{ section.children?.length ?? 0 }} pages
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
