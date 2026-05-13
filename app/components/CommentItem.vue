<template>
  <div class="flex flex-col gap-3">
    <div
      class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 mb-3">
        <UAvatar
          :src="comment.user?.image"
          :alt="comment.user?.name ?? 'Anonyme'"
          size="sm"
          class="rounded-none"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-[#0F0F0F] dark:text-[#F3F4F6] truncate">
            {{ comment.user?.name ?? 'Anonyme' }}
          </p>
          <p class="text-xs text-zinc-500">
            {{ formattedDate }}
          </p>
        </div>
        <UBadge
          v-if="comment.status && comment.status !== 'approved'"
          :label="comment.status"
          size="xs"
          color="warning"
          variant="subtle"
          class="rounded-none capitalize"
        />
      </div>

      <!-- Content -->
      <p class="text-sm text-[#0F0F0F]/80 dark:text-[#F3F4F6]/80 mb-3 whitespace-pre-wrap">
        {{ comment.content }}
      </p>

      <!-- Actions -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Like -->
        <button
          class="flex items-center gap-1 text-xs transition-colors"
          :class="liked ? 'text-red-400' : 'text-zinc-500 hover:text-red-400'"
          @click="toggleLike"
        >
          <UIcon :name="liked ? 'i-lucide-heart' : 'i-lucide-heart'" class="w-4 h-4" />
          <span>{{ likeCountLocal }}</span>
        </button>

        <!-- Reply -->
        <button
          class="flex items-center gap-1 text-xs text-zinc-500 hover:text-[#0F0F0F] dark:hover:text-[#F3F4F6] transition-colors"
          @click="showReplyForm = !showReplyForm"
        >
          <UIcon name="i-lucide-message-square" class="w-4 h-4" />
          <span>Répondre</span>
        </button>

        <!-- Report -->
        <button
          class="flex items-center gap-1 text-xs text-zinc-500 hover:text-yellow-500 transition-colors"
          @click="report"
        >
          <UIcon name="i-lucide-flag" class="w-4 h-4" />
          <span>Signaler</span>
        </button>

        <!-- Delete (own comment or admin) -->
        <button
          v-if="canDelete"
          class="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-500 transition-colors ml-auto"
          @click="deleteComment"
        >
          <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
          <span>Supprimer</span>
        </button>
      </div>

      <!-- Inline reply form -->
      <div
        v-if="showReplyForm"
        class="mt-3 border-t border-dashed border-primary/20 dark:border-dashcolor/30 pt-3"
      >
        <CommentForm :slug="slug" :parent-id="comment.id" @submitted="onReplySubmitted" />
      </div>
    </div>

    <!-- Nested replies (max depth 2 visually via pl-6) -->
    <div v-if="comment.replies && comment.replies.length" class="pl-6 flex flex-col gap-3">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :slug="slug"
        @deleted="emit('deleted')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface CommentUser {
  name: string
  image?: string | null
}

interface Comment {
  id: number
  content: string
  user?: CommentUser | null
  userId?: string
  createdAt: string
  likes: unknown[]
  replies?: Comment[]
  status: string
}

const props = defineProps<{
  comment: Comment
  slug: string
}>()

const emit = defineEmits<{
  deleted: []
}>()

const { user, isAdmin, isLoggedIn } = useAuth()
const { likeComment, unlikeComment } = useLike()

const liked = ref(false)
const likeCountLocal = ref(props.comment.likes?.length ?? 0)
const showReplyForm = ref(false)

const canDelete = computed(
  () => isLoggedIn.value && (isAdmin.value || user.value?.id === props.comment.userId)
)

const formattedDate = computed(() => {
  const date = new Date(props.comment.createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "à l'instant"
  if (diffMins < 60) return `il y a ${diffMins} min`
  if (diffHours < 24) return `il y a ${diffHours}h`
  if (diffDays < 7) return `il y a ${diffDays}j`

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
})

async function toggleLike() {
  if (!isLoggedIn.value) return
  const prev = liked.value
  liked.value = !liked.value
  likeCountLocal.value += liked.value ? 1 : -1
  try {
    if (liked.value) {
      await likeComment(String(props.comment.id))
    } else {
      await unlikeComment(String(props.comment.id))
    }
  } catch {
    liked.value = prev
    likeCountLocal.value += prev ? 1 : -1
  }
}

async function deleteComment() {
  try {
    await $fetch(`/api/comments/${props.comment.id}`, { method: 'DELETE' })
    emit('deleted')
  } catch {
    // silent fail — parent will handle refresh
  }
}

function report() {
  // intentionally no-op for now; extend when report API is ready
}

function onReplySubmitted() {
  showReplyForm.value = false
  emit('deleted') // reuse to trigger parent refresh
}
</script>
