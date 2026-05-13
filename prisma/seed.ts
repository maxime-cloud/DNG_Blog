import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function slug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function main() {
  console.log('🌱 Seeding database...')

  // ── Categories ──────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'developpement-web' },
      update: {},
      create: {
        name: 'Développement Web',
        slug: 'developpement-web',
        description: 'Tutoriels sur Vue.js, Nuxt, TypeScript et l\'écosystème web moderne',
        color: 'oklch(62.7% 0.194 149.214)',
        colorb: 'oklch(62.7% 0.194 149.214)',
        imageUrl: null
      }
    }),
    prisma.category.upsert({
      where: { slug: 'linux' },
      update: {},
      create: {
        name: 'Linux',
        slug: 'linux',
        description: 'Administration système, commandes essentielles et configurations',
        color: 'oklch(70% 0.15 60)',
        colorb: 'oklch(70% 0.15 60)',
        imageUrl: null
      }
    }),
    prisma.category.upsert({
      where: { slug: 'reseau' },
      update: {},
      create: {
        name: 'Réseau',
        slug: 'reseau',
        description: 'Protocoles réseau, DNS, HTTP, configuration de serveurs',
        color: 'oklch(54.6% 0.245 262.881)',
        colorb: 'oklch(54.6% 0.245 262.881)',
        imageUrl: null
      }
    }),
    prisma.category.upsert({
      where: { slug: 'outils' },
      update: {},
      create: {
        name: 'Outils & DevOps',
        slug: 'outils',
        description: 'Docker, Git, CI/CD et outils de productivité pour développeurs',
        color: 'oklch(65% 0.18 300)',
        colorb: 'oklch(65% 0.18 300)',
        imageUrl: null
      }
    })
  ])
  console.log(`✓ ${categories.length} categories`)

  // ── Tags ─────────────────────────────────────────────────────────────────────
  const tagNames = [
    'nuxt',
    'vue',
    'typescript',
    'linux',
    'docker',
    'nginx',
    'git',
    'postgresql',
    'css',
    'tailwind'
  ]
  const tags = await Promise.all(
    tagNames.map(name =>
      prisma.tag.upsert({
        where: { slug: name },
        update: {},
        create: { name, slug: name }
      })
    )
  )
  console.log(`✓ ${tags.length} tags`)

  // ── Admin user ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'dongnemaxime@gmail.com' },
    update: { role: 'admin' },
    create: {
      email: 'dongnemaxime@gmail.com',
      name: 'Maxime',
      emailVerified: true,
      role: 'admin',
      bio: 'Développeur full-stack passionné par les technos web et Linux.',
      githubUrl: 'https://github.com/maxime-cloud'
    }
  })
  console.log(`✓ admin user: ${admin.email}`)

  // ── Series ────────────────────────────────────────────────────────────────────
  const seriesNuxt = await prisma.series.upsert({
    where: { slug: 'maitriser-nuxt-4' },
    update: {},
    create: {
      title: 'Maîtriser Nuxt 4',
      slug: 'maitriser-nuxt-4',
      description: 'Série complète pour apprendre Nuxt 4 de zéro à la production.',
      isPublished: true
    }
  })

  const seriesLinux = await prisma.series.upsert({
    where: { slug: 'linux-pour-developpeurs' },
    update: {},
    create: {
      title: 'Linux pour développeurs',
      slug: 'linux-pour-developpeurs',
      description: 'Tout ce qu\'un développeur doit savoir sur Linux.',
      isPublished: true
    }
  })
  console.log('✓ 2 series')

  // ── Articles ──────────────────────────────────────────────────────────────────
  const articlesData = [
    {
      title: 'Démarrer avec Nuxt 4 — Guide complet 2025',
      slug: 'demarrer-avec-nuxt-4-guide-complet-2025',
      excerpt:
        'Découvrez les nouveautés de Nuxt 4 et apprenez à créer votre premier projet full-stack.',
      content: `# Démarrer avec Nuxt 4

Nuxt 4 apporte de nombreuses améliorations par rapport à Nuxt 3. Dans ce guide, nous allons voir comment créer un projet de zéro.

## Installation

\`\`\`bash
pnpm dlx nuxi@latest init mon-projet
cd mon-projet
pnpm install
pnpm dev
\`\`\`

## Structure du projet

Nuxt 4 utilise le répertoire \`app/\` par convention pour tout le code frontend.

## Conclusion

Nuxt 4 est une évolution majeure qui simplifie le développement full-stack avec Vue.js.`,
      categoryId: categories[0].id,
      tags: ['nuxt', 'vue', 'typescript'],
      seriesId: seriesNuxt.id,
      seriesOrder: 1
    },
    {
      title: 'TypeScript avec Vue 3 — Les bonnes pratiques',
      slug: 'typescript-vue-3-bonnes-pratiques',
      excerpt:
        'Comment utiliser TypeScript efficacement dans vos composants Vue 3 avec la Composition API.',
      content: `# TypeScript avec Vue 3

La Composition API et TypeScript forment un duo puissant pour construire des applications robustes.

## defineProps avec TypeScript

\`\`\`typescript
const props = defineProps<{
  title: string
  count?: number
}>()
\`\`\`

## Les composables typés

\`\`\`typescript
export function useCounter(initial: number = 0) {
  const count = ref<number>(initial)
  function increment() { count.value++ }
  return { count, increment }
}
\`\`\``,
      categoryId: categories[0].id,
      tags: ['vue', 'typescript']
    },
    {
      title: 'Configurer Nginx comme reverse proxy',
      slug: 'configurer-nginx-reverse-proxy',
      excerpt:
        'Guide pratique pour configurer Nginx en tant que reverse proxy pour vos applications Node.js.',
      content: `# Nginx comme reverse proxy

Nginx est un serveur web léger et performant, idéal comme reverse proxy devant vos applications.

## Installation

\`\`\`bash
# Ubuntu/Debian
sudo apt install nginx

# Fedora
sudo dnf install nginx
\`\`\`

## Configuration de base

\`\`\`nginx
server {
    listen 80;
    server_name mon-app.fr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
\`\`\``,
      categoryId: categories[2].id,
      tags: ['nginx', 'linux'],
      distrosTarget: ['ubuntu', 'fedora'],
      seriesId: seriesLinux.id,
      seriesOrder: 1
    },
    {
      title: 'Docker pour développeurs — Concepts essentiels',
      slug: 'docker-pour-developpeurs-concepts-essentiels',
      excerpt:
        'Comprendre Docker en 2025 : images, conteneurs, volumes et Docker Compose expliqués simplement.',
      content: `# Docker pour développeurs

Docker révolutionne le déploiement d'applications en isolant chaque service dans son propre conteneur.

## Les concepts clés

- **Image** : Blueprint read-only pour créer des conteneurs
- **Conteneur** : Instance en cours d'exécution d'une image
- **Volume** : Stockage persistant entre les redémarrages

## Dockerfile minimal pour Nuxt

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
\`\`\`

## Docker Compose

\`\`\`yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mydb
      POSTGRES_PASSWORD: secret
\`\`\``,
      categoryId: categories[3].id,
      tags: ['docker', 'linux']
    },
    {
      title: 'CSS Grid Layout — Guide pratique 2025',
      slug: 'css-grid-layout-guide-pratique-2025',
      excerpt:
        'Maîtrisez CSS Grid avec des exemples concrets : grilles responsives, zones nommées et auto-placement.',
      content: `# CSS Grid Layout

CSS Grid est le système de mise en page le plus puissant disponible en CSS.

## Grille de base

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
\`\`\`

## Zones nommées

\`\`\`css
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
}
\`\`\`

## Auto-placement

Grid place automatiquement les éléments grâce à \`grid-auto-flow\`.`,
      categoryId: categories[0].id,
      tags: ['css', 'tailwind']
    }
  ]

  const createdArticles = []
  for (const articleData of articlesData) {
    const { tags: tagNames, categoryId, ...rest } = articleData
    const existing = await prisma.article.findUnique({ where: { slug: rest.slug } })
    if (existing) {
      createdArticles.push(existing)
      continue
    }
    const article = await prisma.article.create({
      data: {
        ...rest,
        coverImageUrl: null,
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        authorId: admin.id,
        categories: { create: [{ categoryId }] },
        tags: {
          create: tagNames
            .map((name) => {
              const tag = tags.find(t => t.name === name)
              return tag ? { tagId: tag.id } : undefined
            })
            .filter(Boolean) as { tagId: number }[]
        }
      }
    })
    createdArticles.push(article)
  }
  console.log(`✓ ${createdArticles.length} articles`)

  // ── Comments ──────────────────────────────────────────────────────────────────
  if (createdArticles[0]) {
    const existingComment = await prisma.comment.findFirst({
      where: { articleId: createdArticles[0].id, userId: admin.id }
    })
    if (!existingComment) {
      const comment = await prisma.comment.create({
        data: {
          articleId: createdArticles[0].id,
          userId: admin.id,
          content: 'Super article ! La section sur l\'installation est particulièrement claire.',
          status: 'APPROVED'
        }
      })
      await prisma.comment.create({
        data: {
          articleId: createdArticles[0].id,
          userId: admin.id,
          parentId: comment.id,
          content: 'Merci pour ce retour, je prépare un article sur le déploiement !',
          status: 'APPROVED'
        }
      })
    }
  }
  console.log('✓ comments')

  // ── Learning paths ────────────────────────────────────────────────────────────
  const pathWeb = await prisma.learningPath.upsert({
    where: { slug: 'developpeur-nuxt-fullstack' },
    update: {},
    create: {
      title: 'Développeur Nuxt Full-Stack',
      slug: 'developpeur-nuxt-fullstack',
      description:
        'Parcours complet pour devenir développeur full-stack avec Nuxt 4, PostgreSQL et Prisma.',
      difficulty: 'INTERMEDIATE',
      isPublished: true
    }
  })

  const pathLinux = await prisma.learningPath.upsert({
    where: { slug: 'linux-admin-debutant' },
    update: {},
    create: {
      title: 'Linux pour débutants',
      slug: 'linux-admin-debutant',
      description:
        'Apprendre Linux de zéro : ligne de commande, gestion des fichiers, processus et réseau.',
      difficulty: 'BEGINNER',
      isPublished: true
    }
  })

  // Add steps to learning paths
  for (const [i, article] of createdArticles.slice(0, 2).entries()) {
    await prisma.learningPathStep.upsert({
      where: { pathId_stepOrder: { pathId: pathWeb.id, stepOrder: i + 1 } },
      update: {},
      create: { pathId: pathWeb.id, articleId: article.id, stepOrder: i + 1 }
    })
  }

  for (const [i, article] of createdArticles.slice(2, 4).entries()) {
    await prisma.learningPathStep.upsert({
      where: { pathId_stepOrder: { pathId: pathLinux.id, stepOrder: i + 1 } },
      update: {},
      create: { pathId: pathLinux.id, articleId: article.id, stepOrder: i + 1 }
    })
  }
  console.log('✓ 2 learning paths with steps')

  // ── Newsletter subscriber ──────────────────────────────────────────────────────
  await prisma.newsletterSubscription.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test Abonné',
      status: 'CONFIRMED',
      confirmToken: 'test-token-confirmed',
      subscribedAt: new Date(),
      confirmedAt: new Date()
    }
  })
  console.log('✓ newsletter subscriber')

  // ── Changelog ────────────────────────────────────────────────────────────────
  const existingChangelog = await prisma.changelogEntry.findFirst({
    where: { title: 'Lancement du blog StackTrace' }
  })
  if (!existingChangelog) {
    await prisma.changelogEntry.create({
      data: {
        title: 'Lancement du blog StackTrace',
        description:
          'Première version publique du blog avec articles, catégories, commentaires et parcours d\'apprentissage.',
        type: 'FEATURE',
        version: '1.0.0',
        publishedAt: new Date(),
        authorId: admin.id
      }
    })
    await prisma.changelogEntry.create({
      data: {
        title: 'Système de newsletter avec double opt-in',
        description: 'Ajout de l\'inscription newsletter avec confirmation par email.',
        type: 'FEATURE',
        version: '1.1.0',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        authorId: admin.id
      }
    })
  }
  console.log('✓ changelog entries')

  console.log('\n✅ Seed terminé avec succès !')
  console.log(`   Admin: ${admin.email}`)
  console.log(
    `   ${categories.length} catégories, ${tags.length} tags, ${createdArticles.length} articles`
  )
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
