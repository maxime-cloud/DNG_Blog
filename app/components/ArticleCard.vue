<template>
<div class="w-96 md:w-96 mx-auto lg:w-96 bg-CustomLight dark:bg-CustomColor-900 flex flex-col border-primary/30 dark:border-dashcolor/50 border-[0.1px] shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)]">
  <NuxtLink to="/">
    <img class="self-stretch h-52" src="https://nuxt.com/assets/blog/nuxt-icon/cover.png" />
  </NuxtLink>
  <div class="self-stretch p-6 flex flex-col">
    <div class="flex-1 h-10 inline-flex justify-start items-center gap-2">
      <CUButton label="Nuxt" size="sm" />
      <CUButton label="Nuxt" size="sm" />
      <CUButton label="Nuxt" size="sm" />
    </div>
    <div class="pb-2 inline-flex justify-start items-center gap-2">
      <div class="justify-start text-zinc-500 text-sm font-normal font-['DM_Sans'] leading-5">Nov 25, 2024</div>
    </div>
    <div class="self-stretch flex flex-col justify-start items-start gap-1">
      <div class="self-stretch justify-start text-text-color text-xl font-semibold leading-7">Introducing Nuxt Icon v1</div>
      <div class="self-stretch justify-start text-zinc-500 text-base font-normal leading-6">Discover Nuxt Icon v1 - a modern, versatile, and customizable icon solution for your Nuxt projects.</div>
    </div>
    <div class="self-stretch pt-2.5 flex justify-between items-end gap-2.5">
      <div class=" bg-CustomColor-900 flex flex-wrap text-text shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] border-dashcolor/50 border-[0.1px]">
        <UButton icon="i-lucide-eye" size="sm" label="200" class="text-white cursor-pointer rounded-none button border-dashcolor/50 border-r" />
        <UButton icon="i-lucide-heart" size="sm" label="12" class="text-white cursor-pointer rounded-none button border-dashcolor/50" />
      </div>
      <NuxtLink to="/">
        <CUButton class="" label="Voir l’artivle" size="sm" logoPosition="right" logoName="i-lucide-arrow-right" />
      </NuxtLink>
    </div>
  </div>
</div>
</template>