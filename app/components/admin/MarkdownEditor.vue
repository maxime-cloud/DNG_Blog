<script setup>
const props = defineProps({ modelValue: String });
const emit = defineEmits(["update:modelValue"]);
const textarea = useTemplateRef("textarea");
const showPreview = ref(false);

function insertFormatting(before, after = "") {
  const el = textarea.value;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = props.modelValue.slice(start, end);
  const newVal =
    props.modelValue.slice(0, start) +
    before +
    selected +
    after +
    props.modelValue.slice(end);
  emit("update:modelValue", newVal);
  nextTick(() => {
    el.focus();
    el.setSelectionRange(
      start + before.length,
      start + before.length + selected.length,
    );
  });
}
</script>

<template>
  <div
    class="border-[0.1px] border-dashed border-dashcolor/50 rounded-none shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]"
  >
    <!-- Toolbar -->
    <div
      class="flex items-center gap-1 p-2 border-b border-[0.1px] border-dashed border-dashcolor/30 bg-[#EEE] dark:bg-[#111]"
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
      <div class="ml-auto">
        <CUButton
          size="xs"
          :label="showPreview ? 'Éditer' : 'Prévisualiser'"
          :icon="showPreview ? 'i-lucide-pencil' : 'i-lucide-eye'"
          @click="showPreview = !showPreview"
        />
      </div>
    </div>
    <!-- Editor / Preview -->
    <div class="flex min-h-[400px]">
      <textarea
        v-if="!showPreview"
        ref="textarea"
        :value="modelValue"
        class="flex-1 p-4 bg-CustomLight dark:bg-CustomColor-900 text-[#0F0F0F] dark:text-white font-mono text-sm resize-none outline-none placeholder-[#0F0F0F]/40 dark:placeholder-[#F3F4F6]/60"
        placeholder="Écrivez votre contenu en Markdown..."
        @input="emit('update:modelValue', $event.target.value)"
      />
      <div
        v-else
        class="flex-1 p-4 bg-CustomLight dark:bg-CustomColor-900 prose dark:prose-invert max-w-none"
      >
        <pre
          class="whitespace-pre-wrap text-sm text-[#0F0F0F] dark:text-white font-mono"
          >{{ modelValue }}</pre
        >
      </div>
    </div>
    <!-- Footer: char count -->
    <div
      class="flex justify-end px-4 py-1 border-t border-[0.1px] border-dashed border-dashcolor/30 bg-[#EEE] dark:bg-[#111]"
    >
      <span class="text-xs text-zinc-500"
        >{{ modelValue?.length ?? 0 }} caractères</span
      >
    </div>
  </div>
</template>
