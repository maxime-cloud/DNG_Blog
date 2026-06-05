<template>
  <div>
    <!-- Mobile: collapsible -->
    <div class="lg:hidden">
      <button
        class="w-full flex items-center justify-between px-4 py-3 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none transition-colors"
        @click="mobileOpen = !mobileOpen"
      >
        <span
          class="text-xs font-semibold uppercase tracking-widest text-zinc-500"
        >
          Table des matières
        </span>
        <UIcon
          :name="mobileOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="w-4 h-4 text-zinc-500 transition-transform duration-200"
        />
      </button>
      <nav
        v-show="mobileOpen"
        class="bg-CustomColor-900 border-[0.1px] border-t-0 border-dashed border-dashcolor/50 shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4"
        aria-label="Table des matières"
      >
        <ul class="text-sm space-y-1">
          <li
            v-for="heading in headings"
            :key="heading.id"
            :class="heading.depth === 3 ? 'pl-4' : ''"
          >
            <a
              :href="`#${heading.id}`"
              class="block py-0.5 transition-colors duration-200 truncate"
              :class="
                activeId === heading.id
                  ? 'text-primary font-semibold'
                  : 'text-[#F3F4F6]/70 hover:text-[#F3F4F6]'
              "
              @click.prevent="
                scrollTo(heading.id);
                mobileOpen = false;
              "
            >
              {{ heading.text }}
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Desktop: sticky sidebar -->
    <nav
      class="hidden lg:block sticky top-20 bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none p-4"
      aria-label="Table des matières"
    >
      <p
        class="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3"
      >
        Sur cette page
      </p>
      <ul class="text-sm space-y-1">
        <li
          v-for="heading in headings"
          :key="heading.id"
          :class="heading.depth === 3 ? 'pl-4' : ''"
        >
          <a
            :href="`#${heading.id}`"
            class="block py-0.5 transition-colors duration-200 truncate"
            :class="
              activeId === heading.id
                ? 'text-primary font-semibold'
                : 'text-[#F3F4F6]/70 hover:text-[#F3F4F6]'
            "
            @click.prevent="scrollTo(heading.id)"
          >
            {{ heading.text }}
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
interface Heading {
  id: string
  text: string
  depth: 2 | 3
}

const props = defineProps<{
  headings: Heading[]
}>()

const activeId = ref<string>('')
const mobileOpen = ref(false)

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  if (!props.headings.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
          break
        }
      }
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
  )

  props.headings.forEach((h) => {
    const el = document.getElementById(h.id)
    if (el) observer.observe(el)
  })

  onBeforeUnmount(() => observer.disconnect())
})
</script>
