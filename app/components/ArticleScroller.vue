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
      item: 'basis-1/1 xl:basis-1/3 sm:basis-[70%] md:basis-[60%] lg:basis-[45%] flex flex-col',
      container: 'items-stretch',
      prev: 'sm:start-4 -translate-y-20 cursor-pointer bg-CustomColor-900 border-[0.1px] border-dashcolor/50 hover:bg-primary [&_svg]:opacity-100 [&_svg]:text-white',
      next: 'sm:end-4 -translate-y-20 cursor-pointer bg-CustomColor-900 border-[0.1px] border-dashcolor/50 hover:bg-primary [&_svg]:opacity-100 [&_svg]:text-white'
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
