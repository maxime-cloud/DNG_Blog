<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const route = useRoute()
const slug = computed(() =>
  Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
)
const path = computed(() => '/docs/' + slug.value.join('/'))

const { data: page } = await useAsyncData(`docs-${path.value}`, () =>
  queryCollection('docs').path(path.value).first()
)

if (!page.value) throw createError({ statusCode: 404 })

const { data: navigation } = await useAsyncData('docs-nav', () => queryCollectionNavigation('docs'))

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description
})

const headings = computed(() => {
  if (!page.value?.body?.toc?.links) return []
  return page.value.body.toc.links.flatMap(h => [
    { id: h.id, text: h.text, depth: 2 },
    ...(h.children?.map(c => ({ id: c.id, text: c.text, depth: 3 })) ?? [])
  ])
})

const filePath = computed(() => path.value.replace('/docs', 'docs'))
</script>

<template>
  <div class="flex gap-8">
    <!-- Main content -->
    <article class="flex-1 min-w-0 py-10 px-4">
      <DocsBreadcrumb :path="path" />

      <h1 class="text-3xl font-bold mb-2">{{ page?.title }}</h1>
      <p v-if="page?.description" class="text-zinc-500 mb-8">
        {{ page?.description }}
      </p>

      <div class="prose dark:prose-invert max-w-none">
        <ContentRenderer v-if="page" :value="page" />
      </div>

      <DocsEditLink :path="filePath" />
      <DocsPrevNext />
    </article>

    <!-- Right TOC (xl only) -->
    <aside class="hidden xl:block w-56 shrink-0 py-10">
      <TableOfContents :headings="headings" />
    </aside>
  </div>
</template>
