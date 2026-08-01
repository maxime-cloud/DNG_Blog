<template>
  <NoAdminPage>
    <BaseLayaoutContent :home="true">
      <div
        ref="heroContainer"
        class="content flex flex-col min-h-[85vh] relative"
      >
        <div class="flex-1 relative bgHero flex flex-col">
          <div
            class="flex-1 min-h-[80vh] max-h-[80vh] flex flex-col sm:justify-center items-center relative bgPoint hero-bg"
          >
            <div class="hidden sm:flex flex-col justify-center items-center gap-4 z-10">
              <h1
                class="hero-title text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-center"
              >
                La tech
                <!-- Tutoriels techniques en -->
                <span
                  class="hero-highlight bg-[#DEDEDE] bg-[#0F0F0F] opacity-85 text-[#414141] px-1"
                >sans prise de tête pour les pros</span> <br class="block">
                <span
                  class="hero-highlight bg-[#DEDEDE] bg-[#0F0F0F] opacity-85 text-[#414141] px-1"
                >du digital</span>
              </h1>
              <p
                class="hero-subtitle text-sm sm:text-[16px] lg:text-lg text-center text-[#F3F4F6]/70"
              >
                Des configurations pas-à-pas et des résolutions de bugs concrètes pour vous simplifier la vie
              </p>
              <div class="flex-1 flex gap-4">
                <NuxtLink
                  to="#recent"
                  class="hero-cta"
                >
                  <CUButton
                    class="hidden sm:flex"
                    label="Articles récents"
                    size="xl"
                  />
                </NuxtLink>
                <NuxtLink
                  to="/articles"
                  class="hero-cta"
                >
                  <CUButton
                    class="hidden sm:flex"
                    label="Parcourir les articles"
                    size="xl"
                    logo-position="right"
                    logo-name="i-lucide-arrow-right"
                  />
                </NuxtLink>
              </div>
            </div>
            <div class="sm:hidden flex flex-col gap-4 z-10 px-4 pt-10">
              <h1
                class="hero-title text-[40px] font-bold"
              >
                La tech <br> sans prise de tête pour
                <!-- Tutoriels techniques en -->
                <br>
                <span
                  class="hero-highlight bg-[#DEDEDE] bg-[#0F0F0F] opacity-85 text-[#414141] px-1"
                >les pros du digital</span>
              </h1>
              <p
                class="hero-subtitle text-[16px] text-[#F3F4F6]/70"
              >
                Des configurations pas-à-pas <br> et des résolutions de bugs concrètes <br> pour vous simplifier la vie
              </p>
              <div class="flex-1 flex gap-4">
                <NuxtLink
                  to="#recent"
                  class="hero-cta"
                >
                  <CUButton
                    class="md:hidden"
                    label="Articles récents"
                    size="lg"
                  />
                </NuxtLink>
                <NuxtLink
                  to="/articles"
                  class="hero-cta"
                >
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
            @click="() => router.push('/articles')"
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
            @click="() => router.push('/categories')"
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
            @click="() => router.push('/articles')"
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

useSeoMeta({
  title: 'StackTrace — La tech sans prise de tête pour les pros du digital',
  description: "Le média tech pratique pour les professionnels du digital. Découvrez nos tutoriels d'installation, guides de configuration et résolutions de bugs.",
  ogTitle: 'StackTrace — La tech sans prise de tête pour les pros du digital 🚀',
  ogDescription: 'Démos, tutoriels et résolutions de bugs pour vous simplifier la vie.',
  ogImage: '/OG.png'
})

const heroContainer = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

const router = useRouter()
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
