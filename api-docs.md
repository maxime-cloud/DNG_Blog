# API Documentation — DNGBlog

---

## Auth

### `GET /api/auth/session`

Returns the current session for the authenticated user.

- **Response:** `{ user, session }` or `null`

---

## Articles

### `GET /api/articles`

Public. Paginated list of published articles with optional filters.

- **Query:** `page`, `limit`, `category` (slug), `tag` (slug), `series` (slug), `search`, `sort` (`latest` | `popular` | `oldest`), `authorId` (user id)
- **Response:** `{ data: Article[], meta: { page, limit, total, totalPages } }`

---

## Categories

### `GET /api/categories`

Public. All categories ordered by name, with published article count.

- **Response:** `{ data: Category[] }` — each item includes `_count.articles`

### `GET /api/categories/:slug`

Public. Single category by slug + paginated published articles.

- **Params:** `slug`
- **Query:** `page`, `limit`
- **Response:** `{ data: { ...category, articles: { data, meta } } }`
- **Errors:** `404` if slug not found

---

## Tags

### `GET /api/tags`

Public. All tags ordered by article count desc.

- **Response:** `{ data: Tag[] }` — each item includes `_count.articles`

### `GET /api/tags/:slug`

Public. Single tag by slug + paginated published articles.

- **Params:** `slug`
- **Query:** `page`, `limit`
- **Response:** `{ data: { ...tag, articles: { data, meta } } }`
- **Errors:** `404` if slug not found

---

## Series

### `GET /api/series`

Public. All published series ordered by createdAt desc.

- **Response:** `{ data: Series[] }` — each item includes `articlesCount` and `firstArticleSlug`

### `GET /api/series/:slug`

Public. Single published series by slug with ordered published articles.

- **Params:** `slug`
- **Response:** `{ data: { ...series, articles: { id, slug, title, publishedAt }[] } }`
- **Errors:** `404` if slug not found or not published

---

## Learning Paths

### `GET /api/learning-paths`

Public. All published learning paths with step count. Authenticated users also receive `userProgress.completedSteps`.

- **Response:** `{ data: LearningPath[] }`

### `GET /api/learning-paths/:slug`

Public. Single published learning path with steps (ordered) and article info per step. Authenticated users receive `completed` boolean per step and overall `userProgress` summary.

- **Params:** `slug`
- **Response:** `{ data: { ...path, steps: Step[], userProgress: { completedSteps, totalSteps } | null } }`
- **Errors:** `404` if slug not found or not published

### `POST /api/learning-paths/:slug/progress/:stepId`

Auth required. Mark a step as completed (upsert).

- **Params:** `slug`, `stepId`
- **Response:** `{ success: true }`
- **Errors:** `401` unauthenticated, `400` invalid stepId, `404` path or step not found

### `DELETE /api/learning-paths/:slug/progress`

Auth required. Reset all progress for the authenticated user on this path.

- **Params:** `slug`
- **Response:** `{ success: true }`
- **Errors:** `401` unauthenticated, `404` path not found

---

## Admin — Learning Paths

### `GET /api/admin/learning-paths`

Admin only. All learning paths (published and drafts) with step count and user count.

- **Response:** `{ data: [{ id, title, slug, difficulty, isPublished, _count: { steps, userProgress } }] }`
- **Errors:** `401`, `403`

### `GET /api/admin/learning-paths/:id`

Admin only. Single learning path by ID with all steps and article info.

- **Params:** `id` (integer)
- **Response:** `{ data: { id, title, slug, difficulty, isPublished, steps: [{ id, stepOrder, stepTitle, article: { id, title, slug } }] } }`
- **Errors:** `401`, `403`, `404` path not found

### `POST /api/admin/learning-paths`

Admin only. Create a new learning path.

- **Body:** `{ title, description?, difficulty, coverImageUrl?, isPublished? }`
- **Response:** created path object
- **Errors:** `400` validation, `401`, `403`, `409` slug conflict

### `PATCH /api/admin/learning-paths/:id`

Admin only. Partial update of a learning path (all fields optional).

- **Body:** `{ title?, slug?, description?, difficulty?, coverImageUrl?, isPublished? }`
- **Errors:** `400` invalid difficulty, `401`, `403`, `404`

### `DELETE /api/admin/learning-paths/:id`

Admin only. Delete a path and all its steps (cascade). Does not delete linked articles.

- **Errors:** `401`, `403`, `404`

### `POST /api/admin/learning-paths/:id/steps`

Admin only. Add an article as a step to a path.

- **Body:** `{ articleId: number, stepOrder: number, stepTitle?: string }`
- **Errors:** `400` invalid body, `401`, `403`, `404` path not found

### `PATCH /api/admin/learning-paths/:id/steps/reorder`

Admin only. Reorder steps in a path via a transaction.

- **Body:** `{ steps: [{ id: number, stepOrder: number }] }`
- **Errors:** `400` invalid body, `401`, `403`, `404` step not found

### `DELETE /api/admin/learning-paths/:id/steps/:stepId`

Admin only. Remove a step from a path. Does not delete the linked article.

- **Errors:** `401`, `403`, `404`

---

## Admin — Newsletter Campaigns

### `POST /api/admin/newsletter/campaigns`

Admin only. Create a new campaign with status `DRAFT`.

- **Body:** `{ subject: string, bodyHtml: string }`
- **Response:** Created `NewsletterCampaign` object
- **Errors:** `400` missing subject or bodyHtml, `401` unauthenticated, `403` insufficient role

### `PATCH /api/admin/newsletter/campaigns/:id`

Admin only. Update subject and/or bodyHtml of a campaign. Only allowed when status is `DRAFT` or `SCHEDULED`.

- **Params:** `id` (integer)
- **Body:** `{ subject?: string, bodyHtml?: string }`
- **Response:** Updated `NewsletterCampaign` object
- **Errors:** `400` invalid id or wrong status, `404` campaign not found, `401`, `403`

### `POST /api/admin/newsletter/campaigns/:id/send`

Admin only. Send campaign immediately to all `CONFIRMED` subscribers. Sets status to `SENT`.

- **Params:** `id` (integer)
- **Response:** `{ success: true, recipientCount: number }`
- **Errors:** `400` invalid id or campaign not in DRAFT/SCHEDULED status, `404` campaign not found, `401`, `403`

### `POST /api/admin/newsletter/campaigns/:id/schedule`

Admin only. Schedule a campaign for future sending. Sets status to `SCHEDULED`.

- **Params:** `id` (integer)
- **Body:** `{ scheduledAt: string (ISO date, must be in the future) }`
- **Response:** Updated `NewsletterCampaign` object
- **Errors:** `400` invalid id, missing/invalid/past scheduledAt, `404` campaign not found, `401`, `403`

### `POST /api/admin/newsletter/campaigns/:id/test`

Admin only. Send a test email of the campaign to the authenticated admin's email address.

- **Params:** `id` (integer)
- **Response:** `{ success: true }`
- **Errors:** `400` invalid id, `404` campaign not found, `401`, `403`

---

## Analytics

Tous les endpoints sont **admin only** (`requireRole(event, 'admin')`) sauf `articles/:id` (author ou admin). Erreurs communes : `401`, `403`, `500`.

### `GET /api/analytics/overview`

Compteurs globaux + tendances de la période vs la période précédente.

- **Query:** `days` (1–365, défaut 30) — fenêtre utilisée pour calculer les tendances
- **Response:** `{ totalArticles, totalViews, totalUsers, totalSubscribers, totalComments, totalLikes, totalFavorites, trends: { views, comments, subscribers, users }, days }` — `trends.*` = variation en % (N vs N-1)

### `GET /api/analytics/traffic`

Vues agrégées par jour depuis `ArticleViewDaily`.

- **Query:** `days` (1–365, défaut 30)
- **Response:** `{ data: [{ date, views }], days }`

### `GET /api/analytics/top-articles`

Top articles publiés, triables par vues ou likes.

- **Query:** `period` (`7d` | `30d` | `90d` | `all`, défaut `30d`), `sort` (`views` | `likes`, défaut `views`), `limit` (1–50, défaut 10)
- **Response:** `{ data: [{ id, title, slug, viewsCount, likesCount }], period, sort, limit }`

### `GET /api/analytics/categories`

Répartition des articles publiés par catégorie (catégories non vides uniquement).

- **Response:** `{ data: [{ name, slug, color, count }] }` — trié par `count` desc

### `GET /api/analytics/status`

Distribution des articles par statut éditorial (les 4 statuts, zéro inclus).

- **Response:** `{ data: [{ status, count }] }`

### `GET /api/analytics/comments-trend`

Nombre de commentaires créés par jour (série continue, jours sans commentaire à 0).

- **Query:** `days` (1–365, défaut 30)
- **Response:** `{ data: [{ date, count }], days }`

### `GET /api/analytics/growth`

Nouveaux abonnés newsletter et nouveaux utilisateurs par jour.

- **Query:** `days` (1–365, défaut 30)
- **Response:** `{ subscribers: [{ date, count }], users: [{ date, count }], days }`

### `GET /api/analytics/top-authors`

Auteurs ayant au moins un article publié, classés par vues cumulées.

- **Query:** `limit` (1–50, défaut 5)
- **Response:** `{ data: [{ id, name, image, articlesCount, viewsCount }] }`

### `GET /api/analytics/publications`

Dates de publication des articles, série journalière pour heatmap calendrier.

- **Query:** `days` (30–366, défaut 365)
- **Response:** `{ data: [{ date, count }], days }`

### `GET /api/analytics/referrers`

Top sources de trafic, agrégées par domaine depuis `ArticleView.referrer`.

- **Response:** `{ data: [{ referrer, count }] }`

### `GET /api/analytics/articles/:id`

Author (ses propres articles) ou admin. Stats détaillées d'un article.

- **Params:** `id` (integer)
- **Query:** `days` (défaut 30)
- **Response:** `{ title, slug, totalViews, likesCount, favoritesCount, commentCount, dailyViews: [{ date, views }] }`
- **Errors:** `403` si author non-propriétaire, `404` article introuvable
