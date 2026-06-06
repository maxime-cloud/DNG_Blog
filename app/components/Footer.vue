<template>
  <footer class="bg-CustomColor-900 border-t border-[0.1px] border-dashcolor/50 border-dashed m-0 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]">
    <!-- Legacy Container (Content moved inside) -->
    <div class="border-x bg-CustomColor-900 sticky top-0 px-4 border-dashed max-w-7xl w-full border-dashcolor mx-auto">
      <div class="w-full max-w-7xl mx-auto p-4 md:py-8">
        <div class="sm:flex sm:items-center sm:justify-between">
          <NuxtLink to="/" class="flex items-center mb-4 sm:mb-0 space-x-3">
            <AppLogo />
          </NuxtLink>
          <ul class="flex flex-wrap items-center mb-6 text-sm font-medium text-[#F3F4F6]/70 sm:mb-0">
            <li>
              <NuxtLink to="/about" class="hover:underline me-4 md:me-6">À propos</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/privacy" class="hover:underline me-4 md:me-6">Politique de confidentialité</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/changelog" class="hover:underline me-4 md:me-6">Changelog</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="hover:underline">Contact</NuxtLink>
            </li>
          </ul>
        </div>
        <hr class="my-6 border-[0.1px] border-dashcolor/50 border-dashed sm:mx-auto lg:my-8" />
        <span class="block text-sm text-[#F3F4F6]/60 sm:text-center">
          © {{ new Date().getFullYear() }} DNGBlog™. Tous droits réservés.
        </span>
      </div>
    </div>
  </footer>
</template>
