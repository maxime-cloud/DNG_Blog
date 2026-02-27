<template>
<header class="px-4 w-full z-50 bg-CustomLight dark:bg-CustomColor-900 fixed flex flex-col items-center dark:border-b border-b-0 border-dashed border-CustomColor-900/60 dark:border-dashcolor dark:shadow-md" :class="{'h-16 backdrop-blur-sm bg-CustomLight/10 dark:bg-CustomColor-900/20 border-b-0 shadow-none': y >= activeNav, 'dark:border-b-0': y !== 0}">
  <nav :class="{'border-solid shadowNav rounded-full translate-y-8 duration-300 border-x': y >= activeNav}" class="transition-all dark:border-x bg-CustomLight dark:bg-CustomColor-900 px-8 sticky top-0 border-dashed max-w-7xl w-full h-12 lg:h-16 border-CustomColor-900/60 dark:border-dashcolor flex gap-4 items-center">
    <AppLogo />
    <h1 class="text-xl lg:text-2xl font-semibold">DNG Blog</h1>
    <div class="hidden lg:flex flex-1 items-center gap-2 justify-center">
      <NuxtLink class="px-1" :class="{ 'border-b-2': route.path === page.link }" v-for="page in pages" :key="page.name" :to="page.link">{{ page.name }}</NuxtLink>
    </div>
    <div class="flex gap-4 justify-end flex-1 lg:flex-0">
      <CUButton class="md:flex hidden" size="md" logoPosition="right" logoName="i-lucide-search" />
      <button class="md:block hidden cursor-pointer">S'incrire</button>
      <CUButton class="md:flex hidden" label="Connexion" size="md" logoPosition="right" logoName="i-lucide-log-in" />
      <CUButton @click="isDark = !isDark" size="md" logoPosition="right" :logoName="isDark ? 'i-lucide-moon' : 'i-lucide-sun'" />
      <CUButton class="lg:hidden" size="md" logoPosition="right" logoName="i-lucide-menu" />
    </div>
  </nav>
</header>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const activeNav: number | undefined = inject('activeNav')
const { x, y } = useWindowScroll()

const route = useRoute()

const pages: {name: string, link:string}[] = [
  {name: "Accueil", link: "/"},
  {name: "Articles", link: "/article"},
  {name: "Categories", link: "/categories"},
  {name: "Parcours", link: "/training"},
  {name: "Séries", link: "/series"},
  {name: "Apropos", link: "/about"},
]

const colorMode = useColorMode()
const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light'
  }
})


</script>