<template>
  <NuxtLink
    :to="`/categories/${category.slug}`"
    class="card max-w-60 md:max-w-80 bg-CustomColor-900 w-80 flex relative items-center p-4 text-white cursor-pointer rounded-none button border-dashcolor/50 transition hover:border-blue-500/50 border shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]"
  >
    <img
      v-if="category.imageUrl && category.imageUrl.startsWith('https://')"
      class="object-cover h-10 absolute top-4 right-4"
      :src="category.imageUrl"
      :alt="category.name"
    >
    <div class="flex flex-col justify-between md:p-4 leading-normal">
      <h5
        class="mb-2 text-2xl font-bold tracking-tight"
        :style="category.color ? `color: ${category.color}` : ''"
      >
        {{ category.name }}
      </h5>
      <p
        v-if="category.description"
        class="line-clamp-2 text-sm sm:text-[16px] text-[#F3F4F6]/70"
      >
        {{ category.description }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  category: {
    name: string
    slug: string
    color: string | null
    colorb: string | null
    imageUrl: string | null
    description: string | null
  }
}>()
</script>
