<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])
const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const showPreview = ref(false)
const uploadingImage = ref(false)

const renderedHtml = computed(
  () => marked.parse(props.modelValue ?? '', { async: false }) as string
)

function insertFormatting(before: string, after = '') {
  const el = textarea.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = (props.modelValue ?? '').slice(start, end)
  const newVal
    = (props.modelValue ?? '').slice(0, start)
      + before
      + selected
      + after
      + (props.modelValue ?? '').slice(end)
  emit('update:modelValue', newVal)
  nextTick(() => {
    el.focus()
    el.setSelectionRange(start + before.length, start + before.length + selected.length)
  })
}

function insertAtCursor(text: string) {
  const el = textarea.value
  const pos = el?.selectionStart ?? (props.modelValue ?? '').length
  const current = props.modelValue ?? ''
  emit('update:modelValue', current.slice(0, pos) + text + current.slice(pos))
}

async function onDrop(event: DragEvent) {
  event.preventDefault()
  const file = event.dataTransfer?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return

  uploadingImage.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    const result = await $fetch<{ url: string }>('/api/admin/media/upload', {
      method: 'POST',
      body: form
    })
    insertAtCursor(`![${file.name}](${result.url})`)
  } catch {
    // silent — user sees nothing changed
  } finally {
    uploadingImage.value = false
  }
}
</script>

<template>
  <div
    class="border-[0.1px] border-dashed border-dashcolor/50 rounded-none shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]"
  >
    <!-- Toolbar -->
    <div
      class="flex items-center gap-1 p-2 border-b border-[0.1px] border-dashed border-dashcolor/30 bg-[#111]"
    >
      <CUButton
        size="xs"
        icon="i-lucide-bold"
        title="Gras"
        @click="insertFormatting('**', '**')"
      />
      <CUButton
        size="xs"
        icon="i-lucide-italic"
        title="Italique"
        @click="insertFormatting('_', '_')"
      />
      <CUButton
        size="xs"
        icon="i-lucide-code"
        title="Code inline"
        @click="insertFormatting('`', '`')"
      />
      <CUButton
        size="xs"
        icon="i-lucide-link"
        title="Lien"
        @click="insertFormatting('[', '](url)')"
      />
      <CUButton
        size="xs"
        icon="i-lucide-heading-1"
        title="Titre H1"
        @click="insertFormatting('# ')"
      />
      <CUButton
        size="xs"
        icon="i-lucide-heading-2"
        title="Titre H2"
        @click="insertFormatting('## ')"
      />
      <CUButton
        size="xs"
        icon="i-lucide-list"
        title="Liste"
        @click="insertFormatting('- ')"
      />
      <div class="ml-auto flex items-center gap-2">
        <span
          v-if="uploadingImage"
          class="text-xs text-zinc-500 flex items-center gap-1"
        >
          <UIcon
            name="i-lucide-loader"
            class="w-3 h-3 animate-spin"
          />
          Upload...
        </span>
        <CUButton
          size="xs"
          :label="showPreview ? 'Éditer' : 'Prévisualiser'"
          :icon="showPreview ? 'i-lucide-pencil' : 'i-lucide-eye'"
          @click="showPreview = !showPreview"
        />
      </div>
    </div>

    <!-- Editor / Preview -->
    <div class="flex min-h-[400px] relative">
      <textarea
        v-if="!showPreview"
        ref="textarea"
        :value="modelValue"
        class="flex-1 p-4 bg-CustomColor-900 text-white font-mono text-sm resize-none outline-none placeholder-[#F3F4F6]/60"
        :class="uploadingImage ? 'opacity-60' : ''"
        placeholder="Écrivez votre contenu en Markdown… (glissez une image pour l'uploader)"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        @dragover.prevent
        @drop="onDrop"
      />
      <div
        v-else
        class="flex-1 p-4 bg-CustomColor-900 prose prose-invert max-w-none overflow-auto"
        v-html="renderedHtml"
      />
    </div>

    <!-- Footer -->
    <div
      class="flex justify-between px-4 py-1 border-t border-[0.1px] border-dashed border-dashcolor/30 bg-[#111]"
    >
      <span class="text-xs text-zinc-500">Glissez une image dans l'éditeur pour l'uploader</span>
      <span class="text-xs text-zinc-500">{{ modelValue?.length ?? 0 }} caractères</span>
    </div>
  </div>
</template>
