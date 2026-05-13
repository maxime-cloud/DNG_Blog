<script setup>
const { fetchDocsNav } = useDocs()
const navigation = ref([])
const route = useRoute()

onMounted(async () => {
  navigation.value = await fetchDocsNav()
})
</script>

<template>
  <aside
    class="w-64 shrink-0 border-r border-[0.1px] border-dashed border-dashcolor/50 dark:border-dashcolor/50 h-full overflow-y-auto p-4 bg-CustomLight dark:bg-CustomColor-900"
  >
    <nav class="space-y-1">
      <template
        v-for="item in navigation"
        :key="item.path"
      >
        <NuxtLink
          :to="item.path"
          class="block px-3 py-1.5 text-sm rounded-none transition hover:bg-primary/10"
          :class="
            route.path === item.path
              ? 'text-primary font-medium bg-primary/5'
              : 'text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70'
          "
        >
          {{ item.title }}
        </NuxtLink>
        <div
          v-if="item.children?.length"
          class="pl-3 space-y-1 mt-1"
        >
          <NuxtLink
            v-for="child in item.children"
            :key="child.path"
            :to="child.path"
            class="block px-3 py-1 text-sm rounded-none transition hover:bg-primary/10"
            :class="
              route.path === child.path
                ? 'text-primary font-medium bg-primary/5'
                : 'text-zinc-500 dark:text-zinc-500'
            "
          >
            {{ child.title }}
          </NuxtLink>
        </div>
      </template>
    </nav>
  </aside>
</template>
