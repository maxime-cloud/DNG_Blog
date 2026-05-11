<script setup lang="ts">
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

async function createCampaign() {
  await $fetch('/api/admin/newsletter/campaigns', { method: 'POST', body: newCampaign })
  showNewCampaign.value = false
  newCampaign.subject = ''
  newCampaign.bodyHtml = ''
  refreshCampaigns()
}
async function sendCampaign(id: number) {
  await $fetch(`/api/admin/newsletter/campaigns/${id}/send`, { method: 'POST' })
  refreshCampaigns()
}
async function deleteSub(id: number) {
  await $fetch(`/api/admin/newsletter/subscribers/${id}`, { method: 'DELETE' })
  refreshSubs()
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Newsletter</h1>

    <!-- Tabs -->
    <div class="flex gap-0 mb-6 border-b border-[0.1px] border-dashed border-dashcolor/50">
      <button
        v-for="t in [
          ['subscribers', 'Abonnés'],
          ['campaigns', 'Campagnes']
        ]"
        :key="t[0]"
        :class="tab === t[0] ? 'border-b-2 border-primary text-primary' : 'text-zinc-500'"
        class="px-4 py-2 text-sm font-medium -mb-px"
        @click="tab = t[0] as any"
      >
        {{ t[1] }}
      </button>
    </div>

    <!-- Subscribers -->
    <div v-if="tab === 'subscribers'">
      <p class="text-sm text-zinc-500 mb-4">{{ subscribers?.total ?? 0 }} abonnés</p>
      <div class="space-y-2">
        <div
          v-for="sub in subscribers?.data ?? []"
          :key="sub.id"
          class="flex items-center justify-between p-3 border-[0.1px] border-dashed border-dashcolor/50"
        >
          <div>
            <p class="text-sm font-medium">{{ sub.email }}</p>
            <p class="text-xs text-zinc-500">
              {{ sub.name }} — <UBadge :label="sub.status" size="xs" />
            </p>
          </div>
          <CUButton size="xs" logoName="i-lucide-trash" @click="deleteSub(sub.id)" />
        </div>
      </div>
    </div>

    <!-- Campaigns -->
    <div v-else>
      <div class="flex justify-between mb-4">
        <CUButton
          label="Nouvelle campagne"
          logoName="i-lucide-plus"
          @click="showNewCampaign = true"
        />
      </div>

      <!-- New campaign form -->
      <div v-if="showNewCampaign" class="border-[0.1px] border-dashed border-dashcolor/50 p-4 mb-6">
        <h3 class="font-semibold mb-3">Nouvelle campagne</h3>
        <div class="space-y-3">
          <CUInput v-model="newCampaign.subject" placeholder="Objet de l'email" />
          <textarea
            v-model="newCampaign.bodyHtml"
            rows="6"
            placeholder="Corps HTML..."
            class="w-full bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 text-sm outline-none rounded-none"
          />
          <div class="flex gap-2">
            <CUButton label="Créer (brouillon)" @click="createCampaign" />
            <CUButton label="Annuler" @click="showNewCampaign = false" />
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
            <p class="font-medium">{{ c.subject }}</p>
            <p class="text-xs text-zinc-500">
              {{ new Date(c.createdAt).toLocaleDateString('fr-FR') }} —
              <UBadge :label="c.status" size="xs" />
            </p>
          </div>
          <CUButton
            v-if="['DRAFT', 'SCHEDULED'].includes(c.status)"
            size="sm"
            label="Envoyer"
            @click="sendCampaign(c.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
