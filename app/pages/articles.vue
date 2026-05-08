<template>
    <NoAdminPage>
      <BaseLayaoutContent>
        <div class="content flex flex-col pt-10 mb-10 px-4 relative">
          <SectionTitle label="Articles" to="articles">
            <CUButton label="Rechercher" class="md:flex hidden" size="lg" logoPosition="left" logoName="i-lucide-search" />
          </SectionTitle>
        </div>
        <div class="content flex gap-2 pt-10 mb-10 px-4 relative">
          <CUButton @click="changeFilter(undefined)"
            :style="!route.query.ct ? `border: 0.1px solid oklch(70.7% 0.165 254.624/ 0.5); color: oklch(70.7% 0.165 254.624)` : ''"
            label="Tous" size="md" data-active="true"
          />
          <CUButton v-for="item in items" :key="item.slug" @click="changeFilter(item.slug)"
            :avatar="{
              class: 'rounded-none',
              src: item.imageUrl,
              loading: 'lazy'
            }"
            :style="route.query?.ct === item.slug ? `border: 0.1px solid ${item.colorb}; color: ${item.color};` : ''"
            :label="item.name" size="md" logoPosition="left" data-active="true"
          />
        </div>
        <article class="flex">
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" v-if="categories.length !== 0">
            <ArticleCard class="mx-0" v-for="category in categories" :key="category"/>
          </div>
          <UEmpty
              v-else
              :avatar="{
                src: items.find(item => item.slug === route.query?.ct)?.imageUrl ?? '/favicon.ico',
                loading: 'lazy',
                class: 'rounded-none'
              }"
              :ui="{
                description: 'text-white/50'
              }"
              variant="naked"
              class="flex-1 my-auto h-100"
              title="Aucun article pour cette catégorie"
              description="It looks like you haven't added any projects. Create one to get started."
            />
        </article>
      </BaseLayaoutContent>
    </NoAdminPage>
</template>

<script setup lang="ts">

const changeFilter = (value: string | undefined) => {
  filter.value = value
}
const items = ref<{
  name: string;
  slug: string;
  color: string;
  colorb: string;
  imageUrl: string;
}[]>([
  {
    name: 'Vue js',
    slug: 'vue-js',
    colorb: 'oklch(62.7% 0.194 149.214/ 0.5)',
    color: 'oklch(62.7% 0.194 149.214)',
    imageUrl: '/vue.svg',
  },
  {
    name: 'Tailwind',
    slug: 'tailwind',
    colorb: 'oklch(54.6% 0.245 262.881/ 0.5)',
    color: 'oklch(54.6% 0.245 262.881)',
    imageUrl: '/tailwind.svg',
  },
  {
    name: 'Css',
    slug: 'css',
    colorb: 'oklch(70.7% 0.165 254.624/ 0.5)',
    color: 'oklch(70.7% 0.165 254.624)',
    imageUrl: '/css.svg',
  },
])
const route = useRoute();
const router = useRouter();
const filter = ref<String | undefined>(route.query.ct as String || undefined)

watch(filter, (newVal) => {
  router.push({
    query: { ...route.query, ct: newVal || undefined },
    replace: true // Évite de créer une nouvelle entrée d'historique à chaque lettre
  })
})

const categories = [1,2,3,4,5,6,7,8,9,10]
</script>