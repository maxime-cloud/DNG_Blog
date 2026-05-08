<template>
    <NoAdminPage>
      <BaseLayaoutContent :home="true">
        <div class="content flex flex-col min-h-[85vh] relative">
          <div class="flex-1 relative bgHero flex flex-col">
            <div class="flex-1 min-h-[80vh] max-h-[80vh] flex flex-col justify-center items-center relative bgPoint">
              <div class="flex flex-col justify-center items-center gap-4 z-10 ">
                <h1 class="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-center">Tutoriels techniques en <span class="dark:bg-[#DEDEDE] bg-[#0F0F0F] opacity-85 text-[#DEDEDE] dark:text-[#414141] px-1">Développement Web</span>, <br class="block sm:hidden md:block"/> <span class="dark:bg-[#DEDEDE] bg-[#0F0F0F] opacity-85 text-[#DEDEDE] dark:text-[#414141] px-1">Réseau et Linux</span></h1>
                <p class="text-sm sm:text-[16px] lg:text-lg text-center dark:text-[#F3F4F6]/70 text-[#0F0F0F]/70">Tutoriels pratiques et solutions concrètes pour développeurs et sysadmins.</p>
                <!-- <p class="text-sm sm:text-[16px] lg:text-lg text-center dark:text-[#F3F4F6]/80 text-[#0F0F0F]/80">Même si vous ne travaillez pas dans la tech, vous trouvez des articles pour vous aider</p> -->
                <div class="flex-1 flex gap-4">
                  <NuxtLink to="#recent">
                    <CUButton class="hidden md:flex" label="Articles récents" size="xl" />
                    <CUButton class="md:hidden" label="Articles récents" size="md" />
                  </NuxtLink>
                  <NuxtLink to="/articles">
                    <CUButton class="hidden md:flex" label="Parcourir les articles" size="xl" logoPosition="right" logoName="i-lucide-arrow-right" />
                    <CUButton class="md:hidden" label="Parcourir les articles" size="lg" logoPosition="right" logoName="i-lucide-arrow-right" />
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseLayaoutContent>
      <BaseLayaoutContent>
        <div class="content flex flex-col pt-20 mb-10 px-4 relative">
          <SectionTitle label="Articles Populaires" to="popular">
            <CUButton class="" label="Voir plus" size="md" logoPosition="right" logoName="i-lucide-arrow-right" />
          </SectionTitle>
        </div>
        <div class="contentCarousel w-full px-8">
          <ArticleScroller />
        </div>
        
        
        <div class="content flex flex-col pt-20 mb-10 px-4 relative">
          <SectionTitle label="Categories" to="categorie">
            <CUButton class="" label="Voir plus" size="md" logoPosition="right" logoName="i-lucide-arrow-right" />
          </SectionTitle>
        </div>
        <div class="contentCarousel p-8 flex flex-col gap-4 relative bgCategorie">
          <CategorieScrollers direction="left" />
          <CategorieScrollers direction="right" />
        </div>
        
        
        <div class="content flex flex-col pt-20 mb-10 px-4 relative">
          <SectionTitle label="Articles recent" to="recent">
            <CUButton class="" label="Voir plus" size="md" logoPosition="right" logoName="i-lucide-arrow-right" />
          </SectionTitle>
        </div>
        <div class="contentCarousel w-full mb-20 px-8">
          <ArticleScroller />
        </div>
        
        
        
      </BaseLayaoutContent>
    </NoAdminPage>
</template>

<script setup lang="ts">

</script> 