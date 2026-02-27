<template>
<UCarousel
ref="myHoverableElement"
class="mx-auto sm:w-full"
    v-slot="{ item }"
    loop
    arrows
    :autoplay="!isHovered ? { delay: 2000 } : false"
    wheel-gestures
    :items="items"
    :ui="{ 
      item: 'basis-1/1 xl:basis-1/3 sm:basis-[70%] md:basis-[60%] lg:basis-[45%]',
      prev: 'sm:start-8 hover:bg-white dark:hover:bg-primary -translate-y-20 cursor-pointer',
      next: 'sm:end-8 hover:bg-white dark:hover:bg-primary -translate-y-20 cursor-pointer',
    }"
  >
    <ArticleCard :article="item" />
</UCarousel>
</template>

<script setup lang="ts">
const myHoverableElement = useTemplateRef('myHoverableElement')
const isHovered = useElementHover(myHoverableElement)


const items:{
id: string,
title: string,
excert: string,
coverImageUrl: string,
updatedAt: string,
// updatedAt: Date,
tags: string[],
categories: string[],
likes: number,
views: number,
}[] = {
  id: "EUE23",
  title: "Article Title",
  excert: "Article Excerpt",
  coverImageUrl: "https://www.mensjournal.com/.image/w_750,q_auto:good,c_fill,ar_16:9/NDI6MDAwMDAwMDAxMDgxNDk5/sleep-banking-header.jpg?arena_f_auto",
  updatedAt: "new Date()",
  tags: ["tag1", "tag2"],
  categories: ["nuxt", "fedora", "linux"],
  likes: 12,
  views: 120
}
</script>
