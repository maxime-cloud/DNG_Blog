# Conventions de code — DNGBlog

## RÈGLE PRIMAIRE : Lire avant d'écrire

**TOUJOURS** lire au moins 2 fichiers similaires existants avant de créer ou modifier du code.  
Identifier : les imports utilisés, la gestion de la sécurité/session, le style de composant, les patterns d'erreur.

Exemples :
- Nouvelle page → lire une page existante dans `app/pages/`
- Nouveau composant → lire un composant similaire dans `app/components/`
- Nouvel endpoint → lire un endpoint existant dans `server/api/`
- Nouveau middleware → lire `app/middleware/auth.ts`

---

## Imports

- **Prisma** : toujours `import { prisma } from '~/lib/prisma'` — jamais instancier PrismaClient directement
- **Auth client** : `import { authClient } from '~/lib/auth-client'` — uniquement dans les composants/pages côté client
- **Auth serveur** : `import { auth } from '~/lib/auth'` — uniquement dans `server/`
- **Store auth** : `import { useAuthStore } from '~/stores/auth'` — jamais accéder à la session autrement côté client
- **Types Prisma** : depuis `~/generated/prisma`, pas depuis `@prisma/client`

## Sécurité & Session

- **NEVER** faire confiance aux données côté client pour les vérifications de rôle — toujours vérifier côté serveur
- Les routes protégées utilisent `definePageMeta({ middleware: 'auth' })` — pas de logique de redirection inline
- Les endpoints sensibles appellent `auth.api.getSession(toWebRequest(event))` pour valider la session
- **NEVER** exposer `BETTER_AUTH_SECRET` ou d'autres secrets dans du code côté client

## Composants

- **NEVER** utiliser `UButton` ou `UInput` directement — toujours `CUButton` et `CUInput`
- **NEVER** créer un composant si Nuxt UI en fournit déjà un équivalent — vérifier d'abord
- Structure standard : `<NoAdminPage><BaseLayaoutContent>...</BaseLayaoutContent></NoAdminPage>`
- Validation de formulaire : regarder `LoginForm.vue` ou `RegisterForm.vue` comme référence

## Server API

- Les handlers retournent les erreurs avec `createError({ statusCode, statusMessage })`
- Toujours valider le body avec `readBody(event)` et vérifier les champs requis avant d'utiliser
- Pattern de session serveur : regarder les fichiers existants dans `server/api/` avant d'en créer un nouveau

## Style général

- **NEVER** hardcoder des couleurs ou des styles qui ne sont pas dans la palette définie dans `design.md`
- **NEVER** utiliser `border-radius` autre que `rounded-none`
- Responsive : toujours mobile-first (`défaut → sm: → md: → lg:`)
