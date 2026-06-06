<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const editModalOpen = ref(false)

// Fetch full profile
const { data: profile, refresh: refreshProfile } = await useFetch<any>('/api/users/me')

// Tabs definition
const tabs = computed(() => {
  const items = [
    { label: 'Favoris', icon: 'i-lucide-bookmark', to: '/users/me/favorite' }
  ]
  
  if (profile.value?.role === 'author' || profile.value?.role === 'admin') {
    items.push({ label: 'Statistiques', icon: 'i-lucide-bar-chart-3', to: '/users/me/stats' })
  }
  
  return items
})

// Handle initial redirect from /users/me to /users/me/favorite
if (route.path === '/users/me' || route.path === '/users/me/') {
  navigateTo('/users/me/favorite')
}

function formatJoinDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  })
}

useSeoMeta({ title: 'Mon Tableau de Bord' })
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="px-4 pt-10 pb-16">
        <!-- Hero Section -->
        <div class="max-w-5xl mx-auto bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] p-6 sm:p-10 mb-8 relative overflow-hidden">
          <!-- Background decoration -->
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div class="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
            <!-- Avatar -->
            <div class="relative group">
              <UAvatar
                :src="profile?.image ?? '/user-avatar.png'"
                :alt="profile?.name"
                size="3xl"
                class="rounded-none border-[0.1px] border-dashed border-dashcolor/50 p-1"
              />
            </div>

            <!-- Profile Info -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-3 mb-2">
                <h1 class="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">
                  {{ profile?.name }}
                </h1>
                <span
                  v-if="profile?.role && profile.role !== 'reader'"
                  class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-[0.1px] border-dashed rounded-none"
                  :class="profile.role === 'admin' ? 'text-primary border-primary/40 bg-primary/5' : 'text-blue-500 border-blue-500/40 bg-blue-500/5'"
                >
                  {{ profile.role === 'admin' ? 'Administrateur' : 'Auteur' }}
                </span>
              </div>

              <p v-if="profile?.bio" class="text-zinc-400 text-sm max-w-2xl mb-4 leading-relaxed">
                {{ profile.bio }}
              </p>
              <p v-else class="text-zinc-600 text-sm italic mb-4">
                Aucune biographie renseignée.
              </p>

              <!-- Meta -->
              <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500">
                <div class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
                  <span>Inscrit en {{ formatJoinDate(profile?.createdAt) }}</span>
                </div>
                
                <a v-if="profile?.githubUrl" :href="profile.githubUrl" target="_blank" class="flex items-center gap-1.5 hover:text-white transition-colors">
                  <UIcon name="i-simple-icons-github" class="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>

                <a v-if="profile?.websiteUrl" :href="profile.websiteUrl" target="_blank" class="flex items-center gap-1.5 hover:text-white transition-colors">
                  <UIcon name="i-lucide-globe" class="w-3.5 h-3.5" />
                  <span>Site Web</span>
                </a>
              </div>
            </div>

            <!-- Actions -->
            <div class="shrink-0 pt-4 md:pt-0">
              <CUButton
                label="Modifier mon profil"
                logo-name="i-lucide-settings"
                size="md"
                class="w-full sm:w-auto"
                @click="editModalOpen = true"
              />
            </div>
          </div>
        </div>

        <!-- Dashboard Content with Tabs Navigation -->
        <div class="max-w-5xl mx-auto">
          <div class="flex justify-start border-b-[0.1px] border-dashed border-dashcolor/50 mb-6">
            <nav class="flex gap-2">
              <NuxtLink
                v-for="item in tabs"
                :key="item.to"
                :to="item.to"
                class="px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-[1px] flex items-center gap-2"
                :class="route.path === item.to 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'"
              >
                <UIcon :name="item.icon" class="w-4 h-4" />
                {{ item.label }}
              </NuxtLink>
            </nav>
          </div>

          <!-- Active tab content -->
          <NuxtPage />
        </div>
      </div>

      <!-- Modals -->
      <UserProfileModal 
        v-if="profile"
        v-model:open="editModalOpen" 
        :user="profile"
        @updated="refreshProfile"
      />
    </BaseLayaoutContent>
  </NoAdminPage>
</template>

<style scoped>
:deep(.relative) {
  border-radius: 0 !important;
}
</style>
