<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Catégories & Tags' })

const { data: categories, refresh: refreshCats } = await useFetch('/api/categories')
const { data: tags, refresh: refreshTags } = await useFetch('/api/tags')

const toast = useToast()

const newCat = reactive({
  name: '',
  description: '',
  colorb: '#3B82F6'
})
const newTag = reactive({ name: '' })

const uploadingIconFor = ref<number | null>(null)

async function createCat() {
  if (!newCat.name.trim()) return
  await $fetch('/api/admin/categories', { method: 'POST', body: newCat })
  newCat.name = ''
  newCat.description = ''
  refreshCats()
}

async function deleteCat(id: number) {
  await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
  refreshCats()
}

async function uploadIcon(catId: number, file: File) {
  uploadingIconFor.value = catId
  try {
    const form = new FormData()
    form.append('file', file)
    await $fetch(`/api/admin/categories/${catId}/icon`, { method: 'POST', body: form })
    await refreshCats()
    toast.add({ title: 'Icône mise à jour', color: 'success' })
  } catch {
    toast.add({ title: "Erreur lors de l'upload", color: 'error' })
  } finally {
    uploadingIconFor.value = null
  }
}

function onIconChange(catId: number, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) uploadIcon(catId, file)
}

async function createTag() {
  if (!newTag.name.trim()) return
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

      <!-- Create form -->
      <div class="flex gap-2 mb-6 flex-wrap">
        <CUInput v-model="newCat.name" placeholder="Nom de la catégorie" />
        <CUInput v-model="newCat.description" placeholder="Description" />
        <CUButton label="Ajouter" @click="createCat" />
      </div>

      <!-- List -->
      <div class="space-y-2">
        <div
          v-for="cat in categories?.data ?? []"
          :key="cat.id"
          class="flex items-center justify-between p-3 border-[0.1px] border-dashed border-dashcolor/50"
        >
          <div class="flex items-center gap-3">
            <!-- Icon preview -->
            <div
              class="w-10 h-10 shrink-0 border-[0.1px] border-dashed border-dashcolor/30 flex items-center justify-center overflow-hidden"
            >
              <img
                v-if="cat.imageUrl && cat.imageUrl.startsWith('https://')"
                :src="cat.imageUrl"
                :alt="cat.name"
                class="w-full h-full object-cover"
              />
              <UIcon v-else name="i-lucide-image" class="w-5 h-5 text-zinc-400" />
            </div>

            <div>
              <span class="font-medium text-sm block">{{ cat.name }}</span>
              <span class="text-xs text-zinc-500">{{ cat._count?.articles ?? 0 }} articles</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Upload icon -->
            <label class="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                class="hidden"
                :disabled="uploadingIconFor === cat.id"
                @change="onIconChange(cat.id, $event)"
              />
              <span
                class="flex items-center gap-1 text-xs px-2 py-1 border-[0.1px] border-dashed border-dashcolor/50 hover:border-primary/50 transition-colors"
                :class="uploadingIconFor === cat.id ? 'opacity-50 pointer-events-none' : ''"
              >
                <UIcon
                  :name="uploadingIconFor === cat.id ? 'i-lucide-loader' : 'i-lucide-upload'"
                  class="w-3.5 h-3.5"
                  :class="uploadingIconFor === cat.id ? 'animate-spin' : ''"
                />
                {{ uploadingIconFor === cat.id ? 'Upload...' : 'Icône' }}
              </span>
            </label>

            <CUButton size="xs" logo-name="i-lucide-trash" @click="deleteCat(cat.id)" />
          </div>
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
          <button class="text-zinc-400 hover:text-red-500 ml-1" @click="deleteTag(tag.id)">
            ×
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
