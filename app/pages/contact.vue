<script setup lang="ts">
useSeoMeta({ title: 'Contact', description: 'Contactez-nous pour toute question.' })
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="py-10 px-4 max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Contact</h1>
        <p class="text-[#F3F4F6]/70 mb-8 leading-relaxed">
          Pour toute demande, suggestion ou partenariat, vous pouvez nous contacter via l'email suivant :
        </p>
        <a href="mailto:contact@dngblog.com" class="text-primary font-semibold hover:underline text-lg">
          contact@dngblog.com
        </a>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
