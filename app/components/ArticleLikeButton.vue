<template>
  <div class="flex items-center gap-2">
    <button
      class="flex items-center gap-2 px-3 py-1.5 rounded-none border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] bg-CustomLight dark:bg-CustomColor-900 transition-colors hover:border-red-400/50 group"
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
        >{{ count }}</span
      >
    </button>

    <!-- Login modal trigger -->
    <UModal v-model:open="showLoginPrompt">
      <template #content>
        <div
          class="flex flex-col items-center gap-4 p-8 bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none"
        >
          <UIcon name="i-lucide-heart" class="w-8 h-8 text-red-400" />
          <p
            class="text-sm text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70 text-center"
          >
            Connecte-toi pour liker cet article.
          </p>
          <NuxtLink to="/auth/login" @click="showLoginPrompt = false">
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
  slug: string;
  initialCount: number;
  initialLiked: boolean;
}>();

const { isLoggedIn } = useAuth();
const { likeArticle, unlikeArticle } = useLike();

const liked = ref(props.initialLiked);
const count = ref(props.initialCount);
const loading = ref(false);
const showLoginPrompt = ref(false);

async function toggle() {
  if (!isLoggedIn.value) {
    showLoginPrompt.value = true;
    return;
  }
  if (loading.value) return;

  const prevLiked = liked.value;
  const prevCount = count.value;
  liked.value = !liked.value;
  count.value += liked.value ? 1 : -1;
  loading.value = true;

  try {
    if (liked.value) {
      await likeArticle(props.slug);
    } else {
      await unlikeArticle(props.slug);
    }
  } catch {
    liked.value = prevLiked;
    count.value = prevCount;
  } finally {
    loading.value = false;
  }
}
</script>
