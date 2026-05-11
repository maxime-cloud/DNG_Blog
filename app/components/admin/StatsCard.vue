<script setup>
defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  trend: Number,
  color: { type: String, default: "primary" },
});
</script>

<template>
  <div
    class="bg-CustomLight dark:bg-CustomColor-900 border-[0.1px] border-dashed border-primary/30 dark:border-dashcolor/50 p-6 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none"
  >
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-zinc-500">{{ label }}</p>
        <p class="text-3xl font-bold mt-1 text-[#0F0F0F] dark:text-white">
          {{ value }}
        </p>
        <p
          v-if="trend !== undefined"
          :class="trend >= 0 ? 'text-green-500' : 'text-red-400'"
          class="text-sm mt-1"
        >
          {{ trend >= 0 ? "↑" : "↓" }} {{ Math.abs(trend) }}%
        </p>
      </div>
      <UIcon :name="icon" class="w-8 h-8 text-primary opacity-60" />
    </div>
  </div>
</template>
