<template>
  <div class="flex md:flex-row flex-col rounded-none items-start md:items-center justify-between gap-5 text-sm max-w-5xl bg-transparent p-8 border-dashcolor/50 border-[0.1px] shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)]">
    <div class="max-w-md w-full">
      <h1 class="text-3xl font-semibold text-text">
        Abonnez-vous à notre newsletter
      </h1>
      <p class="text-[#F3F4F6]/70 mt-2">
        Recevez nos derniers articles et actualités directement dans votre boîte mail. Ne manquez rien de nos publications hebdomadaires.
      </p>
      <div class="flex flex-col sm:flex-row items-center gap-4 mt-10">
        <CUInput
          class="w-full max-w-64"
          placeholder="Entrez votre email"
        />
        <CUButton
          class="w-full sm:w-auto justify-center max-w-64"
          label="S'abonner"
        />
      </div>
    </div>
    <div class="space-y-4 md:max-w-48">
      <div class="flex items-center gap-3">
        <div class="bg-primary/10 w-max p-2.5 rounded-none border border-dashcolor/30">
          <UIcon
            name="i-heroicons-calendar-days"
            class="w-6 h-6 text-text"
          />
        </div>
        <h3 class="text-base font-medium text-text">
          Articles hebdomadaires
        </h3>
      </div>
      <p class="text-[#F3F4F6]/70">
        Chaque semaine, découvrez de nouveaux contenus passionnants sur le développement et la technologie.
      </p>
    </div>
    <div class="space-y-4 md:max-w-48">
      <div class="flex items-center gap-3">
        <div class="bg-primary/10 w-max p-2.5 rounded-none border border-dashcolor/30">
          <UIcon
            name="i-heroicons-hand-raised"
            class="w-6 h-6 text-text"
          />
        </div>
        <h3 class="text-base font-medium text-text">
          Pas de spam
        </h3>
      </div>
      <p class="text-[#F3F4F6]/70">
        Nous respectons votre vie privée. Vous ne recevrez que des informations pertinentes, promis !
      </p>
    </div>
  </div>
</template>
