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
              to="/users/me/favorite"
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
          scrollable
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
          scrollable
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
          v-model:open="mobileMenuOpen"
          class="lg:hidden"
          direction="right"
          :ui="{
            content: 'bg-CustomColor-900 rounded-none border-l border-dashed border-dashcolor/50 shadow-[-6px_0px_24px_0px_rgb(0,0,0,0.51)]'
          }"
        >
          <CUButton
            class="lg:hidden"
            size="md"
            logo-position="right"
            logo-name="i-lucide-menu"
          />

          <template #content>
            <div class="flex flex-col h-full bg-CustomColor-900">
              <div class="p-6 border-b border-dashed border-dashcolor/30 flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <AppLogo />
                  <span class="font-semibold text-xl">StackTrace</span>
                </div>
                <CUButton
                  variant="ghost"
                  logo-name="i-lucide-x"
                  size="md"
                  @click="mobileMenuOpen = false"
                />
              </div>

              <div class="flex-1 overflow-y-auto p-6 space-y-4">
                <CUButton
                  v-for="page in pages"
                  :key="page.name"
                  :to="page.link"
                  class="w-full border-0 justify-start"
                  :variant="route.path === page.link ? 'solid' : 'ghost'"
                  :label="page.name"
                  size="md"
                  @click="mobileMenuOpen = false"
                />

                <div class="pt-4 border-t border-dashed border-dashcolor/30 flex flex-col gap-4">
                  <CUButton
                    class="w-full"
                    label="Rechercher"
                    logo-name="i-lucide-search"
                    size="md"
                    @click="searchOpen = true; mobileMenuOpen = false"
                  />
                </div>
              </div>

              <div class="p-6 border-t border-dashed border-dashcolor/30">
                <div
                  v-if="store.isAuthenticated"
                  class="flex flex-col gap-2"
                >
                  <div class="flex items-center gap-3 mb-4 p-2 border border-dashed border-dashcolor/30">
                    <UAvatar
                      :src="store.user?.image ?? '/user-avatar.png'"
                      :alt="store.user?.name"
                      size="sm"
                      class="rounded-none"
                    />
                    <div class="flex flex-col">
                      <span class="text-sm font-medium">{{ store.user?.name }}</span>
                      <span class="text-xs text-zinc-500">{{ store.user?.email }}</span>
                    </div>
                  </div>
                  <CUButton
                    to="/users/me"
                    class="w-full justify-start border-0"
                    label="Compte"
                    logo-name="i-lucide-user"
                    @click="mobileMenuOpen = false"
                  />
                  <CUButton
                    to="/users/me/favorite"
                    class="w-full justify-start border-0"
                    label="Favoris"
                    logo-name="i-lucide-bookmark"
                    @click="mobileMenuOpen = false"
                  />
                  <CUButton
                    v-if="isAuthor"
                    to="/users/me/stats"
                    class="w-full justify-start border-0"
                    label="Statistiques"
                    logo-name="i-lucide-bar-chart-3"
                    @click="mobileMenuOpen = false"
                  />
                  <CUButton
                    variant="soft"
                    color="red"
                    class="w-full justify-start border-0 mt-2"
                    label="Déconnexion"
                    logo-name="i-lucide-log-out"
                    @click="store.logout(); mobileMenuOpen = false"
                  />
                </div>
                <div
                  v-else
                  class="flex flex-col gap-3"
                >
                  <CUButton
                    class="w-full"
                    label="Connexion"
                    logo-name="i-lucide-log-in"
                    @click="openConnexion = true; mobileMenuOpen = false"
                  />
                  <CUButton
                    variant="outline"
                    class="w-full"
                    label="S'inscrire"
                    @click="openRegister = true; mobileMenuOpen = false"
                  />
                </div>
              </div>
            </div>
          </template>
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
const mobileMenuOpen = ref(false)

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
