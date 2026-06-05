<template>
  <UForm
    v-if="!AcountCreated"
    :schema="schema"
    :state="state"
    class="flex flex-col items-center justify-center w-full max-w-md p-8 bg-CustomColor-900 relative shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] border-dashcolor/50 border-[0.1px]"
    @submit="onSubmit"
  >
    <div class="w-full">
      <div class="mb-6">
        <div class="flex items-center justify-center mb-4 gap-4">
          <AppLogo />
          <h1 class="text-xl lg:text-2xl font-semibold">
            DNG Blog
          </h1>
        </div>
        <h2 class="text-3xl font-bold mb-8 text-[#F3F4F6]">
          Créer un compte
        </h2>
      </div>

      <CUButton
        loading-auto
        label="Continuer avec Github"
        logo-name="i-simple-icons-github"
        logo-position="left"
        size="lg"
        class="w-full mb-4"
        @click="signInWithGithub"
      />

      <div class="flex items-center justify-between mb-4">
        <div class="grow border-t border-gray-700" />
        <p class="mx-4 text-[#F3F4F6]/70">
          — or —
        </p>
        <div class="grow border-t border-gray-700" />
      </div>

      <UAlert
        v-if="error"
        class="mb-4 flex flex-col rounded-none ring-0 items-center justify-center bg-CustomColor-900 relative shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] text-red-400 border-red-400/50 border-[0.1px] border-red-400/30"
        :description="error"
        color="neutral"
        variant="outline"
      />

      <UFormField
        label="Entrez votre nom d'utilisateur"
        name="username"
        class="mb-6 flex flex-col gap-1 text-xs sm:text-sm"
      >
        <CUInput
          id="username"
          v-model="state.username"
          placeholder="Nom d'utilisateur"
          type="text"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Entrez votre Email"
        name="email"
        class="mb-6 flex flex-col gap-1 text-xs sm:text-sm"
      >
        <!-- <label for="email" class="sr-only text-text">Entrez votre Email</label> -->
        <CUInput
          id="email"
          v-model="state.email"
          placeholder="Email"
          type="email"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Entrez votre mot de passe"
        name="password"
        class="mb-6 flex flex-col gap-1 text-xs sm:text-sm relative"
      >
        <div class="flex">
          <CUInput
            id="password"
            v-model="state.password"
            placeholder="Mot de passe"
            :type="showPassword ? 'text' : 'password'"
            size="lg"
            class="w-full"
          />
          <CUButton
            :logo-name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            logo-position="right"
            size="lg"
            class=""
            @click.prevent="showPassword = !showPassword"
          />
        </div>
      </UFormField>

      <CUButton
        :loading="loading"
        type="submit"
        label="S'inscrire"
        logo-name="i-lucide-arrow-right"
        logo-position="right"
        size="lg"
        class="w-full mb-4 justify-center"
      />

      <p class="text-center text-[#F3F4F6]/70 text-sm">
        J'ai déjà un compte
        <NuxtLink
          to="/auth/login"
          class="text-text hover:underline underline underline-offset-4"
        >Se connecter</NuxtLink>
      </p>
    </div>
  </UForm>
  <VerifieEmail
    v-else
    :email="state.email"
    @close="
      () => {
        emits('closeSignup')
      }
    "
  />
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { authClient } from '@/lib/auth-client'

import { toast } from 'vue-sonner'

const AcountCreated = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const error: Ref<string | null> = ref(null)
const route = useRoute()
const schema = z.object({
  username: z
    .string('Nom d\'utilisateur requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(20, 'Le nom doit contenir au plus 20 caractères'),
  email: z.email('Email invalide'),
  password: z
    .string('Mot de passe requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  username: undefined,
  email: undefined,
  password: undefined
})
if (route.query.errorprovider === 'github') {
  error.value = 'Une erreur s\'est produite lors de la connexion avec GitHub. Veuillez réessayer.'
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  error.value = null
  await authClient.signUp.email(
    {
      email: event.data.email,
      password: event.data.password,
      name: event.data.username,
      callbackURL: route.path === '/auth/register' ? '/' : route.path
    },
    {
      onRequest: () => {
        loading.value = true
      },
      onSuccess: () => {
        AcountCreated.value = true
        loading.value = false
        toast.success('Compte créé ! Vérifiez votre boîte mail pour valider votre compte.')
      },
      onError: (ctx) => {
        loading.value = false
        if (ctx.error.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
          error.value = 'Cet utilisateur existe déjà. Veuillez utiliser une autre adresse e-mail.'
        } else {
          error.value = ctx.error.message
        }
        toast.error(error.value ?? 'Une erreur est survenue')
      }
    }
  )
}

async function signInWithGithub() {
  error.value = null
  await authClient.signIn.social({
    provider: 'github',
    /**
     * A URL to redirect after the user authenticates with the provider
     * @default "/"
     */
    callbackURL: route.path === '/auth/register' ? '/' : route.path,
    /**
     * A URL to redirect if an error occurs during the sign in process
     */
    errorCallbackURL: '/auth/register/?errorprovider=github',
    /**
     * A URL to redirect if the user is newly registered
     */
    newUserCallbackURL: route.path === '/auth/register' ? '/' : route.path
    /**
     * disable the automatic redirect to the provider.
     * @default false
     */
    // disableRedirect: true,
  })
}

const emits = defineEmits(['closeSignup'])
</script>
