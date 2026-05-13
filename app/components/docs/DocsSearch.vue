<script setup>
const { searchDocs } = useDocs()
const query = ref('')
const results = ref([])
const open = ref(false)

watchDebounced(
  query,
  async (val) => {
    if (val.length < 2) {
      results.value = []
      open.value = false
      return
    }
    results.value = await searchDocs(val)
    open.value = results.value.length > 0
  },
  { debounce: 300 }
)
</script>

<template>
  <div class="relative">
    <CUInput
      v-model="query"
      placeholder="Rechercher dans la documentation..."
      class="w-full"
    />
    <div
      v-if="open"
      class="absolute top-full left-0 right-0 z-50 bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]"
    >
      <NuxtLink
        v-for="r in results"
        :key="r.path"
        :to="r.path"
        class="block px-4 py-2 text-sm rounded-none hover:bg-primary/10 text-[#0F0F0F] dark:text-[#F3F4F6] transition"
        @click="open = false"
      >
        <span class="font-medium">{{ r.title }}</span>
        <span
          v-if="r.description"
          class="block text-xs text-zinc-500 dark:text-zinc-500 mt-0.5 truncate"
        >{{ r.description }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
