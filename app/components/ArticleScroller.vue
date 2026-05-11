<template>
  <UCarousel
    ref="myHoverableElement"
    v-slot="{ item }"
    class="mx-auto sm:w-full"
    loop
    arrows
    :autoplay="!isHovered ? { delay: 5000 } : false"
    wheel-gestures
    :items="articles"
    :ui="{
      item: 'basis-1/1 xl:basis-1/3 sm:basis-[70%] md:basis-[60%] lg:basis-[45%]',
      prev: 'sm:start-8 hover:bg-white dark:hover:bg-primary -translate-y-20 cursor-pointer',
      next: 'sm:end-8 hover:bg-white dark:hover:bg-primary -translate-y-20 cursor-pointer'
    }"
  >
    <ArticleCard :article="item" />
  </UCarousel>
</template>

<script setup lang="ts">
const props = defineProps<{
  sort?: 'latest' | 'popular' | 'oldest'
  limit?: number
}>()

const myHoverableElement = useTemplateRef('myHoverableElement')
const isHovered = useElementHover(myHoverableElement)

const { data } = await useFetch('/api/articles', {
  query: {
    sort: props.sort ?? 'latest',
    limit: props.limit ?? 6
  }
})

const articles = computed(() => data.value?.data ?? [])
</script>
