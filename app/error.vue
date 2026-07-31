<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })

const title = computed(() => {
  if (props.error.statusCode === 404) return 'Page non trouvée'
  return 'Une erreur est survenue'
})

const message = computed(() => {
  if (props.error.statusCode === 404) return 'La page que vous recherchez n\'existe pas.'
  return props.error.message || 'Une erreur inattendue s\'est produite.'
})
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="flex justify-center items-center py-20 min-h-screen">
        <div 
          class="bg-CustomColor-900 border-[0.1px] border-dashcolor/50 p-8 rounded-none max-w-md w-full text-center
                 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] 
                 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] 
                 shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]"
        >
          <h1 class="text-4xl font-bold mb-4">{{ error.statusCode }}</h1>
          <h2 class="text-2xl font-semibold mb-6">{{ title }}</h2>
          <p class="text-[#F3F4F6]/70 mb-8">{{ message }}</p>
          
          <CUButton 
            label="Retourner à l'accueil" 
            @click="handleError"
            class="w-full justify-center"
          />
        </div>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
