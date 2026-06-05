<script setup lang="ts">
import { toast } from 'vue-sonner'

const { confirm } = useConfirm()

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Changelog' })

const { data, refresh } = await useFetch('/api/changelog', { query: { limit: 50 } })
const showNew = ref(false)
const newEntry = reactive({ type: 'FEATURE', title: '', description: '' })
const editingId = ref<number | null>(null)
const editForm = reactive({ type: 'FEATURE', title: '', description: '' })

const TYPES = ['FEATURE', 'FIX', 'CONTENT', 'DESIGN', 'PERF', 'SECURITY']
const typeColors: Record<string, string> = {
  FEATURE: 'bg-green-100 text-green-700 bg-green-900/40 text-green-300',
  FIX: 'bg-red-100 text-red-700 bg-red-900/40 text-red-300',
  CONTENT: 'bg-blue-100 text-blue-700 bg-blue-900/40 text-blue-300',
  DESIGN: 'bg-purple-100 text-purple-700 bg-purple-900/40 text-purple-300',
  PERF: 'bg-orange-100 text-orange-700 bg-orange-900/40 text-orange-300',
  SECURITY: 'bg-yellow-100 text-yellow-700 bg-yellow-900/40 text-yellow-300'
}

async function create() {
  if (!newEntry.title.trim()) return
  try {
    await $fetch('/api/admin/changelog', {
      method: 'POST',
      body: { ...newEntry, publishedAt: new Date().toISOString() }
    })
    showNew.value = false
    Object.assign(newEntry, { type: 'FEATURE', title: '', description: '' })
    refresh()
    toast.success('Entrée créée')
  } catch {
    toast.error('Erreur lors de la création')
  }
}

function startEdit(e: { id: number, type: string, title: string, description: string | null }) {
  editingId.value = e.id
  editForm.type = e.type
  editForm.title = e.title
  editForm.description = e.description ?? ''
}

async function saveEdit(id: number) {
  try {
    await $fetch(`/api/admin/changelog/${id}`, { method: 'PATCH', body: editForm })
    editingId.value = null
    refresh()
    toast.success('Entrée mise à jour')
  } catch {
    toast.error('Erreur lors de la mise à jour')
  }
}

async function del(id: number) {
  if (!await confirm('Supprimer cette entrée ?')) return
  try {
    await $fetch(`/api/admin/changelog/${id}`, { method: 'DELETE' })
    refresh()
    toast.success('Entrée supprimée')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between mb-6">
      <h1 class="text-2xl font-bold">
        Changelog
      </h1>
      <CUButton
        label="Nouvelle entrée"
        logo-name="i-lucide-plus"
        @click="showNew = true"
      />
    </div>

    <div
      v-if="showNew"
      class="border-[0.1px] border-dashed border-dashcolor/50 p-4 mb-6 space-y-3"
    >
      <select
        v-model="newEntry.type"
        class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none w-full text-white"
      >
        <option
          v-for="t in TYPES"
          :key="t"
          :value="t"
        >
          {{ t }}
        </option>
      </select>
      <CUInput
        v-model="newEntry.title"
        placeholder="Titre"
      />
      <textarea
        v-model="newEntry.description"
        rows="3"
        placeholder="Description..."
        class="w-full bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 text-sm outline-none rounded-none text-white placeholder-[#F3F4F6]/60"
      />
      <div class="flex gap-2">
        <CUButton
          label="Créer"
          @click="create"
        />
        <CUButton
          label="Annuler"
          @click="showNew = false"
        />
      </div>
    </div>

    <div class="space-y-3">
      <div
        v-for="entry in data?.data ?? []"
        :key="entry.id"
        class="border-[0.1px] border-dashed border-dashcolor/50 p-4"
      >
        <div
          v-if="editingId === entry.id"
          class="space-y-2"
        >
          <select
            v-model="editForm.type"
            class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none w-full text-white"
          >
            <option
              v-for="t in TYPES"
              :key="t"
              :value="t"
            >
              {{ t }}
            </option>
          </select>
          <CUInput
            v-model="editForm.title"
            placeholder="Titre"
          />
          <textarea
            v-model="editForm.description"
            rows="3"
            placeholder="Description..."
            class="w-full bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 text-sm outline-none rounded-none text-white placeholder-[#F3F4F6]/60"
          />
          <div class="flex gap-2">
            <CUButton
              size="xs"
              label="Sauvegarder"
              @click="saveEdit(entry.id)"
            />
            <CUButton
              size="xs"
              label="Annuler"
              @click="editingId = null"
            />
          </div>
        </div>
        <div
          v-else
          class="flex items-start justify-between"
        >
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span
                :class="typeColors[entry.type]"
                class="text-xs px-2 py-0.5 font-medium"
              >{{
                entry.type
              }}</span>
              <span class="text-xs text-zinc-400">{{
                new Date(entry.publishedAt).toLocaleDateString('fr-FR')
              }}</span>
            </div>
            <p class="font-medium text-sm">
              {{ entry.title }}
            </p>
            <p
              v-if="entry.description"
              class="text-xs text-zinc-500 mt-0.5"
            >
              {{ entry.description }}
            </p>
          </div>
          <div class="flex gap-1 shrink-0 ml-2">
            <CUButton
              size="xs"
              logo-name="i-lucide-pencil"
              @click="startEdit(entry)"
            />
            <CUButton
              size="xs"
              logo-name="i-lucide-trash"
              @click="del(entry.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
