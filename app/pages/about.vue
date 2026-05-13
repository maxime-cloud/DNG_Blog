<script setup lang="ts">
useSeoMeta({ title: 'À propos', description: 'En savoir plus sur ce blog technique.' })
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="py-10 px-4 max-w-3xl mx-auto">
        <!-- Author section -->
        <section class="flex flex-col sm:flex-row gap-8 mb-16">
          <img
            src="/user-avatar.png"
            alt="Avatar"
            class="w-32 h-32 object-cover border-[0.1px] border-dashed border-primary/30"
          >
          <div>
            <h1 class="text-3xl font-bold mb-2">
              À propos
            </h1>
            <p class="text-zinc-500 mb-4">
              Blog technique sur le développement web, les réseaux et Linux.
            </p>
            <div class="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                class="text-sm hover:text-primary flex items-center gap-1"
              >
                <UIcon
                  name="i-simple-icons-github"
                  class="w-4 h-4"
                /> GitHub
              </a>
            </div>
          </div>
        </section>

        <!-- Blog philosophy -->
        <section class="mb-12">
          <h2 class="text-2xl font-bold mb-4">
            Ce blog
          </h2>
          <p class="text-zinc-500 leading-relaxed">
            Un blog technique axé sur des tutoriels pratiques et des solutions concrètes pour les
            développeurs et sysadmins. Chaque article est testé et vérifié avant publication.
          </p>
        </section>

        <!-- Technologies -->
        <section>
          <h2 class="text-2xl font-bold mb-4">
            Technologies couvertes
          </h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tech in [
                'Vue.js',
                'Nuxt',
                'TypeScript',
                'Node.js',
                'PostgreSQL',
                'Docker',
                'Linux',
                'Nginx',
                'Git'
              ]"
              :key="tech"
              class="px-3 py-1 text-sm border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50"
            >
              {{ tech }}
            </span>
          </div>
        </section>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
