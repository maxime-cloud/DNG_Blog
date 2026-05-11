<template>
  <div class="flex items-center gap-2 flex-wrap">
    <!-- Twitter/X -->
    <a
      :href="`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      <CUButton
        logo-name="i-simple-icons-x"
        logo-position="left"
        label="Twitter"
        size="sm"
      />
    </a>

    <!-- LinkedIn -->
    <a
      :href="`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      <CUButton
        logo-name="i-simple-icons-linkedin"
        logo-position="left"
        label="LinkedIn"
        size="sm"
      />
    </a>

    <!-- Copy link -->
    <CUButton
      :logo-name="copied ? 'i-lucide-check' : 'i-lucide-link'"
      logo-position="left"
      :label="copied ? 'Copié !' : 'Copier le lien'"
      size="sm"
      class="transition-colors"
      :class="copied ? 'text-green-400' : ''"
      @click="copyLink"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string
  title: string
}>()

const { copy, copied } = useClipboard({ source: props.url })

const encodedUrl = computed(() => encodeURIComponent(props.url))
const encodedTitle = computed(() => encodeURIComponent(props.title))

function copyLink() {
  copy(props.url)
}
</script>
