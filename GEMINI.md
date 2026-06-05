# GEMINI.md — DNGBlog

Ce fichier définit les règles, conventions et l'architecture du projet DNGBlog pour guider l'IA dans ses interactions.

---

## 🏗️ Architecture et Structure

### Organisation des dossiers
- `app/` : Répertoire racine Nuxt 4 pour tout le code frontend (pages, composants, composables, layouts).
- `server/` : Code serveur (endpoints API, plugins nitro, utilitaires).
- `prisma/` : Schéma de base de données et scripts de seed/migration.
- `shared/` : Schémas Zod et types partagés entre client et serveur.
- `content/` : Contenu Markdown pour Nuxt Content.

---

## 📜 Règles de Développement Fondamentales

### ⚠️ RÈGLE PRIMAIRE : Lire avant d'écrire
**TOUJOURS** lire au moins **2 fichiers similaires** existants avant de créer ou modifier du code.
Identifier : les imports, la gestion de sécurité/session, le style de composant, et les patterns d'erreur.
- Nouvelle page → `app/pages/`
- Nouveau composant → `app/components/`
- Nouvel endpoint → `server/api/`
- Nouveau middleware → `app/middleware/auth.ts`

### 📦 Imports (Patterns Obligatoires)
- **Prisma** : `import { prisma } from '~/lib/prisma'` (ne jamais instancier `PrismaClient` directement).
- **Auth Client** : `import { authClient } from '~/lib/auth-client'` (uniquement composants/pages).
- **Auth Serveur** : `import { auth } from '~/lib/auth'` (uniquement dans `server/`).
- **Store Auth** : `import { useAuthStore } from '~/stores/auth'` (seule source de session côté client).
- **Types Prisma** : depuis `~/generated/prisma`, **JAMAIS** depuis `@prisma/client`.

### 🔐 Sécurité & Session
- **Validation Serveur** : NE JAMAIS faire confiance au client pour les rôles. Toujours vérifier côté serveur via `auth.api.getSession()`.
- **Protection de Routes** : Utiliser `definePageMeta({ middleware: 'auth' })`. Pas de redirection inline.
- **Secrets** : NE JAMAIS exposer de secrets (`.env`, `BETTER_AUTH_SECRET`) dans le code client.
- **Endpoints** : Utiliser `auth.api.getSession(toWebRequest(event))` pour valider la session dans les API.

### 🌐 Server API
- **Erreurs** : Retourner les erreurs via `createError({ statusCode, statusMessage })`.
- **Validation** : Valider systématiquement le body avec `readBody(event)` et Zod avant traitement.
- **Prisma** : Aucune requête Prisma ne doit être faite côté client. Uniquement côté serveur.

---

## 🎨 Système de Design (Stricte)

### ⚠️ Dark Mode UNIQUEMENT
L'application n'a **pas de mode clair**.
- **INTERDIT** : Préfixe `dark:` dans Tailwind.
- **INTERDIT** : Couleurs de fond "light" (`bg-white`, `bg-CustomLight`).
- **OBLIGATOIRE** : Fond principal `bg-CustomColor-900` (#0A0A0A).
- **OBLIGATOIRE** : Textes clairs par défaut (`text-white`, `text-[#F3F4F6]`).
- **CSS** : Couleurs claires directement sur les sélecteurs dans `<style>`, pas de condition `.dark`.

### Identité Visuelle
- **Border-radius** : `rounded-none` partout (aucune exception).
- **Bordures** : `border-[0.1px] border-dashcolor/50`. `border-dashed` par défaut pour les sections.
- **Ombres** : Triple ombre directionnelle sur cartes, boutons, inputs :
  `shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]`
- **Composants** : Utiliser **TOUJOURS** `CUButton` et `CUInput` au lieu de `UButton` / `UInput`.
- **Responsive** : Mobile-first (`défaut → sm: → md: → lg:`).

---

## 🛠️ Commandes Utiles

### Développement
- `pnpm dev` : Serveur de développement.
- `pnpm build` : Build de production.
- `pnpm preview` : Prévisualisation production.
- `pnpm lint` : ESLint.
- `pnpm typecheck` : Vérification TypeScript.

### Prisma
- `pnpm dlx prisma migrate dev --name <nom>` : Créer/appliquer une migration.
- `pnpm dlx prisma generate` : Régénérer le client Prisma (dans `app/generated/prisma`).
- `pnpm dlx prisma studio` : Interface visuelle de la base de données.
- `pnpm dlx prisma db seed` : Lancer le seed.

---

## 📂 Fichiers de Référence
- `CLAUDE.md` : Guide architectural.
- `.claude/rules/design.md` : Guide complet du système de design.
- `.claude/rules/coding-conventions.md` : Détails des conventions.
- `app/components/GEMINI.md` : Règles spécifiques aux composants.
- `server/api/GEMINI.md` : Règles spécifiques aux APIs serveurs.
- `app/components/LoginForm.vue` : Référence pour formulaires et validation.
