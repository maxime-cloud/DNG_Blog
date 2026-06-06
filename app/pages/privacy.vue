<script setup lang="ts">
useSeoMeta({ title: 'Politique de confidentialité', description: 'Politique de confidentialité du blog.' })
</script>

<template>
  <NoAdminPage>
    <BaseLayaoutContent>
      <div class="py-10 px-4 max-w-3xl mx-auto text-[#F3F4F6]/70 leading-relaxed">
        <h1 class="text-3xl font-bold mb-8 text-white">Politique de confidentialité</h1>
        
        <p class="mb-4">
          La présente politique de confidentialité décrit comment vos données sont traitées sur DNGBlog.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-2 text-white">Données collectées</h2>
        <p class="mb-4">
          Nous collectons certaines informations nécessaires au fonctionnement du blog :
        </p>
        <ul class="list-disc pl-5 mb-4 space-y-1">
          <li>Adresses e-mail (via la newsletter)</li>
          <li>Commentaires publiés sur les articles</li>
          <li>Données liées à votre inscription sur le site</li>
        </ul>
        <p class="mb-4">
          <strong>Important :</strong> Aucune de ces données n'est divulguée, vendue ou utilisée à des fins tierces.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-2 text-white">Cookies et Analyse</h2>
        <p class="mb-4">
          Nous n'utilisons aucun cookie de suivi ni outil d'analyse (tracking) sur ce site.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-2 text-white">Services tiers</h2>
        <p class="mb-4">
          Nous utilisons les services tiers suivants :
        </p>
        <ul class="list-disc pl-5 mb-4 space-y-1">
          <li><strong>Cloudinary :</strong> Utilisé pour l'hébergement et la diffusion des images.</li>
          <li><strong>BetterAuth :</strong> Utilisé pour la gestion des connexions des utilisateurs.</li>
        </ul>
        <p class="mb-4">
          Ces services ne stockent aucune donnée relative aux utilisateurs au-delà du strict nécessaire au fonctionnement technique du site.
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-2 text-white">Contact</h2>
        <p>
          Pour toute question concernant cette politique, vous pouvez nous contacter via la page Contact.
        </p>
      </div>
    </BaseLayaoutContent>
  </NoAdminPage>
</template>
