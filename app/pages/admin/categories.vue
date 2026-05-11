<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Catégories & Tags' })

const { data: categories, refresh: refreshCats } = await useFetch('/api/categories')
const { data: tags, refresh: refreshTags } = await useFetch('/api/tags')

const newCat = reactive({
  name: '',
  description: '',
  colorb: '#3B82F6',
  imageUrl: 'i-heroicons-code-bracket'
})
const newTag = reactive({ name: '' })

async function createCat() {
  await $fetch('/api/admin/categories', { method: 'POST', body: newCat })
  newCat.name = ''
  refreshCats()
}
async function deleteCat(id: number) {
  await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
  refreshCats()
}
async function createTag() {
  await $fetch('/api/admin/tags', { method: 'POST', body: newTag })
  newTag.name = ''
  refreshTags()
}
async function deleteTag(id: number) {
  await $fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
  refreshTags()
}
</script>

<template>
  <div class="p-6 space-y-10">
    <!-- Categories section -->
    <section>
      <h2 class="text-xl font-bold mb-4">Catégories</h2>
      <div class="flex gap-2 mb-4">
        <CUInput v-model="newCat.name" placeholder="Nom de la catégorie" />
        <CUInput v-model="newCat.description" placeholder="Description" />
        <CUButton label="Ajouter" @click="createCat" />
      </div>
      <div class="space-y-2">
        <div
          v-for="cat in categories?.data ?? []"
          :key="cat.id"
          class="flex items-center justify-between p-3 border-[0.1px] border-dashed border-dashcolor/50"
        >
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm">{{ cat.name }}</span>
            <span class="text-xs text-zinc-500">{{ cat._count?.articles ?? 0 }} articles</span>
          </div>
          <CUButton size="xs" logoName="i-lucide-trash" @click="deleteCat(cat.id)" />
        </div>
      </div>
    </section>

    <!-- Tags section -->
    <section>
      <h2 class="text-xl font-bold mb-4">Tags</h2>
      <div class="flex gap-2 mb-4">
        <CUInput v-model="newTag.name" placeholder="Nom du tag" />
        <CUButton label="Ajouter" @click="createTag" />
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="tag in tags?.data ?? []"
          :key="tag.id"
          class="flex items-center gap-1 px-2 py-1 border-[0.1px] border-dashed border-dashcolor/50 text-sm"
        >
          {{ tag.name }}
          <button @click="deleteTag(tag.id)" class="text-zinc-400 hover:text-red-500 ml-1">
            ×
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
