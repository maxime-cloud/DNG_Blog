<template>
  <div class="min-h-screen bg-CustomLight dark:bg-CustomColor-900">
    <!-- Docs header -->
    <header
      class="sticky top-0 z-30 h-14 flex items-center px-4 lg:px-8 gap-4 border-b border-[0.1px] border-dashed border-dashcolor/50 bg-CustomLight dark:bg-CustomColor-900"
    >
      <NuxtLink
        to="/"
        class="shrink-0"
      >
        <AppLogo />
      </NuxtLink>

      <span
        class="text-xs uppercase tracking-widest text-zinc-500 hidden sm:block"
      >
        Documentation
      </span>

      <div class="flex-1" />

      <!-- Search -->
      <div class="relative w-full max-w-xs">
        <UIcon
          name="i-lucide-search"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F0F0F]/40 dark:text-[#F3F4F6]/40 pointer-events-none"
        />
        <input
          v-model="search"
          type="text"
          placeholder="Rechercher..."
          class="w-full pl-9 pr-3 py-1.5 text-sm bg-CustomLight dark:bg-CustomColor-900 border border-[0.1px] border-dashed border-dashcolor/50 rounded-none text-[#0F0F0F] dark:text-white placeholder-[#0F0F0F]/40 dark:placeholder-[#F3F4F6]/60 outline-none focus:border-primary/50 transition-colors"
        >
      </div>
    </header>

    <!-- Body -->
    <div class="flex">
      <!-- Left sidebar -->
      <DocsSidebar class="hidden lg:flex" />

      <!-- Center content -->
      <main class="flex-1 min-w-0 px-4 lg:px-12 py-10 max-w-3xl mx-auto">
        <slot />

        <!-- Prev / Next navigation -->
        <div
          class="mt-16 pt-8 border-t border-[0.1px] border-dashed border-dashcolor/50 flex items-center justify-between gap-4"
        >
          <!-- Prev -->
          <NuxtLink
            v-if="prevPage"
            :to="prevPage.to"
            class="flex items-center gap-2 text-sm text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70 hover:text-[#0F0F0F] dark:hover:text-white transition-colors"
          >
            <UIcon
              name="i-lucide-arrow-left"
              class="w-4 h-4 shrink-0"
            />
            <span>{{ prevPage.label }}</span>
          </NuxtLink>
          <span v-else />

          <!-- Next -->
          <NuxtLink
            v-if="nextPage"
            :to="nextPage.to"
            class="flex items-center gap-2 text-sm text-[#0F0F0F]/70 dark:text-[#F3F4F6]/70 hover:text-[#0F0F0F] dark:hover:text-white transition-colors"
          >
            <span>{{ nextPage.label }}</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="w-4 h-4 shrink-0"
            />
          </NuxtLink>
          <span v-else />
        </div>
      </main>

      <!-- Right TOC -->
      <aside class="hidden xl:block w-56 shrink-0 py-10 pr-4">
        <div class="sticky top-24">
          <p class="text-xs uppercase tracking-widest text-zinc-500 mb-4 px-3">
            Sur cette page
          </p>
          <nav class="space-y-1">
            <a
              v-for="heading in toc"
              :key="heading.id"
              :href="`#${heading.id}`"
              class="block px-3 py-1 text-sm text-[#0F0F0F]/60 dark:text-[#F3F4F6]/60 hover:text-[#0F0F0F] dark:hover:text-white transition-colors rounded-none"
              :class="{ 'pl-5 text-xs': heading.depth === 3 }"
            >
              {{ heading.text }}
            </a>
          </nav>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
const search = ref('')

// Placeholder prev/next — pages will override via provide or definePageMeta
const prevPage = inject('docs:prevPage', null)
const nextPage = inject('docs:nextPage', null)

// Placeholder TOC — pages populate via provide('docs:toc', [...])
const toc = inject('docs:toc', [])
</script>
