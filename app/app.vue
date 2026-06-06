<script setup lang="ts">
import { provide } from 'vue'
import { useAuthStore } from '@/stores/auth'

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'fr'
  }
})

const title = 'Nuxt Starter Template'
const description
  = 'A production-ready starter template powered by Nuxt UI. Build beautiful, accessible, and performant applications in minutes, not hours.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})

const store = useAuthStore()

// SSR session is set by auth.global.ts (with cookies). Running fetchSession() on SSR
// makes a cookieless call → null → Pinia mismatch → middleware re-fires → redirect.
if (import.meta.client) {
  store.fetchSession()
}

const active = ref(300)
provide('activeNav', active)

async function pageEnter(el: Element, done: () => void) {
  if (!import.meta.client) {
    done()
    return
  }
  const { gsap } = await import('gsap')
  gsap.fromTo(
    el,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', onComplete: done }
  )
}

async function pageLeave(el: Element, done: () => void) {
  if (!import.meta.client) {
    done()
    return
  }
  const { gsap } = await import('gsap')
  gsap.to(el, { opacity: 0, y: -10, duration: 0.25, ease: 'power2.in', onComplete: done })
}
</script>

<template>
  <UApp>
    <ConfirmDialog />
    <!-- {{ store.user }} -->
    <NuxtLayout>
      <NuxtPage :transition="{ css: false, onEnter: pageEnter, onLeave: pageLeave }" />
    </NuxtLayout>
  </UApp>
</template>
