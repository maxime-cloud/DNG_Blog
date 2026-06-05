<template>
  <div>
    <!-- Not authenticated prompt -->
    <div
      v-if="!isLoggedIn"
      class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4 text-center"
    >
      <p class="text-sm text-[#F3F4F6]/70 mb-3">
        Connectez-vous pour commenter.
      </p>
      <NuxtLink to="/auth/login">
        <CUButton
          label="Se connecter"
          logo-name="i-lucide-log-in"
          logo-position="left"
          size="sm"
        />
      </NuxtLink>
    </div>

    <!-- Authenticated form -->
    <form
      v-else
      class="flex flex-col gap-3"
      @submit.prevent="submit"
    >
      <textarea
        v-model="content"
        rows="3"
        placeholder="Écris un commentaire…"
        class="w-full resize-none text-sm p-3 rounded-none bg-CustomColor-900 border-[0.1px] border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] text-[#F3F4F6] placeholder-[#F3F4F6]/60 outline-none focus:border-primary/50 focus:border-primary/30 transition-colors"
      />
      <p
        v-if="error"
        class="text-xs text-red-400"
      >
        {{ error }}
      </p>
      <div class="flex justify-end">
        <CUButton
          type="submit"
          :loading="loading"
          label="Envoyer"
          logo-name="i-lucide-send"
          logo-position="right"
          size="sm"
          :disabled="!content.trim()"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  slug: string
  parentId?: number
}>()

const emit = defineEmits<{
  submitted: []
}>()

const { isLoggedIn } = useAuth()
const content = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function submit() {
  if (!content.value.trim()) return
  error.value = null
  loading.value = true
  try {
    await $fetch(`/api/articles/${props.slug}/comments`, {
      method: 'POST',
      body: {
        content: content.value.trim(),
        parentId: props.parentId ?? null
      }
    })
    content.value = ''
    emit('submitted')
  } catch {
    error.value = 'Erreur lors de la soumission'
  } finally {
    loading.value = false
  }
}
</script>
