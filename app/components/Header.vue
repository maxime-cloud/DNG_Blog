<template>
<header class="px-4 w-full z-50 bg-CustomLight dark:bg-CustomColor-900 fixed flex flex-col items-center dark:border-b border-b border-dashed border-CustomColor-900/60 dark:border-dashcolor dark:shadow-md" :class="{'h-16 backdrop-blur-sm bg-CustomLight/10 dark:bg-CustomColor-900/20 border-b-0 shadow-none': y >= activeNav, 'dark:border-b-0': y !== 0, 'border-b-0': route.path === '/'}">
  <nav :class="{'border-solid shadowNav rounded-full translate-y-8 duration-300 border-x': y >= activeNav, 'border-x': route.path !== '/'}" class="transition-all dark:border-x bg-CustomLight dark:bg-CustomColor-900 px-8 sticky top-0 border-dashed max-w-7xl w-full h-12 lg:h-16 border-CustomColor-900/60 dark:border-dashcolor flex gap-4 items-center">
    <NuxtLink to="/" class="flex gap-4 items-center">
      <AppLogo />
      <h1 class="text-xl lg:text-2xl font-semibold">DNG Blog</h1>
    </NuxtLink>
    <div class="hidden lg:flex flex-1 items-center gap-2 justify-center">
      <NuxtLink class="px-1" :class="{ 'border-b-2': route.path === page.link }" v-for="page in pages" :key="page.name" :to="page.link">{{ page.name }}</NuxtLink>
    </div>

    <div class="flex gap-4 justify-end flex-1 lg:flex-0">
      <CUButton class="md:flex hidden" size="md" logoPosition="right" logoName="i-lucide-search" />
      <UPopover 
      v-if="store.isAuthenticated"
      :ui="{
        content: 'rounded-none p-2 gap-1 ring-0 flex flex-col justify-center items-center shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] dark:border-dashcolor/50 border-[0.1px] border-primary/30'
      }">
        <CUButton 
        :avatar="{
          src: '/user-avatar.png'
        }"
        :label="store.user.name"
        class="justify-self-end" size="md" logoPosition="right" />
        <template #content>
        <CUButton class="border-0 w-full" label="Compte" size="md" logoPosition="left" logoName="i-lucide-user" />
        <CUButton class="border-0 w-full" label="Favoris" size="md" logoPosition="left" logoName="i-lucide-bookmark" />
        <CUButton @click="store.logout" loading-auto class="border-0 border-t w-full" label="Se déconnecter" size="md" logoPosition="left" logoName="i-lucide-log-out" />
        </template>
      </UPopover>
      <UModal v-if="!store.isAuthenticated"
      v-model:open="openRegister"
      :ui="{
          overlay: 'bg-customcolor-900/60 dark:bg-customcolor-900/60 backdrop-blur-xs',
          content: 'ring-0 flex justify-center bg-transparent items-center',
      }">
          <button class="md:block hidden cursor-pointer">S'incrire</button>
          <template #content>
            <RegisterForm @closeSignup="openRegister = false" />
          </template>
        </UModal>
      <UModal v-if="!store.isAuthenticated"
      v-model:open="openConnexion"
      :ui="{
          overlay: 'bg-customcolor-900/60 dark:bg-customcolor-900/60 backdrop-blur-xs',
          content: 'ring-0 flex justify-center bg-transparent items-center',
      }">
        <CUButton class="md:flex hidden" label="Connexion" size="md" logoPosition="right" logoName="i-lucide-log-in" />
          
          <template #content>
              <LoginForm />
          </template>
        </UModal>
      
      <CUButton @click="isDark = !isDark" size="md" logoPosition="right" :logoName="isDark ? 'i-lucide-moon' : 'i-lucide-sun'" />
      <UDrawer class="lg:hidden" direction="right">
        <CUButton class="lg:hidden" size="md" logoPosition="right" logoName="i-lucide-menu" />
      
          <template #content>
            
          </template>
        </UDrawer>
      
    </div>
  </nav>
</header>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useAuthStore } from '@/stores/auth'

const store = useAuthStore()

const route = useRoute()
const router = useRouter()
const openRegister = ref(false)
const openConnexion = ref(false)
watch(openConnexion, () => {
  openConnexion.value = route.path === '/auth/login' ? false : openConnexion.value
})
watch(openRegister, () => {
  openRegister.value = route.path === '/auth/register' ? false : openRegister.value
})
const activeNav: number | undefined = inject('activeNav')
const { x, y } = useWindowScroll()

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