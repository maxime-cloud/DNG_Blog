<template>
  <nav
    class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4"
  >
    <p
      class="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1"
    >
      Série
    </p>
    <NuxtLink
      :to="`/series/${series.slug}`"
      class="text-base font-bold text-[#0F0F0F] dark:text-[#F3F4F6] hover:underline block mb-3"
    >
      {{ series.title }}
    </NuxtLink>

    <ol class="flex flex-col gap-1">
      <li
        v-for="(article, index) in series.articles"
        :key="article.slug"
        class="flex items-start gap-2"
      >
        <span class="text-xs text-zinc-500 mt-0.5 shrink-0 w-4"
          >{{ index + 1 }}.</span
        >
        <NuxtLink
          :to="`/articles/${article.slug}`"
          class="text-sm transition-colors block truncate"
          :class="
            article.slug === currentSlug
              ? 'text-primary font-semibold'
              : 'text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70 hover:text-[#0F0F0F] dark:hover:text-[#F3F4F6]'
          "
        >
          {{ article.title }}
        </NuxtLink>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface SeriesArticle {
  id: number;
  slug: string;
  title: string;
  seriesOrder: number;
}

interface Series {
  title: string;
  slug: string;
  articles: SeriesArticle[];
}

defineProps<{
  series: Series;
  currentSlug: string;
}>();
</script>
