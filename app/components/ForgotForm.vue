<template>
  <UForm
    v-if="!emailSent"
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
        <h2 class="text-3xl font-bold mb-1 text-[#F3F4F6]">
          Mot de passe oublié
        </h2>
        <p class="text-[#F3F4F6]/70 mb-8">
          Réinitialisez votre mot de passe
        </p>
      </div>

      <UAlert
        v-if="error"
        class="mb-4 flex flex-col rounded-none ring-0 items-center justify-center bg-CustomColor-900 relative shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] text-red-400 border-red-400/50 border-[0.1px] border-red-400/30"
        :description="error"
        color="neutral"
        variant="outline"
      />

      <UFormField
        label="Entrez votre Email"
        name="email"
        class="mb-6 flex flex-col gap-1 text-xs sm:text-sm"
      >
        <CUInput
          id="email"
          v-model="state.email"
          placeholder="Email"
          type="email"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <CUButton
        loading-auto
        type="submit"
        label="Envoyer"
        size="lg"
        class="w-full mb-4 justify-center"
      />
    </div>
  </UForm>

  <div
    v-else
    class="p-8 flex flex-col rounded-none ring-0 items-center justify-center w-full max-w-md bg-CustomColor-900 relative shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] border-dashcolor/50 border-[0.1px]"
  >
    <div
      class="bg-base-100 shadow-base-300/20 z-1 w-full space-y-6 rounded-xl shadow-md sm:max-w-md"
    >
      <div class="flex items-center gap-3">
        <AppLogo />
        <h2 class="text-base-content text-xl font-bold">
          DNG Blog
        </h2>
      </div>
      <div>
        <h3 class="text-base-content mb-1.5 text-2xl font-semibold">
          Réinitialisation de votre mot de passe
        </h3>
        <p class="text-base-content/80">
          Un email de réinitialisation a été envoyé à votre adresse email :
          {{ state.email }}. <br>
          Veuillez vérifier votre boîte mail et cliquer sur le lien pour réinitialiser votre mot de
          passe. <br>
          <span class="font-semibold">Si vous n'avez pas reçu l'email, vérifiez votre dossier de spam.</span>
        </p>
      </div>
      <CUButton
        v-if="route.path !== '/auth/forgot-password'"
        label="Fermer"
        class="w-full justify-center"
        size="lg"
        logo-position="right"
        @click="emits('close')"
      />
      <CUButton
        v-if="route.path === '/auth/forgot-password'"
        label="Retour à l'accueil"
        class="w-full justify-center"
        size="lg"
        logo-position="right"
        @click="router.push('/')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { authClient } from '@/lib/auth-client'

import { toast } from 'vue-sonner'

const emailSent = ref(false)
const error: Ref<string | null | undefined> = ref(null)
const route = useRoute()
const router = useRouter()
const schema = z.object({
  email: z.email('Email invalide')
})

const emits = defineEmits(['close'])

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  error.value = null
  const { error: err } = await authClient.requestPasswordReset({
    email: event.data.email,
    redirectTo: '/auth/reset-password'
  })
  if (err) {
    error.value = err.message
  } else {
    emailSent.value = true
    toast.success('Email de réinitialisation envoyé — vérifiez votre boîte mail.')
    error.value = null
  }
}
</script>
