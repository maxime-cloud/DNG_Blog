<template>
  <header
    class="px-4 w-full z-50 bg-CustomColor-900 fixed flex flex-col items-center border-b border-b border-dashed border-dashcolor shadow-md"
    :class="{
      'h-16 backdrop-blur-sm bg-CustomColor-900/20 border-b-0 shadow-none': y >= activeNav,
      'border-b-0': y !== 0 || route.path === '/'
    }"
  >
    <nav
      :class="{
        'border-solid shadowNav rounded-full translate-y-8 duration-300 border-x': y >= activeNav,
        'border-x': route.path !== '/'
      }"
      class="transition-all border-x bg-CustomColor-900 px-8 sticky top-0 border-dashed max-w-7xl w-full h-12 lg:h-16 border-dashcolor flex gap-4 items-center"
    >
      <NuxtLink
        to="/"
        class="flex gap-4 items-center"
      >
        <AppLogo />
        <h1 class="text-xl lg:text-2xl font-semibold">StackTrace</h1>
      </NuxtLink>
      <div class="hidden lg:flex flex-1 items-center gap-2 justify-center">
        <NuxtLink
          v-for="page in pages"
          :key="page.name"
          class="px-1"
          :class="{ 'border-b-2': route.path === page.link }"
          :to="page.link"
        >{{ page.name }}</NuxtLink>
      </div>

      <div class="flex gap-4 justify-end flex-1 lg:flex-0">
        <CUButton
          class="md:flex hidden"
          size="md"
          logo-position="right"
          logo-name="i-lucide-search"
          @click="searchOpen = true"
        />
        <UPopover
          v-if="store.isAuthenticated"
          :ui="{
            content:
              'rounded-none p-2 gap-1 ring-0 flex flex-col justify-center items-center bg-CustomColor-900 shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] border-dashcolor/50 border-[0.1px] border-primary/30'
          }"
        >
          <CUButton
            :avatar="{
              src: store.user?.image ? store.user.image : '/user-avatar.png'
            }"
            :label="store.user?.name"
            class="justify-self-end"
            size="md"
            logo-position="right"
          />
          <template #content>
            <CUButton
              to="/users/me"
              class="border-0 w-full"
              label="Compte"
              size="md"
              logo-position="left"
              logo-name="i-lucide-user"
            />
            <CUButton
              to="/users/favorite"
              class="border-0 w-full"
              label="Favoris"
              size="md"
              logo-position="left"
              logo-name="i-lucide-bookmark"
            />
            <CUButton
              v-if="isAuthor"
              to="/users/me/stats"
              class="border-0 w-full"
              label="Statistiques"
              size="md"
              logo-position="left"
              logo-name="i-lucide-bar-chart-3"
            />
            <CUButton
              loading-auto
              class="border-0 border-t w-full"
              label="Se déconnecter"
              size="md"
              logo-position="left"
              logo-name="i-lucide-log-out"
              @click="store.logout"
            />
          </template>
        </UPopover>
        <UModal
          v-if="!store.isAuthenticated"
          v-model:open="openRegister"
          :ui="{
            overlay: 'bg-CustomColor-900/60 backdrop-blur-xs',
            content: 'ring-0 flex justify-center bg-transparent items-center'
          }"
        >
          <button class="md:block hidden cursor-pointer">
            S'inscrire
          </button>
          <template #content>
            <RegisterForm @close-signup="openRegister = false" />
          </template>
        </UModal>
        <UModal
          v-if="!store.isAuthenticated"
          v-model:open="openConnexion"
          :ui="{
            overlay: 'bg-CustomColor-900/60 backdrop-blur-xs',
            content: 'ring-0 flex justify-center bg-transparent items-center'
          }"
        >
          <CUButton
            class="md:flex hidden"
            label="Connexion"
            size="md"
            logo-position="right"
            logo-name="i-lucide-log-in"
          />

          <template #content>
            <LoginForm @close-login="openConnexion = false" />
          </template>
        </UModal>

        <UDrawer
          class="lg:hidden"
          direction="right"
        >
          <CUButton
            class="lg:hidden"
            size="md"
            logo-position="right"
            logo-name="i-lucide-menu"
          />

          <template #content />
        </UDrawer>
      </div>
    </nav>

    <SearchCommandPalette v-model:open="searchOpen" />
  </header>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useAuthStore } from '@/stores/auth'

const store = useAuthStore()

const route = useRoute()
const openRegister = ref(false)
const openConnexion = ref(false)
const searchOpen = ref(false)

const isAuthor = computed(() => ['author', 'admin'].includes(store.user?.role ?? ''))

defineShortcuts({
  meta_k: () => {
    searchOpen.value = true
  },
  ctrl_k: () => {
    searchOpen.value = true
  }
})
watch(openConnexion, () => {
  openConnexion.value = route.path === '/auth/login' ? false : openConnexion.value
})
watch(openRegister, () => {
  openRegister.value = route.path === '/auth/register' ? false : openRegister.value
})
const activeNav = inject<number>('activeNav') ?? 300
const { y } = useWindowScroll()

const pages: { name: string, link: string }[] = [
  { name: 'Accueil', link: '/' },
  { name: 'Articles', link: '/articles' },
  { name: 'Catégories', link: '/categories' },
  { name: 'Parcours', link: '/training' },
  { name: 'Séries', link: '/series' },
  { name: 'À propos', link: '/about' }
]
</script>
