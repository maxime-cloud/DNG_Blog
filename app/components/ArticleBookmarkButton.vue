<template>
  <div>
    <button
      class="flex items-center gap-2 px-3 py-1.5 rounded-none border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] bg-CustomColor-900 transition-colors hover:border-blue-500/50 group"
      :disabled="loading"
      @click="toggle"
    >
      <UIcon
        :name="bookmarked ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'"
        class="w-4 h-4 transition-colors"
        :class="
          bookmarked
            ? 'text-blue-500'
            : 'text-zinc-500 group-hover:text-blue-500'
        "
      />
      <span
        class="text-sm font-medium"
        :class="
          bookmarked
            ? 'text-blue-500'
            : 'text-zinc-500 group-hover:text-blue-500'
        "
      >{{ bookmarked ? "Sauvegardé" : "Sauvegarder" }}</span>
    </button>

    <UModal v-model:open="showLoginPrompt">
      <template #content>
        <div
          class="flex flex-col items-center gap-4 p-8 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none"
        >
          <UIcon
            name="i-lucide-bookmark"
            class="w-8 h-8 text-blue-500"
          />
          <p
            class="text-sm text-[#F3F4F6]/70 text-center"
          >
            Connecte-toi pour sauvegarder cet article.
          </p>
          <NuxtLink
            to="/auth/login"
            @click="showLoginPrompt = false"
          >
            <CUButton
              label="Se connecter"
              logo-name="i-lucide-log-in"
              logo-position="left"
              size="sm"
            />
          </NuxtLink>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  articleId: string
  initialBookmarked?: boolean
}>()

const { isLoggedIn } = useAuth()
const { addFavorite, removeFavorite } = useFavorite()
const bookmarked = ref(props.initialBookmarked ?? false)
const loading = ref(false)
const showLoginPrompt = ref(false)

async function toggle() {
  if (!isLoggedIn.value) {
    showLoginPrompt.value = true
    return
  }
  if (loading.value) return

  const prev = bookmarked.value
  bookmarked.value = !bookmarked.value
  loading.value = true

  try {
    if (bookmarked.value) {
      await addFavorite(props.articleId)
    } else {
      await removeFavorite(props.articleId)
    }
  } catch {
    bookmarked.value = prev
  } finally {
    loading.value = false
  }
}
</script>
