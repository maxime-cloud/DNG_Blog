<script setup>
const props = defineProps({ path: String })

const repoUrl = process.env.GITHUB_REPO_URL || ''
const editUrl = computed(() => `${repoUrl}/edit/main/content/${props.path}.md`)
</script>

<template>
  <a
    v-if="repoUrl"
    :href="editUrl"
    target="_blank"
    rel="noopener"
    class="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-primary transition mt-6"
  >
    <UIcon
      name="i-lucide-pencil"
      class="w-3 h-3"
    />
    Modifier cette page sur GitHub
  </a>
</template>
