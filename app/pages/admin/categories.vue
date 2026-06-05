<script setup lang="ts">
import { toast } from 'vue-sonner'

const { confirm } = useConfirm()

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Catégories & Tags' })

const { data: categories, refresh: refreshCats } = await useFetch('/api/categories')
const { data: tags, refresh: refreshTags } = await useFetch('/api/tags')

const newCat = reactive({ name: '', description: '', colorb: '#3B82F6' })
const newTag = reactive({ name: '' })
const uploadingIconFor = ref<number | null>(null)
const editingCatId = ref<number | null>(null)
const editCatForm = reactive({ name: '', description: '' })
const editingTagId = ref<number | null>(null)
const editTagName = ref('')

async function createCat() {
  if (!newCat.name.trim()) return
  try {
    await $fetch('/api/admin/categories', { method: 'POST', body: newCat })
    newCat.name = ''
    newCat.description = ''
    refreshCats()
    toast.success('Catégorie créée')
  } catch {
    toast.error('Erreur lors de la création')
  }
}

function startEditCat(cat: { id: number, name: string, description: string | null }) {
  editingCatId.value = cat.id
  editCatForm.name = cat.name
  editCatForm.description = cat.description ?? ''
}

async function saveEditCat(id: number) {
  try {
    await $fetch(`/api/admin/categories/${id}`, { method: 'PATCH', body: editCatForm })
    editingCatId.value = null
    refreshCats()
    toast.success('Catégorie mise à jour')
  } catch {
    toast.error('Erreur lors de la mise à jour')
  }
}

async function deleteCat(id: number) {
  if (!await confirm('Supprimer cette catégorie ?')) return
  try {
    await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    refreshCats()
    toast.success('Catégorie supprimée')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}

async function uploadIcon(catId: number, file: File) {
  uploadingIconFor.value = catId
  try {
    const form = new FormData()
    form.append('file', file)
    await $fetch(`/api/admin/categories/${catId}/icon`, { method: 'POST', body: form })
    await refreshCats()
    toast.success('Icône mise à jour')
  } catch {
    toast.error('Erreur lors de l\'upload')
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
  try {
    await $fetch('/api/admin/tags', { method: 'POST', body: newTag })
    newTag.name = ''
    refreshTags()
    toast.success('Tag créé')
  } catch {
    toast.error('Erreur lors de la création')
  }
}

function startEditTag(tag: { id: number, name: string }) {
  editingTagId.value = tag.id
  editTagName.value = tag.name
}

async function saveEditTag(id: number) {
  try {
    await $fetch(`/api/admin/tags/${id}`, { method: 'PATCH', body: { name: editTagName.value } })
    editingTagId.value = null
    refreshTags()
    toast.success('Tag mis à jour')
  } catch {
    toast.error('Erreur lors de la mise à jour')
  }
}

async function deleteTag(id: number) {
  if (!await confirm('Supprimer ce tag ?')) return
  try {
    await $fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
    refreshTags()
    toast.success('Tag supprimé')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}
</script>

<template>
  <div class="p-6 space-y-10">
    <!-- Categories -->
    <section>
      <h2 class="text-xl font-bold mb-4">
        Catégories
      </h2>
      <div class="flex gap-2 mb-6 flex-wrap">
        <CUInput
          v-model="newCat.name"
          placeholder="Nom de la catégorie"
        />
        <CUInput
          v-model="newCat.description"
          placeholder="Description"
        />
        <CUButton
          label="Ajouter"
          @click="createCat"
        />
      </div>
      <div class="space-y-2">
        <div
          v-for="cat in categories?.data ?? []"
          :key="cat.id"
          class="border-[0.1px] border-dashed border-dashcolor/50 p-3"
        >
          <!-- Edit mode -->
          <div
            v-if="editingCatId === cat.id"
            class="flex gap-2 items-center"
          >
            <CUInput
              v-model="editCatForm.name"
              placeholder="Nom"
              class="flex-1"
            />
            <CUInput
              v-model="editCatForm.description"
              placeholder="Description"
              class="flex-1"
            />
            <CUButton
              size="xs"
              label="OK"
              @click="saveEditCat(cat.id)"
            />
            <CUButton
              size="xs"
              label="✕"
              @click="editingCatId = null"
            />
          </div>
          <!-- View mode -->
          <div
            v-else
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 shrink-0 border-[0.1px] border-dashed border-dashcolor/30 flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="cat.imageUrl?.startsWith('https://')"
                  :src="cat.imageUrl"
                  :alt="cat.name"
                  class="w-full h-full object-cover"
                >
                <UIcon
                  v-else
                  name="i-lucide-image"
                  class="w-5 h-5 text-zinc-400"
                />
              </div>
              <div>
                <span class="font-medium text-sm block">{{ cat.name }}</span>
                <span class="text-xs text-zinc-500">{{ cat._count?.articles ?? 0 }} articles</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <label class="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  :disabled="uploadingIconFor === cat.id"
                  @change="onIconChange(cat.id, $event)"
                >
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
              <CUButton
                size="xs"
                logo-name="i-lucide-pencil"
                @click="startEditCat(cat)"
              />
              <CUButton
                size="xs"
                logo-name="i-lucide-trash"
                @click="deleteCat(cat.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tags -->
    <section>
      <h2 class="text-xl font-bold mb-4">
        Tags
      </h2>
      <div class="flex gap-2 mb-4">
        <CUInput
          v-model="newTag.name"
          placeholder="Nom du tag"
        />
        <CUButton
          label="Ajouter"
          @click="createTag"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="tag in tags?.data ?? []"
          :key="tag.id"
        >
          <div
            v-if="editingTagId === tag.id"
            class="flex items-center gap-1"
          >
            <CUInput
              v-model="editTagName"
              class="w-32"
            />
            <CUButton
              size="xs"
              label="OK"
              @click="saveEditTag(tag.id)"
            />
            <CUButton
              size="xs"
              label="✕"
              @click="editingTagId = null"
            />
          </div>
          <div
            v-else
            class="flex items-center gap-1 px-2 py-1 border-[0.1px] border-dashed border-dashcolor/50 text-sm"
          >
            {{ tag.name }}
            <button
              class="text-zinc-400 hover:text-white ml-1"
              @click="startEditTag(tag)"
            >
              ✎
            </button>
            <button
              class="text-zinc-400 hover:text-red-500 ml-1"
              @click="deleteTag(tag.id)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
