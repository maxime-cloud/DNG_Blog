<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Gestion des utilisateurs' })

interface UserRow {
  id: string
  name: string
  email: string
  image?: string | null
  role: string
  banned?: boolean
  emailVerified: boolean
  createdAt: string
  _count?: { articles: number, comments: number }
}

interface UserDetail extends UserRow {
  bio?: string | null
  githubUrl?: string | null
  websiteUrl?: string | null
  banReason?: string | null
}

type FetchErr = { data?: { statusMessage?: string } }
const errMsg = (e: unknown, fallback: string) => (e as FetchErr)?.data?.statusMessage ?? fallback

// ── List ──────────────────────────────────────────────────────────────────────
const search = ref('')
const roleFilter = ref('')
const page = ref(1)
const { data, refresh } = await useFetch('/api/admin/users', {
  query: computed(() => ({
    page: page.value,
    limit: 20,
    search: search.value || undefined,
    role: roleFilter.value || undefined
  }))
})

const columns = [
  { key: 'name', label: 'Utilisateur' },
  { key: 'role', label: 'Rôle' },
  { key: 'status', label: 'Statut' },
  { key: 'createdAt', label: 'Inscription' },
  { key: 'actions', label: '' }
]

// ── Create panel ──────────────────────────────────────────────────────────────
const showCreate = ref(false)
const creating = ref(false)
const newUser = reactive({ name: '', email: '', password: '', role: 'reader' as string })

async function createUser() {
  if (!newUser.name || !newUser.email) return
  creating.value = true
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password || undefined,
        role: newUser.role
      }
    })
    toast.success('Utilisateur créé')
    Object.assign(newUser, { name: '', email: '', password: '', role: 'reader' })
    showCreate.value = false
    refresh()
  } catch (e) {
    toast.error(errMsg(e, 'Erreur création'))
  } finally {
    creating.value = false
  }
}

// ── Selected user panel ───────────────────────────────────────────────────────
const selectedId = ref<string | null>(null)
const activeTab = ref<'profile' | 'password' | 'actions'>('profile')

const selectedDetail = ref<UserDetail | null>(null)

async function refreshSelected() {
  if (!selectedId.value) return
  const res = await $fetch<{ data: UserDetail }>(`/api/admin/users/${selectedId.value}`)
  selectedDetail.value = res.data
}

watch(selectedId, async (id) => {
  if (id) await refreshSelected()
  else selectedDetail.value = null
})

const selected = computed(() => selectedDetail.value)

function selectUser(id: string) {
  if (selectedId.value === id) {
    selectedId.value = null
    return
  }
  selectedId.value = id
  activeTab.value = 'profile'
}

// ── Profile edit ──────────────────────────────────────────────────────────────
const profileForm = reactive({ name: '', email: '', bio: '', githubUrl: '', websiteUrl: '' })
const savingProfile = ref(false)

function syncProfileForm(user: typeof selected.value) {
  if (!user) return
  profileForm.name = user.name ?? ''
  profileForm.email = user.email ?? ''
  profileForm.bio = user.bio ?? ''
  profileForm.githubUrl = user.githubUrl ?? ''
  profileForm.websiteUrl = user.websiteUrl ?? ''
}
watch(selected, syncProfileForm)

async function saveProfile() {
  if (!selectedId.value) return
  savingProfile.value = true
  try {
    await $fetch(`/api/admin/users/${selectedId.value}/profile`, {
      method: 'PATCH',
      body: profileForm
    })
    toast.success('Profil mis à jour')
    refreshSelected()
    refresh()
  } catch (e) {
    toast.error(errMsg(e, 'Erreur sauvegarde'))
  } finally {
    savingProfile.value = false
  }
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const uploadingAvatar = ref(false)

async function onAvatarChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !selectedId.value) return
  uploadingAvatar.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    await $fetch(`/api/admin/users/${selectedId.value}/avatar`, { method: 'POST', body: form })
    toast.success('Photo mise à jour')
    refreshSelected()
    refresh()
  } catch {
    toast.error('Erreur upload avatar')
  } finally {
    uploadingAvatar.value = false
  }
}

// ── Password ──────────────────────────────────────────────────────────────────
const newPassword = ref('')
const savingPassword = ref(false)

async function savePassword() {
  if (!selectedId.value || newPassword.value.length < 8) return
  savingPassword.value = true
  try {
    await $fetch(`/api/admin/users/${selectedId.value}/password`, {
      method: 'PATCH',
      body: { newPassword: newPassword.value }
    })
    toast.success('Mot de passe mis à jour — sessions révoquées')
    newPassword.value = ''
  } catch (e) {
    toast.error(errMsg(e, 'Erreur mot de passe'))
  } finally {
    savingPassword.value = false
  }
}

// ── Role ──────────────────────────────────────────────────────────────────────
async function changeRole(id: string, role: string) {
  try {
    await $fetch(`/api/admin/users/${id}/role`, { method: 'PATCH', body: { role } })
    toast.success('Rôle modifié')
    refreshSelected()
    refresh()
  } catch (e) {
    toast.error(errMsg(e, 'Erreur rôle'))
  }
}

// ── Ban / Unban ───────────────────────────────────────────────────────────────
async function ban(id: string) {
  try {
    await $fetch(`/api/admin/users/${id}/ban`, { method: 'PATCH' })
    toast.success('Utilisateur banni')
    refreshSelected()
    refresh()
  } catch (e) {
    toast.error(errMsg(e, 'Erreur ban'))
  }
}

async function unban(id: string) {
  try {
    await $fetch(`/api/admin/users/${id}/unban`, { method: 'PATCH' })
    toast.success('Utilisateur débanni')
    refreshSelected()
    refresh()
  } catch (e) {
    toast.error(errMsg(e, 'Erreur unban'))
  }
}

// ── Verify email ──────────────────────────────────────────────────────────────
async function verifyEmail(id: string) {
  try {
    await $fetch(`/api/admin/users/${id}/verify-email`, { method: 'PATCH' })
    toast.success('Email marqué comme vérifié')
    refreshSelected()
    refresh()
  } catch (e) {
    toast.error(errMsg(e, 'Erreur vérification'))
  }
}

// ── Revoke sessions ───────────────────────────────────────────────────────────
async function revokeSessions(id: string) {
  try {
    const res = await $fetch<{ count: number }>(`/api/admin/users/${id}/sessions`, {
      method: 'DELETE'
    })
    toast.success(`${res.count} session(s) révoquée(s)`)
  } catch (e) {
    toast.error(errMsg(e, 'Erreur révocation'))
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const confirmDelete = ref(false)
const deleting = ref(false)

async function deleteUser() {
  if (!selectedId.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/users/${selectedId.value}`, { method: 'DELETE' })
    toast.success('Utilisateur supprimé')
    selectedId.value = null
    confirmDelete.value = false
    refresh()
  } catch (e) {
    toast.error(errMsg(e, 'Erreur suppression'))
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">
        Utilisateurs
      </h1>
      <CUButton
        label="Ajouter"
        logo-name="i-lucide-plus"
        logo-position="left"
        @click="showCreate = !showCreate"
      />
    </div>

    <!-- Create form -->
    <div
      v-if="showCreate"
      class="mb-6 p-4 border-[0.1px] border-dashed border-dashcolor/50 space-y-3"
    >
      <p class="text-sm font-semibold text-white">
        Nouvel utilisateur
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CUInput
          v-model="newUser.name"
          placeholder="Nom complet"
        />
        <CUInput
          v-model="newUser.email"
          placeholder="Email"
          type="email"
        />
        <CUInput
          v-model="newUser.password"
          placeholder="Mot de passe (min 8 car.)"
          type="password"
        />
        <select
          v-model="newUser.role"
          class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none text-white"
        >
          <option value="reader">
            Reader
          </option>
          <option value="author">
            Author
          </option>
          <option value="admin">
            Admin
          </option>
        </select>
      </div>
      <div class="flex gap-2">
        <CUButton
          :label="creating ? 'Création...' : 'Créer'"
          :disabled="creating"
          @click="createUser"
        />
        <CUButton
          label="Annuler"
          @click="showCreate = false"
        />
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-3 mb-4 flex-wrap">
      <CUInput
        v-model="search"
        placeholder="Rechercher par nom ou email..."
        class="flex-1 min-w-48"
      />
      <select
        v-model="roleFilter"
        class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none text-white"
      >
        <option value="">
          Tous les rôles
        </option>
        <option value="reader">
          Reader
        </option>
        <option value="author">
          Author
        </option>
        <option value="admin">
          Admin
        </option>
      </select>
    </div>

    <!-- Table -->
    <AdminDataTable
      :columns="columns"
      :rows="(data?.data ?? []) as unknown as UserRow[]"
      :total="data?.meta?.total"
      :page="page"
      @page-change="page = $event"
    >
      <template #name="{ row }">
        <div class="flex items-center gap-2">
          <UAvatar
            :src="row.image ?? undefined"
            :alt="row.name"
            size="xs"
          />
          <div>
            <p class="text-sm font-medium">
              {{ row.name }}
            </p>
            <p class="text-xs text-zinc-500">
              {{ row.email }}
            </p>
          </div>
        </div>
      </template>

      <template #role="{ row }">
        <UBadge
          :label="row.role"
          size="xs"
        />
      </template>

      <template #status="{ row }">
        <div class="flex items-center gap-1">
          <UBadge
            :label="row.banned ? 'Banni' : 'Actif'"
            :color="row.banned ? 'error' : 'success'"
            size="xs"
          />
          <UBadge
            v-if="!row.emailVerified"
            label="Non vérifié"
            color="warning"
            size="xs"
          />
        </div>
      </template>

      <template #createdAt="{ row }">
        <span class="text-xs text-zinc-500">{{
          new Date(row.createdAt).toLocaleDateString('fr-FR')
        }}</span>
      </template>

      <template #actions="{ row }">
        <CUButton
          size="xs"
          :label="selectedId === row.id ? 'Fermer' : 'Gérer'"
          :logo-name="selectedId === row.id ? 'i-lucide-x' : 'i-lucide-settings'"
          logo-position="left"
          @click="selectUser(row.id)"
        />
      </template>
    </AdminDataTable>

    <!-- User management panel -->
    <div
      v-if="selectedId && selected"
      class="mt-6 border-[0.1px] border-dashed border-dashcolor/50"
    >
      <!-- Panel header -->
      <div class="flex items-center gap-4 p-4 border-b border-dashed border-dashcolor/30">
        <!-- Avatar with upload -->
        <div class="relative shrink-0">
          <UAvatar
            :src="selected.image ?? undefined"
            :alt="selected.name"
            size="xl"
          />
          <label class="absolute bottom-0 right-0 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="onAvatarChange"
            >
            <span
              class="flex items-center justify-center w-6 h-6 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 hover:border-primary/50 transition-colors"
            >
              <UIcon
                :name="uploadingAvatar ? 'i-lucide-loader' : 'i-lucide-camera'"
                class="w-3.5 h-3.5"
                :class="uploadingAvatar ? 'animate-spin' : ''"
              />
            </span>
          </label>
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-semibold truncate">
            {{ selected.name }}
          </p>
          <p class="text-sm text-zinc-500 truncate">
            {{ selected.email }}
          </p>
          <div class="flex items-center gap-2 mt-1">
            <UBadge
              :label="selected.role"
              size="xs"
            />
            <UBadge
              :label="selected.banned ? 'Banni' : 'Actif'"
              :color="selected.banned ? 'error' : 'success'"
              size="xs"
            />
            <UBadge
              v-if="!selected.emailVerified"
              label="Email non vérifié"
              color="warning"
              size="xs"
            />
          </div>
        </div>

        <div class="text-xs text-zinc-500 text-right shrink-0">
          <p>{{ selected._count?.articles ?? 0 }} articles</p>
          <p>{{ selected._count?.comments ?? 0 }} commentaires</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-dashed border-dashcolor/30">
        <button
          v-for="tab in [
            { key: 'profile', label: 'Profil' },
            { key: 'password', label: 'Mot de passe' },
            { key: 'actions', label: 'Actions' }
          ]"
          :key="tab.key"
          class="px-4 py-2 text-sm transition-colors border-b-2"
          :class="
            activeTab === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-zinc-500 hover:text-white'
          "
          @click="activeTab = tab.key as any"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab: Profile -->
      <div
        v-if="activeTab === 'profile'"
        class="p-4 space-y-3"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-zinc-500 block mb-1">Nom</label>
            <CUInput
              v-model="profileForm.name"
              placeholder="Nom complet"
            />
          </div>
          <div>
            <label class="text-xs text-zinc-500 block mb-1">Email</label>
            <CUInput
              v-model="profileForm.email"
              placeholder="Email"
              type="email"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs text-zinc-500 block mb-1">Bio</label>
            <CUInput
              v-model="profileForm.bio"
              placeholder="Biographie courte"
            />
          </div>
          <div>
            <label class="text-xs text-zinc-500 block mb-1">GitHub URL</label>
            <CUInput
              v-model="profileForm.githubUrl"
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label class="text-xs text-zinc-500 block mb-1">Site web</label>
            <CUInput
              v-model="profileForm.websiteUrl"
              placeholder="https://..."
            />
          </div>
        </div>
        <CUButton
          :label="savingProfile ? 'Sauvegarde...' : 'Sauvegarder'"
          :disabled="savingProfile"
          @click="saveProfile"
        />
      </div>

      <!-- Tab: Password -->
      <div
        v-if="activeTab === 'password'"
        class="p-4 space-y-3"
      >
        <p class="text-xs text-zinc-500">
          Définir un nouveau mot de passe. Toutes les sessions actives de l'utilisateur seront
          révoquées.
        </p>
        <div class="max-w-sm">
          <label class="text-xs text-zinc-500 block mb-1">Nouveau mot de passe (min 8 car.)</label>
          <CUInput
            v-model="newPassword"
            placeholder="Nouveau mot de passe"
            type="password"
          />
        </div>
        <CUButton
          :label="savingPassword ? 'Mise à jour...' : 'Définir le mot de passe'"
          :disabled="savingPassword || newPassword.length < 8"
          @click="savePassword"
        />
      </div>

      <!-- Tab: Actions -->
      <div
        v-if="activeTab === 'actions'"
        class="p-4 space-y-6"
      >
        <!-- Role -->
        <div>
          <p class="text-sm font-medium mb-2">
            Changer le rôle
          </p>
          <div class="flex items-center gap-2">
            <select
              class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 px-3 py-2 text-sm rounded-none text-white"
              :value="selected.role"
              @change="changeRole(selected.id, ($event.target as HTMLSelectElement).value)"
            >
              <option value="reader">
                Reader
              </option>
              <option value="author">
                Author
              </option>
              <option value="admin">
                Admin
              </option>
            </select>
          </div>
        </div>

        <!-- Email verification -->
        <div>
          <p class="text-sm font-medium mb-2">
            Vérification email
          </p>
          <div class="flex items-center gap-3">
            <UBadge
              :label="selected.emailVerified ? 'Email vérifié' : 'Email non vérifié'"
              :color="selected.emailVerified ? 'success' : 'warning'"
              size="sm"
            />
            <CUButton
              v-if="!selected.emailVerified"
              size="xs"
              label="Marquer comme vérifié"
              logo-name="i-lucide-check-circle"
              logo-position="left"
              @click="verifyEmail(selected.id)"
            />
          </div>
        </div>

        <!-- Ban / Unban -->
        <div>
          <p class="text-sm font-medium mb-2">
            Suspension
          </p>
          <div
            v-if="selected.banned"
            class="space-y-1"
          >
            <p class="text-xs text-zinc-500">
              Raison : {{ selected.banReason ?? 'Non précisée' }}
            </p>
            <CUButton
              size="xs"
              label="Débannir"
              logo-name="i-lucide-shield-check"
              logo-position="left"
              @click="unban(selected.id)"
            />
          </div>
          <CUButton
            v-else
            size="xs"
            label="Bannir"
            logo-name="i-lucide-shield-ban"
            logo-position="left"
            @click="ban(selected.id)"
          />
        </div>

        <!-- Revoke sessions -->
        <div>
          <p class="text-sm font-medium mb-2">
            Sessions actives
          </p>
          <CUButton
            size="xs"
            label="Révoquer toutes les sessions"
            logo-name="i-lucide-log-out"
            logo-position="left"
            @click="revokeSessions(selected.id)"
          />
        </div>

        <!-- Delete -->
        <div class="border-t border-dashed border-red-400/30 pt-4">
          <p class="text-sm font-medium text-red-500 mb-2">
            Zone de danger
          </p>
          <div v-if="!confirmDelete">
            <CUButton
              size="xs"
              label="Supprimer le compte"
              logo-name="i-lucide-trash-2"
              logo-position="left"
              @click="confirmDelete = true"
            />
          </div>
          <div
            v-else
            class="space-y-2"
          >
            <p class="text-xs text-red-400">
              Cette action est irréversible. Tous les articles et données associés seront supprimés.
            </p>
            <div class="flex gap-2">
              <CUButton
                size="xs"
                :label="deleting ? 'Suppression...' : 'Confirmer la suppression'"
                :disabled="deleting"
                @click="deleteUser"
              />
              <CUButton
                size="xs"
                label="Annuler"
                @click="confirmDelete = false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
