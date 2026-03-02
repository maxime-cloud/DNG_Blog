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
        <h2 class="text-3xl font-bold mb-1 text-[#0F0F0F] dark:text-[#F3F4F6]">
          Se Connexion
        </h2>
        <p class="text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70 mb-8">
          Content de vous revoir
        </p>
      </div>

      <CUButton
        loading-auto
        @click="signInWithGithub"
        label="Continue with Github"
        logoName="i-simple-icons-github"
        logoPosition="left"
        size="lg"
        class="w-full mb-4"
      />

      <div class="flex items-center justify-between mb-4">
        <div class="grow border-t border-gray-300 dark:border-gray-700"></div>
        <p class="mx-4 text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70">— or —</p>
        <div class="grow border-t border-gray-300 dark:border-gray-700"></div>
      </div>
      
      <UAlert
          v-if="error"
          class="mb-4 flex flex-col rounded-none ring-0 items-center justify-center bg-CustomLight dark:bg-CustomColor-900 relative shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] text-red-400 dark:border-red-400/50 border-[0.1px] border-red-400/30"
          :description="error"
          color="neutral"
          variant="outline"
        />

      <UFormField label="Entrez votre Email" name="email" class="mb-6 flex flex-col gap-1 text-xs sm:text-sm">
        <!-- <label for="email" class="sr-only text-text">Entrez votre Email</label> -->
        <CUInput
          v-model="state.email"
          id="email"
          placeholder="Email"
          type="email"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField name="password" class="mb-6 flex flex-col gap-1 text-xs sm:text-sm relative">
        <div class="flex justify-between items-center mb-2">
          <label for="email" class="text-text font-semibold">Entrez votre mot de passe</label>
          <NuxtLink
            to="/auth/reset-password"
            class="text-text hover:underline text-sm text-end"
            >Mot de passe oublié?</NuxtLink
          >
        </div>
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
        :loading="loading"
        type="submit"
        label="Connexion"
        logoName="i-lucide-arrow-right"
        logoPosition="right"
        size="lg"
        class="w-full mb-4 justify-center"
      />

      <p class="text-center text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70 text-sm">
        Pas de compte?
        <NuxtLink
          to="/auth/register"
          class="text-text hover:underline underline underline-offset-4"
          >Créer un compte</NuxtLink
        >
      </p>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from '@nuxt/ui'
import { authClient } from "@/lib/auth-client";

const showPassword = ref(false);
const error: Ref<string | null> = ref(null);
const route = useRoute();
const loading = ref(false);
const schema = z.object({
  email: z.email("Email invalide"),
  password: z
    .string("Mot de passe requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined,
});

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  error.value = null;
  const { data, error: err } = await authClient.signIn.email({
      email: event.data.email,
      password: event.data.password,
      // image, // User image URL (optional)
      callbackURL: route.path === "/auth/register" ? "/" : route.path,
      rememberMe: true
  }, {
      onRequest: (ctx) => {
        loading.value = true;
      },
      onSuccess: (ctx) => {
        loading.value = false;
        toast.add({
          title: "Success",
          description: "The form has been submitted.",
          color: "success",
        });
      },
      onError: (ctx) => {
        loading.value = false;
        if (ctx.error.code === "INVALID_EMAIL_OR_PASSWORD") {
          error.value = "Email ou mot de passe incorrect."
        } else if (ctx.error.code === "USER_NOT_FOUND") {
          error.value = "Utilisateur introuvable"
        } else if (ctx.error.code === "INVALID_PASSWORD") {
          error.value = "Mot de passe invalide"
        } else if (ctx.error.code === "CREDENTIAL_ACCOUNT_NOT_FOUND") {
          error.value = "Compte d'identification introuvable"
        } else if (ctx.error.code === "EMAIL_NOT_VERIFIED") {
          error.value = "Ton email n'est pas encore vérifié. Consulte ta boîte mail."
        }
        else {
          error.value = ctx.error.message;
        }
        toast.add({
          title: "Error",
          description: error.value,
          color: "error",
        });
      },
  });
}

if (route.query.errorprovider === "github") {
  error.value = "Une erreur s'est produite lors de la connexion avec GitHub. Veuillez réessayer.";
}

async function signInWithGithub() {
  error.value = null;
  await authClient.signIn.social({
      provider: "github",
      /**
       * A URL to redirect after the user authenticates with the provider
       * @default "/"
       */
      callbackURL: route.path === "/auth/register" ? "/" : route.path,
      /**
       * A URL to redirect if an error occurs during the sign in process
       */
      errorCallbackURL: "/auth/login/?errorprovider=github",
      /**
       * A URL to redirect if the user is newly registered
       */
      newUserCallbackURL: route.path === "/auth/register" ? "/" : route.path,
      /**
       * disable the automatic redirect to the provider. 
       * @default false
       */
      // disableRedirect: true,
  });
}
</script>
