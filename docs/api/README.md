# API Backend — Documentation complète

# StackTrace Blog — Nuxt 4 / Nitro / PostgreSQL / Prisma / Better Auth

---

## Démarrage rapide

```bash
# Développement
pnpm dev              # http://localhost:3000

# Production
pnpm build
pnpm preview

# Base de données
pnpm dlx prisma migrate dev --name <nom>   # Migration
pnpm dlx prisma db seed                     # Données initiales
pnpm dlx prisma studio                      # Interface visuelle
```

---

## Variables d'environnement

| Variable                | Description                           | Exemple                                         |
| ----------------------- | ------------------------------------- | ----------------------------------------------- |
| `DATABASE_URL`          | URL PostgreSQL                        | `postgresql://user:pass@localhost:5432/dngblog` |
| `BETTER_AUTH_SECRET`    | Secret JWT Better Auth (min 32 chars) | `random-secret-32-chars-minimum`                |
| `BETTER_AUTH_URL`       | URL de base de l'application          | `http://localhost:3000`                         |
| `GITHUB_CLIENT_ID`      | OAuth GitHub — Client ID              | `Iv23li...`                                     |
| `GITHUB_CLIENT_SECRET`  | OAuth GitHub — Secret                 | `abc123...`                                     |
| `SMTP_HOST`             | Serveur SMTP (Gmail, Brevo, OVH…)     | `smtp.gmail.com`                                |
| `SMTP_PORT`             | Port SMTP (587 = STARTTLS, 465 = SSL) | `587`                                           |
| `SMTP_USER`             | Identifiant SMTP                      | `mon@email.com`                                 |
| `SMTP_PASS`             | Mot de passe SMTP                     | `mot-de-passe-app`                              |
| `SMTP_FROM`             | Adresse d'expédition                  | `noreply@stacktrace.fr`                         |
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud Cloudinary               | `mon-cloud`                                     |
| `CLOUDINARY_API_KEY`    | Clé API Cloudinary                    | `123456789`                                     |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary                 | `abcDEF...`                                     |
| `NUXT_PUBLIC_SITE_URL`  | URL publique du site                  | `https://stacktrace.fr`                         |
| `GITHUB_REPO_URL`       | Repo GitHub pour liens "Modifier"     | `https://github.com/user/stacktrace`            |

---

## Architecture `server/`

```
server/
├── api/
│   ├── auth/[...all].ts          ← Better Auth catch-all
│   ├── articles/                 ← CRUD articles + likes/vues/commentaires
│   ├── comments/                 ← Likes, suppression, signalement
│   ├── categories/               ← Liste et détail catégories
│   ├── tags/                     ← Liste et détail tags
│   ├── series/                   ← Séries d'articles
│   ├── learning-paths/           ← Parcours d'apprentissage + progression
│   ├── search/                   ← Recherche full-text + suggestions
│   ├── newsletter/               ← Abonnement, confirmation, désabonnement
│   ├── analytics/                ← KPIs, trafic, top articles
│   ├── changelog/                ← Changelog public
│   ├── users/                    ← Profil, favoris, historique
│   └── admin/                    ← Administration (tous rôles admin/author)
├── emails/
│   └── templates.ts              ← Templates HTML responsives
├── plugins/
│   └── scheduler.ts              ← Tâches cron (publication planifiée, nettoyage)
└── utils/
    ├── auth.ts                   ← getAuthSession, requireAuth, requireRole, checkBanned
    ├── prisma.ts                 ← Instance Prisma singleton
    ├── mailer.ts / ~/lib/mailer  ← Envoi d'emails via Nodemailer SMTP
    ├── validation.ts             ← Schémas Zod réutilisables
    ├── rate-limit.ts             ← Rate limiting en mémoire (Map + TTL)
    ├── analytics.ts              ← trackArticleView (RGPD, dédup 24h)
    ├── slug.ts                   ← generateSlug() — accents, slugification
    ├── cloudinary.ts             ← Upload/suppression/URL optimisées
    └── content-sync.ts           ← Sync métadonnées Markdown → PostgreSQL
```

---

## Helpers utilitaires

### `requireAuth(event)` — Authentification obligatoire

```typescript
import { requireAuth } from '~/utils/auth' // auto-importé via server/utils

export default defineEventHandler(async event => {
  const session = await requireAuth(event) // throw 401 si non connecté
  // session.user.id, session.user.role, session.user.email...
})
```

### `requireRole(event, minRole)` — Rôle minimum requis

```typescript
const session = await requireRole(event, 'author') // throw 403 si rôle insuffisant
const session = await requireRole(event, 'admin')
// Hiérarchie : reader (0) < author (1) < admin (2)
```

### `checkBanned(session)` — Vérification bannissement

```typescript
const session = await requireAuth(event)
checkBanned(session) // throw 403 'Compte suspendu' si banni
```

### `rateLimit(event, options)` — Limitation de débit

```typescript
import { rateLimit } from '~/utils/rate-limit' // auto-importé

rateLimit(event, { max: 10, windowMs: 60_000 }) // max 10 req/min par IP+route
// throw 429 si dépassé
```

### `trackArticleView(event, articleId)` — Analytics RGPD-compliant

```typescript
import { trackArticleView } from '~/utils/analytics'

// Hash IP SHA-256, dédup 24h, upsert article_views_daily
await trackArticleView(event, article.id)
```

### `generateSlug(title)` — Génération de slug

```typescript
import { generateSlug } from '~/utils/slug'

generateSlug('Mon article : Guide complet !') // → "mon-article-guide-complet"
// Gère accents, caractères spéciaux, espaces
```

---

## Routes API

### Conventions

- Toutes les routes sont dans `server/api/`
- Réponse liste : `{ data: T[], meta: { page, limit, total, totalPages } }`
- Réponse unique : `{ data: T }` ou directement l'objet
- Erreurs : `createError({ statusCode, statusMessage })`
- Validation : Zod `.safeParse()` sur tous les body/query

---

### Authentification — Better Auth

| Méthode | URL           | Description                                                                                                              |
| ------- | ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ALL`   | `/api/auth/*` | Handler catch-all Better Auth. Gère : sign-up, sign-in (email + GitHub), sign-out, reset-password, verify-email, session |

```typescript
// Client — utiliser authClient de ~/lib/auth-client
const { data } = await authClient.signIn.email({ email, password })
await authClient.signOut()
```

---

### Utilisateurs

| Méthode  | URL                                  | Auth    | Description                          |
| -------- | ------------------------------------ | ------- | ------------------------------------ |
| `GET`    | `/api/users/:username`               | Non     | Profil public                        |
| `GET`    | `/api/users/me`                      | reader+ | Profil complet connecté              |
| `PATCH`  | `/api/users/me`                      | reader+ | Mise à jour profil                   |
| `PATCH`  | `/api/users/me/email`                | reader+ | Demande changement email             |
| `PATCH`  | `/api/users/me/password`             | reader+ | Changement mot de passe              |
| `DELETE` | `/api/users/me`                      | reader+ | Suppression RGPD du compte           |
| `GET`    | `/api/users/me/favorites`            | reader+ | Favoris paginés                      |
| `POST`   | `/api/users/me/favorites/:articleId` | reader+ | Ajouter un favori                    |
| `DELETE` | `/api/users/me/favorites/:articleId` | reader+ | Retirer un favori                    |
| `GET`    | `/api/users/me/history`              | reader+ | Historique de lecture                |
| `DELETE` | `/api/users/me/history`              | reader+ | Vider l'historique                   |
| `GET`    | `/api/users/me/progress`             | reader+ | Progression parcours d'apprentissage |

**Body `PATCH /api/users/me` :**

```json
{
  "name": "Mon Pseudo",
  "bio": "Ma bio",
  "githubUrl": "https://github.com/...",
  "websiteUrl": "https://..."
}
```

---

### Articles

| Méthode  | URL                           | Auth    | Description                              |
| -------- | ----------------------------- | ------- | ---------------------------------------- |
| `GET`    | `/api/articles`               | Non     | Liste paginée des articles publiés       |
| `POST`   | `/api/articles`               | author+ | Créer un article (DRAFT)                 |
| `GET`    | `/api/articles/featured`      | Non     | Article mis en avant                     |
| `GET`    | `/api/articles/rss`           | Non     | Flux RSS XML                             |
| `GET`    | `/api/articles/:slug`         | Non     | Article complet                          |
| `PATCH`  | `/api/articles/:id`           | author+ | Modifier un article                      |
| `DELETE` | `/api/articles/:id`           | author+ | Supprimer un article                     |
| `PATCH`  | `/api/articles/:id/publish`   | author+ | Publier immédiatement                    |
| `PATCH`  | `/api/articles/:id/archive`   | author+ | Archiver                                 |
| `PATCH`  | `/api/articles/:id/schedule`  | author+ | Planifier la publication                 |
| `GET`    | `/api/articles/:slug/related` | Non     | 3 articles liés                          |
| `GET`    | `/api/articles/:slug/likes`   | Non     | Compteur + statut like                   |
| `POST`   | `/api/articles/:slug/likes`   | reader+ | Liker                                    |
| `DELETE` | `/api/articles/:slug/likes`   | reader+ | Unliker                                  |
| `POST`   | `/api/articles/:slug/views`   | Non     | Incrémenter les vues (rate limit: 5/min) |

**Query `GET /api/articles` :**

```
page, limit, category (slug), tag (slug), series (slug), search, sort (latest|popular|oldest), authorId
```

**Body `POST /api/articles` :**

```json
{
  "title": "Mon article",
  "content": "Contenu Markdown...",
  "description": "Extrait court",
  "categoryId": 1,
  "tags": ["nuxt", "vue"],
  "coverImage": "https://res.cloudinary.com/...",
  "seriesId": 2,
  "seriesOrder": 1
}
```

**Erreurs communes :** `400` validation, `401` non connecté, `403` rôle insuffisant / banni, `404` introuvable, `409` slug déjà utilisé, `429` rate limit

---

### Commentaires

| Méthode  | URL                            | Auth    | Description                       |
| -------- | ------------------------------ | ------- | --------------------------------- |
| `GET`    | `/api/articles/:slug/comments` | Non     | Commentaires approuvés (arbre)    |
| `POST`   | `/api/articles/:slug/comments` | reader+ | Poster un commentaire (PENDING)   |
| `PATCH`  | `/api/comments/:id`            | reader+ | Modifier son commentaire (15 min) |
| `DELETE` | `/api/comments/:id`            | reader+ | Supprimer son commentaire         |
| `POST`   | `/api/comments/:id/likes`      | reader+ | Liker un commentaire              |
| `DELETE` | `/api/comments/:id/likes`      | reader+ | Unliker                           |
| `POST`   | `/api/comments/:id/report`     | reader+ | Signaler (rate limit: 5/min)      |

**Body `POST /api/articles/:slug/comments` :**

```json
{ "content": "Mon commentaire (1–2000 chars)", "parentId": "optionnel — ID du commentaire parent" }
```

---

### Catégories & Tags

| Méthode | URL                     | Auth | Description                         |
| ------- | ----------------------- | ---- | ----------------------------------- |
| `GET`   | `/api/categories`       | Non  | Toutes les catégories + nb articles |
| `GET`   | `/api/categories/:slug` | Non  | Catégorie + articles paginés        |
| `GET`   | `/api/tags`             | Non  | Tous les tags + nb articles         |
| `GET`   | `/api/tags/:slug`       | Non  | Articles du tag, paginés            |

---

### Séries & Parcours d'apprentissage

| Méthode  | URL                                          | Auth    | Description                     |
| -------- | -------------------------------------------- | ------- | ------------------------------- |
| `GET`    | `/api/series`                                | Non     | Toutes les séries publiées      |
| `GET`    | `/api/series/:slug`                          | Non     | Série + liste des articles      |
| `GET`    | `/api/learning-paths`                        | Non     | Tous les parcours + progression |
| `GET`    | `/api/learning-paths/:slug`                  | Non     | Parcours + étapes + progression |
| `POST`   | `/api/learning-paths/:slug/progress/:stepId` | reader+ | Marquer une étape complétée     |
| `DELETE` | `/api/learning-paths/:slug/progress`         | reader+ | Réinitialiser la progression    |

---

### Recherche

| Méthode | URL                       | Auth | Description                               |
| ------- | ------------------------- | ---- | ----------------------------------------- |
| `GET`   | `/api/search`             | Non  | Recherche full-text (tsvector PostgreSQL) |
| `GET`   | `/api/search/suggestions` | Non  | Suggestions rapides (5 max, autocomplete) |

**Query `GET /api/search` :** `q`, `category`, `tag`, `page`

---

### Newsletter

| Méthode | URL                           | Auth | Description                                    |
| ------- | ----------------------------- | ---- | ---------------------------------------------- |
| `POST`  | `/api/newsletter/subscribe`   | Non  | Inscription (double opt-in, rate limit: 3/min) |
| `GET`   | `/api/newsletter/confirm`     | Non  | Confirmation via token query param             |
| `POST`  | `/api/newsletter/unsubscribe` | Non  | Désabonnement via token                        |

**Body `POST /api/newsletter/subscribe` :**

```json
{ "email": "utilisateur@example.com", "name": "Prénom" }
```

---

### Analytics

| Méthode | URL                           | Auth    | Description                 |
| ------- | ----------------------------- | ------- | --------------------------- |
| `GET`   | `/api/analytics/overview`     | admin   | KPIs globaux                |
| `GET`   | `/api/analytics/traffic`      | admin   | Vues/jour sur une période   |
| `GET`   | `/api/analytics/top-articles` | admin   | Top articles par vues/likes |
| `GET`   | `/api/analytics/referrers`    | admin   | Sources de trafic           |
| `GET`   | `/api/analytics/articles/:id` | author+ | Stats d'un article          |

**Query `GET /api/analytics/traffic` :** `days` (défaut 30)
**Query `GET /api/analytics/top-articles` :** `period` (7d|30d|90d|all), `limit`

**Réponse `GET /api/analytics/overview` :**

```json
{
  "totalArticles": 42,
  "totalViews": 12850,
  "totalUsers": 318,
  "totalSubscribers": 94,
  "totalComments": 127
}
```

---

### Changelog

| Méthode | URL              | Auth | Description                                     |
| ------- | ---------------- | ---- | ----------------------------------------------- |
| `GET`   | `/api/changelog` | Non  | Entrées paginées, tri chronologique décroissant |

---

### Administration — Utilisateurs

| Méthode | URL                          | Auth  | Description                          |
| ------- | ---------------------------- | ----- | ------------------------------------ |
| `GET`   | `/api/admin/users`           | admin | Liste + filtres (rôle, statut, date) |
| `GET`   | `/api/admin/users/:id`       | admin | Profil complet admin                 |
| `PATCH` | `/api/admin/users/:id/role`  | admin | Changer le rôle                      |
| `PATCH` | `/api/admin/users/:id/ban`   | admin | Bannir (révoque les sessions)        |
| `PATCH` | `/api/admin/users/:id/unban` | admin | Lever le bannissement                |

---

### Administration — Articles

| Méthode | URL                                         | Auth    | Description                            |
| ------- | ------------------------------------------- | ------- | -------------------------------------- |
| `GET`   | `/api/admin/articles`                       | author+ | Tous statuts, filtres avancés          |
| `GET`   | `/api/admin/articles/:id`                   | author+ | Article complet par ID (drafts inclus) |
| `GET`   | `/api/admin/articles/:id/revisions`         | author+ | 5 dernières révisions                  |
| `POST`  | `/api/admin/articles/:id/revisions/restore` | author+ | Restaurer une révision                 |

---

### Administration — Commentaires

| Méthode  | URL                               | Auth  | Description                     |
| -------- | --------------------------------- | ----- | ------------------------------- |
| `GET`    | `/api/admin/comments`             | admin | Tous les commentaires + filtres |
| `PATCH`  | `/api/admin/comments/:id/approve` | admin | Approuver                       |
| `PATCH`  | `/api/admin/comments/:id/reject`  | admin | Rejeter                         |
| `PATCH`  | `/api/admin/comments/:id/spam`    | admin | Marquer spam                    |
| `DELETE` | `/api/admin/comments/:id`         | admin | Supprimer définitivement        |
| `POST`   | `/api/admin/comments/bulk`        | admin | Actions en lot                  |

**Body `POST /api/admin/comments/bulk` :**

```json
{ "ids": [1, 2, 3], "action": "approve" }
// action: approve | reject | spam | delete
```

---

### Administration — Newsletter

| Méthode  | URL                                            | Auth  | Description                 |
| -------- | ---------------------------------------------- | ----- | --------------------------- |
| `GET`    | `/api/admin/newsletter/subscribers`            | admin | Liste abonnés + export CSV  |
| `DELETE` | `/api/admin/newsletter/subscribers/:id`        | admin | Supprimer un abonné         |
| `GET`    | `/api/admin/newsletter/campaigns`              | admin | Toutes les campagnes        |
| `POST`   | `/api/admin/newsletter/campaigns`              | admin | Créer une campagne (DRAFT)  |
| `PATCH`  | `/api/admin/newsletter/campaigns/:id`          | admin | Modifier une campagne       |
| `POST`   | `/api/admin/newsletter/campaigns/:id/send`     | admin | Envoyer (async, lots de 50) |
| `POST`   | `/api/admin/newsletter/campaigns/:id/schedule` | admin | Planifier l'envoi           |
| `POST`   | `/api/admin/newsletter/campaigns/:id/test`     | admin | Envoyer un test à l'admin   |

---

### Administration — Catégories & Tags

| Méthode  | URL                         | Auth  | Description         |
| -------- | --------------------------- | ----- | ------------------- |
| `POST`   | `/api/admin/categories`     | admin | Créer une catégorie |
| `PATCH`  | `/api/admin/categories/:id` | admin | Modifier            |
| `DELETE` | `/api/admin/categories/:id` | admin | Supprimer           |
| `POST`   | `/api/admin/tags`           | admin | Créer un tag        |
| `PATCH`  | `/api/admin/tags/:id`       | admin | Modifier            |
| `DELETE` | `/api/admin/tags/:id`       | admin | Supprimer           |
| `POST`   | `/api/admin/tags/merge`     | admin | Fusionner deux tags |

---

### Administration — Médias

| Méthode  | URL                       | Auth    | Description                    |
| -------- | ------------------------- | ------- | ------------------------------ |
| `GET`    | `/api/admin/media`        | author+ | Liste paginée des médias       |
| `POST`   | `/api/admin/media/upload` | author+ | Upload via Cloudinary          |
| `PATCH`  | `/api/admin/media/:id`    | author+ | Modifier métadonnées (altText) |
| `DELETE` | `/api/admin/media/:id`    | author+ | Supprimer (Cloudinary + DB)    |

---

### Administration — Parcours, Séries, Changelog, Paramètres

| Méthode  | URL                                           | Auth  | Description           |
| -------- | --------------------------------------------- | ----- | --------------------- |
| `POST`   | `/api/admin/learning-paths`                   | admin | Créer un parcours     |
| `PATCH`  | `/api/admin/learning-paths/:id`               | admin | Modifier              |
| `DELETE` | `/api/admin/learning-paths/:id`               | admin | Supprimer + étapes    |
| `POST`   | `/api/admin/learning-paths/:id/steps`         | admin | Ajouter une étape     |
| `PATCH`  | `/api/admin/learning-paths/:id/steps/reorder` | admin | Réordonner les étapes |
| `DELETE` | `/api/admin/learning-paths/:id/steps/:stepId` | admin | Retirer une étape     |
| `POST`   | `/api/admin/series`                           | admin | Créer une série       |
| `PATCH`  | `/api/admin/series/:id`                       | admin | Modifier              |
| `DELETE` | `/api/admin/series/:id`                       | admin | Supprimer             |
| `POST`   | `/api/admin/changelog`                        | admin | Créer une entrée      |
| `PATCH`  | `/api/admin/changelog/:id`                    | admin | Modifier              |
| `DELETE` | `/api/admin/changelog/:id`                    | admin | Supprimer             |
| `GET`    | `/api/admin/settings`                         | admin | Lire la configuration |
| `PATCH`  | `/api/admin/settings`                         | admin | Mettre à jour         |

---

## Codes d'erreur HTTP

| Code  | Signification          | Contexte typique               |
| ----- | ---------------------- | ------------------------------ |
| `400` | Validation Zod échouée | Body/query invalide            |
| `401` | Non authentifié        | Session absente                |
| `403` | Accès refusé           | Rôle insuffisant ou banni      |
| `404` | Ressource introuvable  | ID/slug inexistant             |
| `409` | Conflit                | Slug/email déjà utilisé        |
| `429` | Trop de requêtes       | Rate limit dépassé             |
| `500` | Erreur serveur         | Erreur Prisma/système (loggée) |

---

## Schémas Zod de référence

```typescript
// Article
const articleSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(500).optional(),
  content: z.string().min(10),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.url().optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
  scheduledAt: z.date().optional(),
  seriesId: z.string().optional(),
  seriesOrder: z.number().optional()
})

// Commentaire
const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional()
})

// Mise à jour profil
const userUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  image: z.url().optional(),
  githubUrl: z.url().optional(),
  websiteUrl: z.url().optional()
})

// Newsletter
const newsletterSchema = z.object({
  email: z.email(),
  name: z.string().min(2).max(50).optional()
})
```

---

_Documentation générée depuis le code source — `server/api/` + `server/utils/`_
