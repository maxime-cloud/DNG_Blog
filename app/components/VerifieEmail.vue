<template>
  <div class="px-4 flex flex-col rounded-none ring-0 items-center justify-center w-full max-w-md  bg-CustomLight dark:bg-CustomColor-900 relative shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] dark:border-dashcolor/50 border-[0.1px] border-primary/30">
    <div
      class="bg-base-100 shadow-base-300/20 z-1 w-full space-y-6 rounded-xl p-6 shadow-md sm:max-w-md lg:p-8"
    >
      <div class="flex items-center gap-3">
        <AppLogo />
        <h2 class="text-base-content text-xl font-bold">DNG Blog</h2>
      </div>
      <div>
        <h3 class="text-base-content mb-1.5 text-2xl font-semibold">
          Verify your email
        </h3>
        <p class="text-base-content/80">
          An activation link has been sent to your email address:
          {{ props.email }}. Please check your inbox and click on the link to
          complete the activation process.
        </p>
      </div>
      <CUButton @click="emits('close')" label="Fermer" class="w-full justify-center" size="lg" logoPosition="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  email: {
    type: String,
    required: true,
  },
})
const emits = defineEmits(['close'])
</script>