<script setup lang="ts">
import { toast } from 'vue-sonner'

const { confirm } = useConfirm()

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Newsletter' })

const tab = ref<'subscribers' | 'campaigns'>('subscribers')
const { data: subscribers, refresh: refreshSubs } = await useFetch(
  '/api/admin/newsletter/subscribers',
  { query: { limit: 20 } }
)
const { data: campaigns, refresh: refreshCampaigns } = await useFetch(
  '/api/admin/newsletter/campaigns'
)

const showNewCampaign = ref(false)
const newCampaign = reactive({ subject: '', bodyHtml: '' })
const testEmail = ref('')
const sendingTest = ref<number | null>(null)

async function createCampaign() {
  if (!newCampaign.subject.trim() || !newCampaign.bodyHtml.trim()) return
  try {
    await $fetch('/api/admin/newsletter/campaigns', { method: 'POST', body: newCampaign })
    showNewCampaign.value = false
    newCampaign.subject = ''
    newCampaign.bodyHtml = ''
    refreshCampaigns()
    toast.success('Campagne créée')
  } catch {
    toast.error('Erreur lors de la création')
  }
}

async function sendCampaign(id: number) {
  if (
    !(await confirm(
      'Cette action enverra la campagne à tous les abonnés actifs. Continuer ?',
      'Envoyer la campagne'
    ))
  )
    return
  try {
    await $fetch(`/api/admin/newsletter/campaigns/${id}/send`, { method: 'POST' })
    refreshCampaigns()
    toast.success('Campagne envoyée')
  } catch {
    toast.error('Erreur lors de l\'envoi')
  }
}

async function sendTest(id: number) {
  if (!testEmail.value.trim()) {
    toast.warning('Entrez un email de test')
    return
  }
  sendingTest.value = id
  try {
    await $fetch(`/api/admin/newsletter/campaigns/${id}/test`, {
      method: 'POST',
      body: { email: testEmail.value }
    })
    toast.success(`Email de test envoyé à ${testEmail.value}`)
  } catch {
    toast.error('Erreur lors de l\'envoi du test')
  } finally {
    sendingTest.value = null
  }
}

async function deleteCampaign(id: number) {
  if (!(await confirm('Supprimer cette campagne ?'))) return
  try {
    await $fetch(`/api/admin/newsletter/campaigns/${id}`, { method: 'DELETE' })
    refreshCampaigns()
    toast.success('Campagne supprimée')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}

async function deleteSub(id: number) {
  if (!(await confirm('Supprimer cet abonné ?'))) return
  try {
    await $fetch(`/api/admin/newsletter/subscribers/${id}`, { method: 'DELETE' })
    refreshSubs()
    toast.success('Abonné supprimé')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">
      Newsletter
    </h1>

    <div class="flex gap-0 mb-6 border-b border-[0.1px] border-dashed border-dashcolor/50">
      <button
        v-for="[key, label] in [
          ['subscribers', 'Abonnés'],
          ['campaigns', 'Campagnes']
        ]"
        :key="key"
        :class="tab === key ? 'border-b-2 border-primary text-primary' : 'text-zinc-500'"
        class="px-4 py-2 text-sm font-medium -mb-px"
        @click="tab = key as 'subscribers' | 'campaigns'"
      >
        {{ label }}
      </button>
    </div>

    <!-- Subscribers -->
    <div v-if="tab === 'subscribers'">
      <p class="text-sm text-zinc-500 mb-4">
        {{ subscribers?.total ?? subscribers?.meta?.total ?? 0 }} abonnés
      </p>
      <div class="space-y-2">
        <div
          v-for="sub in subscribers?.data ?? []"
          :key="sub.id"
          class="flex items-center justify-between p-3 border-[0.1px] border-dashed border-dashcolor/50"
        >
          <div>
            <p class="text-sm font-medium text-white">
              {{ sub.email }}
            </p>
            <p class="text-xs text-zinc-500">
              {{ sub.name }} — <UBadge
                :label="sub.status"
                size="sm"
              />
            </p>
          </div>
          <CUButton
            size="xs"
            logo-name="i-lucide-trash"
            @click="deleteSub(sub.id)"
          />
        </div>
      </div>
    </div>

    <!-- Campaigns -->
    <div v-else>
      <div class="flex justify-between mb-4">
        <CUButton
          label="Nouvelle campagne"
          logo-name="i-lucide-plus"
          @click="showNewCampaign = true"
        />
      </div>

      <!-- Test email input -->
      <div class="flex gap-2 mb-4">
        <CUInput
          v-model="testEmail"
          placeholder="Email de test..."
          type="email"
          class="max-w-xs"
        />
      </div>

      <div
        v-if="showNewCampaign"
        class="border-[0.1px] border-dashed border-dashcolor/50 p-4 mb-6"
      >
        <h3 class="font-semibold mb-3 text-white">
          Nouvelle campagne
        </h3>
        <div class="space-y-3">
          <CUInput
            v-model="newCampaign.subject"
            placeholder="Objet de l'email"
          />
          <textarea
            v-model="newCampaign.bodyHtml"
            rows="6"
            placeholder="Corps HTML..."
            class="w-full bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 text-sm outline-none rounded-none text-white placeholder-[#F3F4F6]/60"
          />
          <div class="flex gap-2">
            <CUButton
              label="Créer (brouillon)"
              @click="createCampaign"
            />
            <CUButton
              label="Annuler"
              @click="showNewCampaign = false"
            />
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="c in campaigns?.data ?? []"
          :key="c.id"
          class="flex items-center justify-between p-4 border-[0.1px] border-dashed border-dashcolor/50"
        >
          <div>
            <p class="font-medium text-white">
              {{ c.subject }}
            </p>
            <p class="text-xs text-zinc-500">
              {{ new Date(c.createdAt).toLocaleDateString('fr-FR') }} —
              <UBadge
                :label="c.status"
                size="sm"
              />
            </p>
          </div>
          <div class="flex gap-2 items-center">
            <CUButton
              v-if="testEmail"
              size="xs"
              label="Test"
              logo-name="i-lucide-send"
              :loading="sendingTest === c.id"
              @click="sendTest(c.id)"
            />
            <CUButton
              v-if="['DRAFT', 'SCHEDULED'].includes(c.status)"
              size="sm"
              label="Envoyer"
              @click="sendCampaign(c.id)"
            />
            <CUButton
              size="xs"
              logo-name="i-lucide-trash"
              @click="deleteCampaign(c.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
