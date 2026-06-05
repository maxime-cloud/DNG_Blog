<template>
  <div
    class="bg-CustomColor-900 flex flex-col border-dashcolor/50 border-[0.1px] shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]"
  >
    <!-- Cover image -->
    <USkeleton class="h-48 w-full rounded-none" />

    <div class="flex-1 p-5 flex flex-col gap-3">
      <!-- Category + date -->
      <div class="flex items-center justify-between gap-2">
        <USkeleton class="h-3 w-20 rounded-none" />
        <USkeleton class="h-3 w-16 rounded-none" />
      </div>

      <!-- Title lines -->
      <div class="space-y-2">
        <USkeleton class="h-4 w-4/5 rounded-none" />
        <USkeleton class="h-4 w-3/5 rounded-none" />
      </div>

      <!-- Excerpt lines -->
      <div class="space-y-1.5 flex-1">
        <USkeleton class="h-3 w-full rounded-none" />
        <USkeleton class="h-3 w-3/4 rounded-none" />
      </div>

      <!-- Footer: author + stats -->
      <div
        class="flex items-center justify-between pt-2 border-t border-dashed border-dashcolor/30"
      >
        <div class="flex items-center gap-2">
          <USkeleton class="w-6 h-6 rounded-full" />
          <USkeleton class="h-3 w-24 rounded-none" />
        </div>
        <USkeleton class="h-3 w-12 rounded-none" />
      </div>
    </div>
  </div>
</template>
