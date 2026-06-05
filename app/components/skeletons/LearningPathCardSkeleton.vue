<template>
  <div
    class="bg-CustomColor-900 border-[0.1px] border-dashed border-dashcolor/50"
  >
    <USkeleton class="h-36 w-full rounded-none" />
    <div class="p-4 space-y-3">
      <USkeleton class="h-4 w-16 rounded-none" />
      <USkeleton class="h-5 w-4/5 rounded-none" />
      <USkeleton class="h-3 w-full rounded-none" />
      <USkeleton class="h-3 w-3/4 rounded-none" />
      <!-- Progress bar -->
      <div class="pt-1">
        <USkeleton class="h-1.5 w-full rounded-none" />
      </div>
    </div>
  </div>
</template>
