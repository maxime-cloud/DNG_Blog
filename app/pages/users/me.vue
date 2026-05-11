<script setup>
definePageMeta({ middleware: "auth" });

const { user } = useAuth();
const toast = useToast();
const loading = ref(false);

const form = reactive({
  name: user.value?.name ?? "",
  bio: "",
  githubUrl: "",
  websiteUrl: "",
});

// Fetch full profile
const { data: profile } = await useFetch("/api/users/me");
watch(
  profile,
  (val) => {
    if (val)
      Object.assign(form, {
        name: val.name,
        bio: val.bio ?? "",
        githubUrl: val.githubUrl ?? "",
        websiteUrl: val.websiteUrl ?? "",
      });
  },
  { immediate: true },
);

async function save() {
  loading.value = true;
  try {
    await $fetch("/api/users/me", { method: "PATCH", body: form });
    toast.add({ title: "Profil mis à jour", color: "success" });
  } catch (e) {
    toast.add({
      title: "Erreur",
      description: "Impossible de mettre à jour",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

useSeoMeta({ title: "Mon profil" });
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="max-w-2xl mx-auto py-10 px-4">
        <h1 class="text-3xl font-bold mb-8">Mon profil</h1>

        <form @submit.prevent="save" class="space-y-6">
          <!-- Avatar section -->
          <div class="flex items-center gap-4">
            <UAvatar :src="user?.image ?? '/user-avatar.png'" size="xl" />
          </div>

          <div>
            <label class="text-sm font-medium mb-1 block">Nom</label>
            <CUInput v-model="form.name" />
          </div>
          <div>
            <label class="text-sm font-medium mb-1 block">Bio</label>
            <textarea
              v-model="form.bio"
              rows="3"
              class="w-full bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 p-3 outline-none text-sm"
            />
          </div>
          <div>
            <label class="text-sm font-medium mb-1 block">GitHub URL</label>
            <CUInput v-model="form.githubUrl" type="url" />
          </div>
          <div>
            <label class="text-sm font-medium mb-1 block">Site web</label>
            <CUInput v-model="form.websiteUrl" type="url" />
          </div>

          <CUButton type="submit" label="Sauvegarder" :loading="loading" />
        </form>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
