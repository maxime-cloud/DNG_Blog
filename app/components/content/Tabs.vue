<template>
  <div class="my-6">
    <!-- Tab nav -->
    <div
      class="flex border-b border-[0.1px] border-dashed border-CustomColor-900/60 dark:border-dashcolor"
    >
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-none border-b-2 -mb-px"
        :class="
          activeTab === index
            ? 'border-primary text-primary'
            : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
        "
        @click="activeTab = index"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Tab content -->
    <div
      class="pt-4 bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-t-0 border-CustomColor-900/60 dark:border-dashcolor p-4"
    >
      <slot :name="`tab-${activeTab}`">
        <slot />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabs?: string[]
}>()

const activeTab = ref(0)
</script>
