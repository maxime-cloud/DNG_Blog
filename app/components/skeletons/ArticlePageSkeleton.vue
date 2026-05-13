<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-6">
      <USkeleton class="h-3 w-16 rounded-none" />
      <USkeleton class="h-3 w-4 rounded-none" />
      <USkeleton class="h-3 w-24 rounded-none" />
    </div>

    <!-- Category badges -->
    <div class="flex gap-2 mb-4">
      <USkeleton class="h-5 w-20 rounded-none" />
      <USkeleton class="h-5 w-16 rounded-none" />
    </div>

    <!-- Title -->
    <USkeleton class="h-10 w-3/4 rounded-none mb-3" />
    <USkeleton class="h-10 w-1/2 rounded-none mb-4" />

    <!-- Meta -->
    <div class="flex items-center gap-4 mb-6">
      <USkeleton class="w-8 h-8 rounded-full" />
      <USkeleton class="h-3 w-28 rounded-none" />
      <USkeleton class="h-3 w-20 rounded-none" />
    </div>

    <!-- Cover image -->
    <USkeleton class="w-full h-64 sm:h-80 rounded-none mb-8" />

    <!-- Two-column layout -->
    <div class="flex gap-8">
      <!-- Main content -->
      <div class="flex-1 space-y-3">
        <USkeleton
          v-for="(w, i) in [
            'full',
            '5/6',
            'full',
            '3/4',
            'full',
            '4/5',
            'full',
            '2/3',
            'full',
            '4/5'
          ]"
          :key="i"
          :class="`h-4 w-${w} rounded-none`"
        />
      </div>

      <!-- TOC sidebar -->
      <div class="hidden lg:block w-56 space-y-2 shrink-0">
        <USkeleton class="h-4 w-4/5 rounded-none" />
        <USkeleton class="h-3 w-3/5 rounded-none" />
        <USkeleton class="h-3 w-4/6 rounded-none" />
        <USkeleton class="h-3 w-1/2 rounded-none" />
        <USkeleton class="h-3 w-3/5 rounded-none" />
      </div>
    </div>
  </div>
</template>
