# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

**Nuxt 4** avec le répertoire `app/` (convention Nuxt 4 — toutes les sources frontend sont dans `app/`, pas à la racine).

### Authentification (Better Auth)

- La config serveur est dans `app/lib/auth.ts` — c'est ici que sont configurés email/password, email verification, reset password, OAuth GitHub, et le plugin `admin`.
- Le client est dans `app/lib/auth-client.ts` (utilisé uniquement côté client/composants).
- Le handler HTTP est `server/api/auth/[...all].ts` (catch-all Better Auth).
- `server/api/auth/session.get.ts` expose la session courante via `/api/auth/session`.

**Flux de session SSR :**

1. `app/middleware/auth.global.ts` s'exécute sur chaque page côté serveur : il appelle `/api/auth/session` avec les headers de la requête (cookies inclus) et hydrate le store Pinia.
2. `app/stores/auth.ts` (Pinia) expose `user`, `isAuthenticated`, `fetchSession()`, `logout()`.
3. `app/app.vue` appelle `store.fetchSession()` au montage client pour garder la session à jour.

**Protection de routes :** utiliser `definePageMeta({ middleware: 'auth' })` dans une page — le middleware `app/middleware/auth.ts` redirige vers `/login` si pas de session.

**Rôles utilisateur :** `reader` (défaut), `author`, `admin`. Géré via le plugin `admin` de Better Auth.

**Emails transactionnels :** Plunk (`PLUNK_SECRET_API_KEY`) — vérification d'email à l'inscription et reset de mot de passe.

### Base de données (Prisma + PostgreSQL)

- Schéma : `prisma/schema.prisma`
- Client généré : `app/generated/prisma/` (output non-standard — ne pas confondre avec `node_modules/.prisma`)
- Import dans le code : `import { prisma } from '~/lib/prisma'` (utilise `PrismaPg` adapter, pas le connecteur TCP par défaut)
- Variables d'env requises : `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `PLUNK_SECRET_API_KEY`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

Après toute modification du schéma Prisma, il faut relancer `prisma generate` pour mettre à jour le client dans `app/generated/prisma/`.

### Modules Nuxt actifs

`@nuxt/ui` (v4 — composants préfixés `U`), `@nuxt/fonts`, `@vueuse/nuxt`, `@pinia/nuxt`, `@nuxt/eslint`

### Style ESLint

`commaDangle: 'never'`, `braceStyle: '1tbs'` — configuré dans `nuxt.config.ts`.

---

## Règles de développement

### PRIMAIRE : Lire avant d'écrire

**TOUJOURS** lire au moins un fichier similaire existant avant de créer ou modifier du code — pour identifier les imports, la gestion de session/sécurité, et les patterns d'erreur utilisés.

- Nouvelle page → lire une page existante dans `app/pages/`
- Nouveau composant → lire un composant similaire dans `app/components/`
- Nouvel endpoint → lire un fichier dans `server/api/`
- Nouveau middleware → lire `app/middleware/auth.ts`

### Imports — patterns obligatoires

- **Prisma** : `import { prisma } from '~/lib/prisma'` — jamais instancier `PrismaClient` directement
- **Auth côté client** : `import { authClient } from '~/lib/auth-client'` — uniquement dans composants/pages
- **Auth côté serveur** : `import { auth } from '~/lib/auth'` — uniquement dans `server/`
- **Store auth** : `import { useAuthStore } from '~/stores/auth'` — jamais accéder à la session autrement côté client
- **Types Prisma** : depuis `~/generated/prisma`, pas depuis `@prisma/client`

### Sécurité

- NEVER vérifier les rôles côté client — toujours côté serveur via `auth.api.getSession()`
- Routes protégées : `definePageMeta({ middleware: 'auth' })` — pas de redirection inline
- NEVER exposer des secrets (`BETTER_AUTH_SECRET`, clés API) dans du code client

### Composants

- NEVER utiliser `UButton` / `UInput` — toujours `CUButton` / `CUInput`
- NEVER créer un composant si Nuxt UI en a déjà un équivalent
- NEVER hardcoder des couleurs hors palette — voir `.claude/rules/design.md`
- NEVER utiliser autre chose que `rounded-none`
