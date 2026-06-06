<script setup lang="ts">
const props = defineProps<{
  user: any
}>()

const emit = defineEmits(['updated'])

const { success, error: toastError } = useAppToast()
const open = defineModel<boolean>('open')
const loading = ref(false)

const form = reactive({
  name: props.user?.name ?? '',
  bio: props.user?.bio ?? '',
  githubUrl: props.user?.githubUrl ?? '',
  websiteUrl: props.user?.websiteUrl ?? ''
})

async function save() {
  loading.value = true
  try {
    await $fetch('/api/users/me', {
      method: 'PATCH',
      body: form
    })
    success('Profil mis à jour')
    emit('updated')
    open.value = false
  } catch (err: any) {
    toastError(err.data?.message || 'Impossible de mettre à jour le profil')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{
      overlay: 'bg-CustomColor-900/60 backdrop-blur-xs',
      content: 'ring-0 flex justify-center bg-transparent items-center'
    }"
  >
    <template #content>
      <div class="bg-CustomColor-900 border-dashcolor/50 border-[0.1px] shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] p-6 sm:p-8 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-6 text-white uppercase tracking-tight">Modifier le profil</h2>

        <form
          class="space-y-4"
          @submit.prevent="save"
        >
          <div>
            <label class="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5 block">Nom</label>
            <CUInput v-model="form.name" placeholder="Votre nom" />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5 block">Bio</label>
            <textarea
              v-model="form.bio"
              rows="3"
              class="w-full bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 outline-none text-sm text-white placeholder:text-zinc-600 focus:border-primary/50 transition-colors"
              placeholder="Parlez-nous de vous..."
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5 block">GitHub</label>
              <CUInput v-model="form.githubUrl" type="url" placeholder="https://github.com/..." />
            </div>
            <div>
              <label class="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5 block">Site web</label>
              <CUInput v-model="form.websiteUrl" type="url" placeholder="https://..." />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <CUButton
              type="button"
              label="Annuler"
              class="bg-transparent border-transparent hover:bg-white/5"
              @click="open = false"
            />
            <CUButton
              type="submit"
              label="Sauvegarder"
              :loading="loading"
            />
          </div>
        </form>
      </div>
    </template>
  </UModal>
</template>
