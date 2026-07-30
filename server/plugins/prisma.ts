// import prisma from '~/lib/prisma' // Ajustez le chemin vers votre instance Prisma

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('close', async () => {
    console.log('Fermeture de la connexion Prisma...')
    await prisma.$disconnect()
  })
})
