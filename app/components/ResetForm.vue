<template>
  <UForm
    :schema="schema"
    @submit="onSubmit"
    :state="state"
    class="flex flex-col items-center justify-center w-full max-w-md p-8 bg-CustomLight dark:bg-CustomColor-900 relative shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] dark:border-dashcolor/50 border-[0.1px] border-primary/30"
  >
    <div class="w-full">
      <div class="mb-6">
        <div class="flex items-center justify-center mb-4 gap-4">
          <AppLogo />
          <h1 class="text-xl lg:text-2xl font-semibold">DNG Blog</h1>
        </div>
        <h2 v-if="!tokentError" class="text-2xl font-bold mb-1 text-[#0F0F0F] dark:text-[#F3F4F6]">
          Réinitialisez votre mot passe
        </h2>
      </div>
      
      <UAlert
          v-if="error && !tokentError"
          class="mb-4 flex flex-col rounded-none ring-0 items-center justify-center bg-CustomLight dark:bg-CustomColor-900 relative shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] text-red-400 dark:border-red-400/50 border-[0.1px] border-red-400/30"
          :description="error"
          color="neutral"
          variant="outline"
        />
      
        <UAlert
            v-if="error && tokentError"
            class="mb-4 flex flex-col rounded-none ring-0 items-center justify-center bg-CustomLight dark:bg-CustomColor-900 relative shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] text-red-400 dark:border-red-400/50 border-[0.1px] border-red-400/30"
            :description="error"
            color="neutral"
            variant="outline"
            :ui="{
              description: 'text-md'
            }"
          />

        <UFormField v-if="!tokentError" label="Nouveau mot de passe" name="password" class="mb-6 flex flex-col gap-1 text-xs sm:text-sm relative">
          <div class="flex">
            <CUInput
              v-model="state.password"
              id="password"
              placeholder="Mot de passe"
              :type="showPassword ? 'text' : 'password'"
              size="lg"
              class="w-full"
            />
            <CUButton
            @click.prevent="showPassword = !showPassword"
              :logoName="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              logoPosition="right"
              size="lg"
              class=""
            />
          </div>
        </UFormField>

      <CUButton
        v-if="!tokentError"
        loading-auto
        type="submit"
        label="Réinitialiser"
        size="lg"
        class="w-full mb-4 justify-center"
      />
      <CUButton v-if="tokentError" @click="router.push('/auth/login')" label="Se connecter" class="w-full justify-center mb-4" size="lg" logoPosition="right" />
      <CUButton v-if="tokentError" @click="router.push('/')" label="Retour a l'accueil" class="w-full justify-center mb-4" size="lg" logoPosition="right" />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from '@nuxt/ui'
import { authClient } from "@/lib/auth-client";

const showPassword = ref(false);
const tokentError = ref(false)
const error: Ref<string | null | undefined> = ref(null);
const route = useRoute();
const router = useRouter();
const schema = z.object({
  password: z
    .string("Mot de passe requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  password: undefined,
});

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  error.value = null;
  const token = new URLSearchParams(window.location.search).get("token");
  if (!token) {
    error.value = "Le lien de réinitialisation du mot de passe est invalide ou a expiré.";
    return;
  }
  const { data, error: err } = await authClient.resetPassword({
      newPassword: event.data.password, // required
      token, // required
  });
  if (err) {
    error.value = "Le lien de réinitialisation du mot de passe est invalide ou a expiré."
  } else {
    router.push("/auth/login");
    toast.add({
      title: "Success",
      description: "Votre mot de passe a été réinitialisé avec succès.",
      color: "success",
    });
    error.value = null;
  }
}

if (route.query.error === "INVALID_TOKEN") {
  toast.add({
    title: "error",
    description: "Le lien de réinitialisation du mot de passe est invalide ou a expiré.",
    color: "error",
  });
  tokentError.value = true;
  error.value = "Le lien de réinitialisation du mot de passe est invalide ou a expiré.";
}
</script>
