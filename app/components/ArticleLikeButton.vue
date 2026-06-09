<template>
  <div class="flex items-center gap-2">
    <button
      class="flex items-center gap-2 px-3 py-1.5 rounded-none border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] bg-CustomColor-900 transition-colors hover:border-red-400/50 group"
      :disabled="loading"
      @click="toggle"
    >
      <UIcon
        name="i-lucide-heart"
        class="w-4 h-4 transition-colors"
        :class="
          liked ? 'text-red-400' : 'text-zinc-500 group-hover:text-red-400'
        "
      />
      <span
        class="text-sm font-medium"
        :class="
          liked ? 'text-red-400' : 'text-zinc-500 group-hover:text-red-400'
        "
      >{{ count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  slug: string
  initialCount: number
  initialLiked: boolean
}>()

const { data: likeStatus } = useArticleLikes(props.slug)
const count = computed(() => likeStatus.value?.count ?? props.initialCount)
const liked = computed(() => likeStatus.value?.liked ?? props.initialLiked)

const { likeArticle, unlikeArticle } = useLike()
const loading = ref(false)

async function toggle() {
  if (loading.value) return

  loading.value = true
  try {
    if (!liked.value) {
      await likeArticle(props.slug)
    } else {
      await unlikeArticle(props.slug)
    }
  } catch (error) {
    console.error('Erreur lors du like:', error)
  } finally {
    loading.value = false
  }
}
</script>
