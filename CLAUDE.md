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

### Thème

- **Dark mode uniquement** — l'application n'a plus de light mode.
- `nuxt.config.ts` force `colorMode: { preference: 'dark', fallback: 'dark' }`.
- NEVER utiliser le préfixe `dark:` dans les classes Tailwind — toutes les classes sont désormais base (pas de variante conditionnelle).
- NEVER utiliser `bg-CustomLight` — utiliser `bg-CustomColor-900` (#0A0A0A).
- NEVER doubler les classes (`bg-CustomLight dark:bg-CustomColor-900`) — une seule valeur dark.
- Les couleurs de texte sont blanches/claires par défaut : `text-white`, `text-[#F3F4F6]`, etc. NEVER de texte sombre en base (ex. `text-[#0F0F0F]`).
- **CSS dans `<style>` / `<style scoped>`** (prose, contenu rendu) : mêmes règles. Couleurs claires **directement** sur le sélecteur ; NEVER gater le clair derrière `.dark .selector { ... }` ni mettre du texte sombre (`rgb(15,15,15)`) en base. Cf. `.claude/rules/design.md` § « CSS dans les blocs `<style>` ».
- Attention casse : la couleur custom est `CustomColor` (majuscules). `bg-customcolor-900` n'existe pas → fond transparent silencieux.
- Aucun bouton de toggle de thème — ne pas en ajouter.

### Composants

- NEVER utiliser `UButton` / `UInput` — toujours `CUButton` / `CUInput`
- NEVER créer un composant si Nuxt UI en a déjà un équivalent
- NEVER hardcoder des couleurs hors palette — voir `.claude/rules/design.md`
- NEVER utiliser autre chose que `rounded-none`

# Agentic SDLC and Spec-Driven Development

Kiro-style Spec-Driven Development on an agentic SDLC

## Project Context

### Paths

- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications

- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines

- Think in English, generate responses in French. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## Minimal Workflow

- Phase 0 (optional): `/kiro:steering`, `/kiro:steering-custom`
- Phase 1 (Specification):
  - `/kiro:spec-init "description"`
  - `/kiro:spec-requirements {feature}`
  - `/kiro:validate-gap {feature}` (optional: for existing codebase)
  - `/kiro:spec-design {feature} [-y]`
  - `/kiro:validate-design {feature}` (optional: design review)
  - `/kiro:spec-tasks {feature} [-y]`
- Phase 2 (Implementation): `/kiro:spec-impl {feature} [tasks]`
  - `/kiro:validate-impl {feature}` (optional: after implementation)
- Progress check: `/kiro:spec-status {feature}` (use anytime)

## Development Rules

- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro:spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration

- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro:steering-custom`)

# Agentic SDLC and Spec-Driven Development

Kiro-style Spec-Driven Development on an agentic SDLC

## Project Context

### Paths

- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications

- Check `.kiro/specs/` for active specifications
- Use `/kiro-spec-status [feature-name]` to check progress

## Development Guidelines

- Think in English, generate responses in English. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## Minimal Workflow

- Phase 0 (optional): `/kiro-steering`, `/kiro-steering-custom`
- Discovery: `/kiro-discovery "idea"` — determines action path, writes brief.md + roadmap.md for multi-spec projects
- Phase 1 (Specification):
  - Single spec: `/kiro-spec-quick {feature} [--auto]` or step by step:
    - `/kiro-spec-init "description"`
    - `/kiro-spec-requirements {feature}`
    - `/kiro-validate-gap {feature}` (optional: for existing codebase)
    - `/kiro-spec-design {feature} [-y]`
    - `/kiro-validate-design {feature}` (optional: design review)
    - `/kiro-spec-tasks {feature} [-y]`
  - Multi-spec: `/kiro-spec-batch` — creates all specs from roadmap.md in parallel by dependency wave
- Phase 2 (Implementation): `/kiro-impl {feature} [tasks]`
  - Without task numbers: autonomous mode (subagent per task + independent review + final validation)
  - With task numbers: manual mode (selected tasks in main context, still reviewer-gated before completion)
  - `/kiro-validate-impl {feature}` (standalone re-validation)
- Progress check: `/kiro-spec-status {feature}` (use anytime)

## Skills Structure

Skills are located in `.claude/skills/kiro-*/SKILL.md`

- Each skill is a directory with a `SKILL.md` file
- Skills run inline with access to conversation context
- Skills may delegate parallel research to subagents for efficiency
- Additional files (templates, examples) can be added to skill directories
- `kiro-review` — task-local adversarial review protocol used by reviewer subagents
- `kiro-debug` — root-cause-first debug protocol used by debugger subagents
- `kiro-verify-completion` — fresh-evidence gate before success or completion claims
- **If there is even a 1% chance a skill applies to the current task, invoke it.** Do not skip skills because the task seems simple.

## Development Rules

- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro-spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration

- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro-steering-custom`)
