<template>
  <NoAdminPage>
    <BaseLayaoutContent :home="true">
      <div
        ref="heroContainer"
        class="content flex flex-col min-h-[85vh] relative"
      >
        <div class="flex-1 relative bgHero flex flex-col">
          <div
            class="flex-1 min-h-[80vh] max-h-[80vh] flex flex-col justify-center items-center relative bgPoint hero-bg"
          >
            <div class="flex flex-col justify-center items-center gap-4 z-10">
              <h1
                class="hero-title text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-center"
              >
                Tutoriels techniques en
                <span
                  class="hero-highlight dark:bg-[#DEDEDE] bg-[#0F0F0F] opacity-85 text-[#DEDEDE] dark:text-[#414141] px-1"
                >Développement Web</span>, <br class="block sm:hidden md:block">
                <span
                  class="hero-highlight dark:bg-[#DEDEDE] bg-[#0F0F0F] opacity-85 text-[#DEDEDE] dark:text-[#414141] px-1"
                >Réseau et Linux</span>
              </h1>
              <p
                class="hero-subtitle text-sm sm:text-[16px] lg:text-lg text-center dark:text-[#F3F4F6]/70 text-[#0F0F0F]/70"
              >
                Tutoriels pratiques et solutions concrètes pour développeurs et sysadmins.
              </p>
              <div class="flex-1 flex gap-4">
                <NuxtLink
                  to="#recent"
                  class="hero-cta"
                >
                  <CUButton
                    class="hidden md:flex"
                    label="Articles récents"
                    size="xl"
                  />
                  <CUButton
                    class="md:hidden"
                    label="Articles récents"
                    size="md"
                  />
                </NuxtLink>
                <NuxtLink
                  to="/articles"
                  class="hero-cta"
                >
                  <CUButton
                    class="hidden md:flex"
                    label="Parcourir les articles"
                    size="xl"
                    logo-position="right"
                    logo-name="i-lucide-arrow-right"
                  />
                  <CUButton
                    class="md:hidden"
                    label="Parcourir les articles"
                    size="lg"
                    logo-position="right"
                    logo-name="i-lucide-arrow-right"
                  />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayaoutContent>
    <BaseLayaoutContent>
      <div class="content flex flex-col pt-20 mb-10 px-4 relative">
        <SectionTitle
          label="Articles Populaires"
          to="popular"
        >
          <CUButton
            label="Voir plus"
            size="md"
            logo-position="right"
            logo-name="i-lucide-arrow-right"
          />
        </SectionTitle>
      </div>
      <div class="contentCarousel w-full px-8">
        <ArticleScroller
          sort="popular"
          :limit="6"
        />
      </div>

      <div class="content flex flex-col pt-20 mb-10 px-4 relative">
        <SectionTitle
          label="Catégories"
          to="categorie"
        >
          <CUButton
            label="Voir plus"
            size="md"
            logo-position="right"
            logo-name="i-lucide-arrow-right"
          />
        </SectionTitle>
      </div>
      <div class="contentCarousel p-8 flex flex-col gap-4 relative bgCategorie">
        <CategorieScrollers direction="left" />
        <CategorieScrollers direction="right" />
      </div>

      <div class="content flex flex-col pt-20 mb-10 px-4 relative">
        <SectionTitle
          label="Articles récents"
          to="recent"
        >
          <CUButton
            label="Voir plus"
            size="md"
            logo-position="right"
            logo-name="i-lucide-arrow-right"
          />
        </SectionTitle>
      </div>
      <div class="contentCarousel w-full mb-20 px-8">
        <ArticleScroller
          sort="latest"
          :limit="6"
        />
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'

const heroContainer = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  if (!heroContainer.value) return

  ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.hero-bg', { opacity: 0, duration: 0.8, ease: 'power2.out' })
      .from('.hero-title', { y: 40, opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.hero-highlight', { opacity: 0, duration: 0.4 }, '-=0.2')
      .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
      .from(
        '.hero-cta',
        { scale: 0.85, opacity: 0, duration: 0.4, stagger: 0.15, ease: 'back.out(1.7)' },
        '-=0.2'
      )
  }, heroContainer.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>
