# BACKEND — Liste complète des routes API
# StackTrace Blog — Document de référence pour Claude Code
# Framework : Nuxt 3 / Nitro — Dossier : server/api/
# Base de données : PostgreSQL + Prisma ORM
# Authentification : Better Auth
# Validation : Zod

---

## CONVENTIONS GÉNÉRALES

- Toutes les routes sont dans `server/api/`
- La structure de fichiers Nuxt/Nitro détermine l'URL : `server/api/articles/index.get.ts` → `GET /api/articles`
- Chaque fichier de route exporte un `defineEventHandler`
- Les routes protégées vérifient la session via le helper Better Auth
- La validation des inputs se fait systématiquement avec Zod en début de handler
- Les réponses suivent le format : `{ data, meta?, error? }`
- Les erreurs HTTP utilisent `createError()` de Nitro

---

## STRUCTURE DES FICHIERS SERVER/

```
server/
├── api/
│   ├── auth/[...all].ts              ← Better Auth handler (catch-all)
│   ├── users/
│   ├── articles/
│   ├── comments/
│   ├── categories/
│   ├── tags/
│   ├── series/
│   ├── learning-paths/
│   ├── search/
│   ├── newsletter/
│   ├── analytics/
│   ├── changelog/
│   └── admin/
├── middleware/
│   ├── auth.ts                       ← Vérifie session sur routes protégées
│   └── rate-limit.ts                 ← Rate limiting global
└── utils/
    ├── prisma.ts                     ← Instance Prisma singleton
    ├── auth.ts                       ← Helpers Better Auth (getSession, requireAuth, requireRole)
    ├── mailer.ts                     ← Instance Nodemailer + fonctions d'envoi
    ├── validation.ts                 ← Schémas Zod réutilisables
    ├── rate-limit.ts                 ← Logique rate limiting (mémoire ou Redis)
    └── analytics.ts                  ← Helpers incrémentation vues
```

---

## AUTHENTIFICATION — Better Auth

| Fichier | Méthode | URL | Description |
|---------|---------|-----|-------------|
| `server/api/auth/[...all].ts` | ALL | `/api/auth/*` | Handler catch-all Better Auth. Gère automatiquement : sign-up/email, sign-in/email, sign-in/social (GitHub), sign-out, forget-password, reset-password, verify-email, session |

**Note** : Better Auth génère automatiquement ces routes. Le fichier catch-all suffit. Les hooks Better Auth (onUserCreated, onEmailVerified) déclenchent les emails via Nodemailer.

---

## UTILISATEURS

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/users/[username].get.ts` | GET | `/api/users/:username` | Non | Profil public : nom, avatar, bio, liens, derniers articles publiés |
| `server/api/users/me.get.ts` | GET | `/api/users/me` | Oui — reader+ | Profil complet de l'utilisateur connecté (inclut email) |
| `server/api/users/me.patch.ts` | PATCH | `/api/users/me` | Oui — reader+ | Mise à jour profil : pseudo, bio, avatar, liens |
| `server/api/users/me/email.patch.ts` | PATCH | `/api/users/me/email` | Oui — reader+ | Demande changement email — envoie confirmation à la nouvelle adresse |
| `server/api/users/me/password.patch.ts` | PATCH | `/api/users/me/password` | Oui — reader+ | Changement mot de passe — vérifie l'ancien avant de hacher le nouveau |
| `server/api/users/me/index.delete.ts` | DELETE | `/api/users/me` | Oui — reader+ | Suppression RGPD : anonymise commentaires, supprime données perso, révoque sessions |
| `server/api/users/me/favorites/index.get.ts` | GET | `/api/users/me/favorites` | Oui — reader+ | Liste paginée des articles en favoris |
| `server/api/users/me/favorites/[articleId].post.ts` | POST | `/api/users/me/favorites/:articleId` | Oui — reader+ | Ajouter un article aux favoris |
| `server/api/users/me/favorites/[articleId].delete.ts` | DELETE | `/api/users/me/favorites/:articleId` | Oui — reader+ | Retirer un article des favoris |
| `server/api/users/me/history/index.get.ts` | GET | `/api/users/me/history` | Oui — reader+ | Historique de lecture paginé, trié par date décroissante |
| `server/api/users/me/history/index.delete.ts` | DELETE | `/api/users/me/history` | Oui — reader+ | Vider l'historique de lecture |
| `server/api/users/me/progress.get.ts` | GET | `/api/users/me/progress` | Oui — reader+ | Progression dans tous les parcours d'apprentissage |

---

## ARTICLES

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/articles/index.get.ts` | GET | `/api/articles` | Non | Liste paginée des articles publiés. Params : page, limit, category, tag, series, search, sort (date/likes/views) |
| `server/api/articles/featured.get.ts` | GET | `/api/articles/featured` | Non | Article mis en avant sur la page d'accueil |
| `server/api/articles/rss.get.ts` | GET | `/api/articles/rss` | Non | Flux RSS/Atom XML — 20 derniers articles publiés |
| `server/api/articles/[slug]/index.get.ts` | GET | `/api/articles/:slug` | Non | Article complet : contenu, auteur, catégories, tags, stats |
| `server/api/articles/[slug]/related.get.ts` | GET | `/api/articles/:slug/related` | Non | 3 articles liés (même catégorie/tags) |
| `server/api/articles/[slug]/likes.get.ts` | GET | `/api/articles/:slug/likes` | Non | Compteur likes + si l'utilisateur courant a liké |
| `server/api/articles/[slug]/likes.post.ts` | POST | `/api/articles/:slug/likes` | Oui — reader+ | Liker un article |
| `server/api/articles/[slug]/likes.delete.ts` | DELETE | `/api/articles/:slug/likes` | Oui — reader+ | Unliker un article |
| `server/api/articles/[slug]/views.post.ts` | POST | `/api/articles/:slug/views` | Non | Incrémenter les vues (dédupliqué par hash IP + user-agent sur 24h) |
| `server/api/articles/index.post.ts` | POST | `/api/articles` | Oui — author+ | Créer un article (statut DRAFT par défaut). Met à jour search_index. |
| `server/api/articles/[id]/index.patch.ts` | PATCH | `/api/articles/:id` | Oui — author+ | Modifier un article (auteur ou admin uniquement). Sauvegarde révision avant modification. |
| `server/api/articles/[id]/index.delete.ts` | DELETE | `/api/articles/:id` | Oui — author+ | Supprimer un article (auteur ou admin) |
| `server/api/articles/[id]/publish.patch.ts` | PATCH | `/api/articles/:id/publish` | Oui — author+ | Publier immédiatement — passe status à PUBLISHED, renseigne publishedAt |
| `server/api/articles/[id]/archive.patch.ts` | PATCH | `/api/articles/:id/archive` | Oui — author+ | Archiver un article publié |
| `server/api/articles/[id]/schedule.patch.ts` | PATCH | `/api/articles/:id/schedule` | Oui — author+ | Planifier la publication (renseigne scheduledAt, job cron vérifie toutes les minutes) |

---

## COMMENTAIRES

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/articles/[slug]/comments/index.get.ts` | GET | `/api/articles/:slug/comments` | Non | Commentaires approuvés en arbre (racines + réponses), paginés |
| `server/api/articles/[slug]/comments/index.post.ts` | POST | `/api/articles/:slug/comments` | Oui — reader+ | Poster un commentaire. Sanitisation XSS. Statut PENDING. Notifie l'admin. |
| `server/api/comments/[id]/index.patch.ts` | PATCH | `/api/comments/:id` | Oui — reader+ | Modifier son propre commentaire (fenêtre de 15 min après création) |
| `server/api/comments/[id]/index.delete.ts` | DELETE | `/api/comments/:id` | Oui — reader+ | Supprimer son commentaire ou admin |
| `server/api/comments/[id]/likes.post.ts` | POST | `/api/comments/:id/likes` | Oui — reader+ | Liker un commentaire |
| `server/api/comments/[id]/likes.delete.ts` | DELETE | `/api/comments/:id/likes` | Oui — reader+ | Unliker un commentaire |
| `server/api/comments/[id]/report.post.ts` | POST | `/api/comments/:id/report` | Oui — reader+ | Signaler un commentaire. Incrémente reportCount. Notifie admin si seuil dépassé. |

---

## CATÉGORIES

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/categories/index.get.ts` | GET | `/api/categories` | Non | Toutes les catégories avec compteur d'articles publiés |
| `server/api/categories/[slug]/index.get.ts` | GET | `/api/categories/:slug` | Non | Détails d'une catégorie + articles paginés |

---

## TAGS

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/tags/index.get.ts` | GET | `/api/tags` | Non | Tous les tags avec compteur d'articles |
| `server/api/tags/[slug]/index.get.ts` | GET | `/api/tags/:slug` | Non | Articles associés à un tag, paginés |

---

## SÉRIES

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/series/index.get.ts` | GET | `/api/series` | Non | Toutes les séries publiées avec nb épisodes |
| `server/api/series/[slug]/index.get.ts` | GET | `/api/series/:slug` | Non | Détails de la série + liste ordonnée des articles |

---

## PARCOURS D'APPRENTISSAGE

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/learning-paths/index.get.ts` | GET | `/api/learning-paths` | Non | Tous les parcours publiés avec progression utilisateur courant |
| `server/api/learning-paths/[slug]/index.get.ts` | GET | `/api/learning-paths/:slug` | Non | Parcours complet avec étapes et progression de l'utilisateur connecté |
| `server/api/learning-paths/[slug]/progress/[stepId].post.ts` | POST | `/api/learning-paths/:slug/progress/:stepId` | Oui — reader+ | Marquer une étape comme complétée |
| `server/api/learning-paths/[slug]/progress.delete.ts` | DELETE | `/api/learning-paths/:slug/progress` | Oui — reader+ | Réinitialiser la progression dans un parcours |

---

## RECHERCHE

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/search/index.get.ts` | GET | `/api/search` | Non | Recherche full-text dans search_index. Params : q, category, tag, page. Utilise tsvector PostgreSQL. |
| `server/api/search/suggestions.get.ts` | GET | `/api/search/suggestions` | Non | Suggestions rapides sur les titres uniquement (5 max, pour autocomplete) |

---

## NEWSLETTER

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/newsletter/subscribe.post.ts` | POST | `/api/newsletter/subscribe` | Non | Inscription newsletter : validation email, création entrée PENDING, envoi email double opt-in |
| `server/api/newsletter/confirm.get.ts` | GET | `/api/newsletter/confirm` | Non | Confirmation double opt-in via token (query param). Passe status à CONFIRMED. Envoie email de bienvenue. |
| `server/api/newsletter/unsubscribe.post.ts` | POST | `/api/newsletter/unsubscribe` | Non | Désinscription via token unique. Passe status à UNSUBSCRIBED. |

---

## ANALYTICS

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/analytics/overview.get.ts` | GET | `/api/analytics/overview` | Oui — admin | KPIs globaux : total articles, vues, utilisateurs, abonnés, commentaires |
| `server/api/analytics/traffic.get.ts` | GET | `/api/analytics/traffic` | Oui — admin | Vues par jour sur une période. Param : days (défaut 30). Lit article_views_daily. |
| `server/api/analytics/top-articles.get.ts` | GET | `/api/analytics/top-articles` | Oui — admin | Top articles par vues et likes. Params : period (7d/30d/90d/all), limit |
| `server/api/analytics/referrers.get.ts` | GET | `/api/analytics/referrers` | Oui — admin | Sources de trafic groupées et comptées |
| `server/api/analytics/articles/[id].get.ts` | GET | `/api/analytics/articles/:id` | Oui — author+ | Stats détaillées d'un article : vues totales, courbe journalière, likes, favoris, commentaires |

---

## CHANGELOG PUBLIC

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/changelog/index.get.ts` | GET | `/api/changelog` | Non | Liste paginée des entrées de changelog, tri chronologique décroissant |

---

## ADMINISTRATION — UTILISATEURS

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/admin/users/index.get.ts` | GET | `/api/admin/users` | Oui — admin | Liste paginée de tous les utilisateurs avec filtres (rôle, statut, date) |
| `server/api/admin/users/[id]/index.get.ts` | GET | `/api/admin/users/:id` | Oui — admin | Profil complet admin : données, articles, commentaires, activité |
| `server/api/admin/users/[id]/role.patch.ts` | PATCH | `/api/admin/users/:id/role` | Oui — admin | Changer le rôle d'un utilisateur. Interdit de rétrograder le dernier admin. |
| `server/api/admin/users/[id]/ban.patch.ts` | PATCH | `/api/admin/users/:id/ban` | Oui — admin | Bannir un utilisateur — isBanned: true, révoque toutes ses sessions |
| `server/api/admin/users/[id]/unban.patch.ts` | PATCH | `/api/admin/users/:id/unban` | Oui — admin | Lever le bannissement |

---

## ADMINISTRATION — ARTICLES

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/admin/articles/index.get.ts` | GET | `/api/admin/articles` | Oui — author+ | Tous les articles tous statuts confondus (drafts inclus), avec filtres avancés |
| `server/api/admin/articles/[id]/revisions.get.ts` | GET | `/api/admin/articles/:id/revisions` | Oui — author+ | 5 dernières révisions d'un article |
| `server/api/admin/articles/[id]/revisions/restore.post.ts` | POST | `/api/admin/articles/:id/revisions/restore` | Oui — author+ | Restaurer une révision (sauvegarde l'état courant avant restauration) |

---

## ADMINISTRATION — COMMENTAIRES

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/admin/comments/index.get.ts` | GET | `/api/admin/comments` | Oui — admin | Tous les commentaires avec filtres (status, article, user, date), paginés |
| `server/api/admin/comments/[id]/approve.patch.ts` | PATCH | `/api/admin/comments/:id/approve` | Oui — admin | Approuver un commentaire. Notifie auteur de l'article + auteur du commentaire parent si réponse. |
| `server/api/admin/comments/[id]/reject.patch.ts` | PATCH | `/api/admin/comments/:id/reject` | Oui — admin | Rejeter un commentaire |
| `server/api/admin/comments/[id]/spam.patch.ts` | PATCH | `/api/admin/comments/:id/spam` | Oui — admin | Marquer comme spam |
| `server/api/admin/comments/[id]/index.delete.ts` | DELETE | `/api/admin/comments/:id` | Oui — admin | Supprimer définitivement (supprime les réponses en cascade) |
| `server/api/admin/comments/bulk.post.ts` | POST | `/api/admin/comments/bulk` | Oui — admin | Actions en lot : body `{ ids: number[], action: approve/reject/spam/delete }` |

---

## ADMINISTRATION — NEWSLETTER

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/admin/newsletter/subscribers/index.get.ts` | GET | `/api/admin/newsletter/subscribers` | Oui — admin | Liste paginée des abonnés avec filtres. Param export=csv pour export |
| `server/api/admin/newsletter/subscribers/[id].delete.ts` | DELETE | `/api/admin/newsletter/subscribers/:id` | Oui — admin | Supprimer définitivement un abonné |
| `server/api/admin/newsletter/campaigns/index.get.ts` | GET | `/api/admin/newsletter/campaigns` | Oui — admin | Toutes les campagnes avec statut, date, destinataires |
| `server/api/admin/newsletter/campaigns/index.post.ts` | POST | `/api/admin/newsletter/campaigns` | Oui — admin | Créer une campagne en statut DRAFT |
| `server/api/admin/newsletter/campaigns/[id]/index.patch.ts` | PATCH | `/api/admin/newsletter/campaigns/:id` | Oui — admin | Modifier une campagne DRAFT ou SCHEDULED |
| `server/api/admin/newsletter/campaigns/[id]/send.post.ts` | POST | `/api/admin/newsletter/campaigns/:id/send` | Oui — admin | Envoyer immédiatement aux abonnés CONFIRMED. Envoi asynchrone par lots de 50. |
| `server/api/admin/newsletter/campaigns/[id]/schedule.post.ts` | POST | `/api/admin/newsletter/campaigns/:id/schedule` | Oui — admin | Planifier l'envoi d'une campagne |
| `server/api/admin/newsletter/campaigns/[id]/test.post.ts` | POST | `/api/admin/newsletter/campaigns/:id/test` | Oui — admin | Envoyer la campagne uniquement à l'email de l'admin pour prévisualisation |

---

## ADMINISTRATION — CATÉGORIES & TAGS

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/admin/categories/index.post.ts` | POST | `/api/admin/categories` | Oui — admin | Créer une catégorie. Génère le slug automatiquement si non fourni. |
| `server/api/admin/categories/[id]/index.patch.ts` | PATCH | `/api/admin/categories/:id` | Oui — admin | Modifier une catégorie |
| `server/api/admin/categories/[id]/index.delete.ts` | DELETE | `/api/admin/categories/:id` | Oui — admin | Supprimer une catégorie (les articles gardent leurs autres catégories) |
| `server/api/admin/tags/index.post.ts` | POST | `/api/admin/tags` | Oui — admin | Créer un tag |
| `server/api/admin/tags/[id]/index.patch.ts` | PATCH | `/api/admin/tags/:id` | Oui — admin | Modifier un tag |
| `server/api/admin/tags/[id]/index.delete.ts` | DELETE | `/api/admin/tags/:id` | Oui — admin | Supprimer un tag |
| `server/api/admin/tags/merge.post.ts` | POST | `/api/admin/tags/merge` | Oui — admin | Fusionner deux tags : réassigne les articles du tag source vers le tag cible |

---

## ADMINISTRATION — MÉDIAS

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/admin/media/index.get.ts` | GET | `/api/admin/media` | Oui — author+ | Liste paginée des médias avec filtres (type, article, date) |
| `server/api/admin/media/upload.post.ts` | POST | `/api/admin/media/upload` | Oui — author+ | Upload fichier(s). Valide type MIME, convertit en WebP via sharp, génère nom unique, sauvegarde sur disque, insère en DB. |
| `server/api/admin/media/[id]/index.patch.ts` | PATCH | `/api/admin/media/:id` | Oui — author+ | Modifier les métadonnées (altText, article associé) |
| `server/api/admin/media/[id]/index.delete.ts` | DELETE | `/api/admin/media/:id` | Oui — author+ | Supprimer le fichier physique + l'entrée DB |

---

## ADMINISTRATION — PARCOURS & SÉRIES

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/admin/learning-paths/index.post.ts` | POST | `/api/admin/learning-paths` | Oui — admin | Créer un parcours d'apprentissage |
| `server/api/admin/learning-paths/[id]/index.patch.ts` | PATCH | `/api/admin/learning-paths/:id` | Oui — admin | Modifier un parcours |
| `server/api/admin/learning-paths/[id]/index.delete.ts` | DELETE | `/api/admin/learning-paths/:id` | Oui — admin | Supprimer un parcours et ses étapes |
| `server/api/admin/learning-paths/[id]/steps.post.ts` | POST | `/api/admin/learning-paths/:id/steps` | Oui — admin | Ajouter un article comme étape dans un parcours |
| `server/api/admin/learning-paths/[id]/steps/reorder.patch.ts` | PATCH | `/api/admin/learning-paths/:id/steps/reorder` | Oui — admin | Réordonner les étapes. Body : `{ steps: [{ id, order }] }` |
| `server/api/admin/learning-paths/[id]/steps/[stepId].delete.ts` | DELETE | `/api/admin/learning-paths/:id/steps/:stepId` | Oui — admin | Retirer une étape d'un parcours |
| `server/api/admin/series/index.post.ts` | POST | `/api/admin/series` | Oui — admin | Créer une série |
| `server/api/admin/series/[id]/index.patch.ts` | PATCH | `/api/admin/series/:id` | Oui — admin | Modifier une série |
| `server/api/admin/series/[id]/index.delete.ts` | DELETE | `/api/admin/series/:id` | Oui — admin | Supprimer une série (articles : seriesId → null) |

---

## ADMINISTRATION — CHANGELOG

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/admin/changelog/index.post.ts` | POST | `/api/admin/changelog` | Oui — admin | Créer une entrée de changelog |
| `server/api/admin/changelog/[id]/index.patch.ts` | PATCH | `/api/admin/changelog/:id` | Oui — admin | Modifier une entrée |
| `server/api/admin/changelog/[id]/index.delete.ts` | DELETE | `/api/admin/changelog/:id` | Oui — admin | Supprimer une entrée |

---

## ADMINISTRATION — PARAMÈTRES

| Fichier | Méthode | URL | Auth | Description |
|---------|---------|-----|------|-------------|
| `server/api/admin/settings/index.get.ts` | GET | `/api/admin/settings` | Oui — admin | Configuration générale du blog |
| `server/api/admin/settings/index.patch.ts` | PATCH | `/api/admin/settings` | Oui — admin | Mettre à jour la configuration |

---

## TOTAL : ~95 routes API
