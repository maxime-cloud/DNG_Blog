<template>
  <div class="min-h-screen flex bg-CustomLight dark:bg-CustomColor-900">
    <!-- Sidebar -->
    <aside
      v-show="sidebarOpen || !isMobile"
      class="fixed top-0 left-0 z-40 h-full w-64 flex flex-col border-r border-[0.1px] border-dashed border-dashcolor/50 bg-CustomLight dark:bg-CustomColor-900"
    >
      <!-- Logo -->
      <div
        class="flex items-center gap-3 px-6 h-16 border-b border-[0.1px] border-dashed border-dashcolor/50"
      >
        <AppLogo />
        <span
          class="text-sm font-semibold text-[#0F0F0F] dark:text-white uppercase tracking-widest"
        >Admin</span>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 overflow-y-auto py-4 px-3">
        <ul class="space-y-1">
          <li
            v-for="link in navLinks"
            :key="link.to"
          >
            <NuxtLink
              :to="link.to"
              class="flex items-center gap-3 px-3 py-2 text-sm border border-[0.1px] border-transparent rounded-none transition-all duration-200 text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70 hover:bg-[#EEE] dark:hover:bg-[#111] hover:border-dashcolor/50 hover:text-[#0F0F0F] dark:hover:text-white"
              :class="{
                'bg-[#EEE] dark:bg-[#111] border-dashcolor/50 !text-[#0F0F0F] dark:!text-white':
                  isActive(link.to)
              }"
              @click="isMobile && (sidebarOpen = false)"
            >
              <UIcon
                :name="link.icon"
                class="w-4 h-4 shrink-0"
              />
              <span>{{ link.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- User + logout -->
      <div
        class="px-4 py-4 border-t border-[0.1px] border-dashed border-dashcolor/50 flex items-center justify-between gap-2"
      >
        <div class="flex items-center gap-2 min-w-0">
          <UIcon
            name="i-lucide-user-circle"
            class="w-5 h-5 shrink-0 text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70"
          />
          <span
            class="text-xs truncate text-[#0F0F0F] dark:text-white font-medium"
          >
            {{ store.user?.name ?? store.user?.email ?? "Admin" }}
          </span>
        </div>
        <CUButton
          label="Logout"
          logo-name="i-lucide-log-out"
          logo-position="left"
          size="xs"
          @click="handleLogout"
        />
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div
      v-if="isMobile && sidebarOpen"
      class="fixed inset-0 z-30 bg-CustomColor-900/60 backdrop-blur-xs"
      @click="sidebarOpen = false"
    />

    <!-- Main content -->
    <div class="flex-1 ml-0 lg:ml-64 flex flex-col min-h-screen">
      <!-- Top bar -->
      <header
        class="sticky top-0 z-20 h-16 flex items-center px-4 lg:px-8 gap-4 border-b border-[0.1px] border-dashed border-dashcolor/50 bg-CustomLight dark:bg-CustomColor-900"
      >
        <!-- Mobile hamburger -->
        <button
          class="lg:hidden p-2 text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70 hover:text-[#0F0F0F] dark:hover:text-white transition-colors"
          @click="sidebarOpen = !sidebarOpen"
        >
          <UIcon
            :name="sidebarOpen ? 'i-lucide-x' : 'i-lucide-menu'"
            class="w-5 h-5"
          />
        </button>

        <span class="text-sm text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70 flex-1">
          {{ currentPageLabel }}
        </span>

        <span class="text-xs text-zinc-500 hidden sm:block">
          {{ store.user?.email }}
        </span>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const store = useAuthStore()
const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const isMobile = ref(false)

const navLinks = [
  { label: 'Dashboard', to: '/admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Articles', to: '/admin/articles', icon: 'i-lucide-file-text' },
  {
    label: 'Commentaires',
    to: '/admin/commentaires',
    icon: 'i-lucide-message-square'
  },
  { label: 'Utilisateurs', to: '/admin/utilisateurs', icon: 'i-lucide-users' },
  { label: 'Newsletter', to: '/admin/newsletter', icon: 'i-lucide-mail' },
  { label: 'Catégories', to: '/admin/categories', icon: 'i-lucide-tag' },
  { label: 'Parcours', to: '/admin/parcours', icon: 'i-lucide-graduation-cap' },
  { label: 'Séries', to: '/admin/series', icon: 'i-lucide-book-open' },
  { label: 'Médias', to: '/admin/medias', icon: 'i-lucide-image' },
  {
    label: 'Analytiques',
    to: '/admin/analytiques',
    icon: 'i-lucide-bar-chart'
  },
  { label: 'Changelog', to: '/admin/changelog', icon: 'i-lucide-clock' },
  { label: 'Paramètres', to: '/admin/parametres', icon: 'i-lucide-settings' }
]

function isActive(to) {
  if (to === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(to)
}

const currentPageLabel = computed(() => {
  return navLinks.find(l => isActive(l.to))?.label ?? 'Admin'
})

async function handleLogout() {
  await store.logout()
  router.push('/')
}

onMounted(() => {
  const mq = window.matchMedia('(max-width: 1023px)')
  isMobile.value = mq.matches
  mq.addEventListener('change', (e) => {
    isMobile.value = e.matches
    if (!e.matches) sidebarOpen.value = false
  })
})
</script>
