# Step 01: Analyze

**Task:** Verifier pages non-admin, recherche command-palette, profils createurs avec stats, stats auteur privees
**Started:** 2026-06-05T20:48:56Z

---

## Context Discovery

_Findings will be appended here as exploration progresses..._

## Findings (economy scan)

### Public pages — accessibility
Aucune page publique n'a `middleware: 'auth'` → toutes accessibles aux non-admin/anonymes. ✓
Pages complètes & correctes : index, articles, article/[slug], categories/[slug], training/*, series/*, about, changelog, tags/[slug], profil/[username], search.

**BUG bloquant** : `app/pages/categories/index.vue` = stub ("fsdq"). À reconstruire.
Mineur : `changelog.vue` garde des classes light mortes (`bg-green-50` + `bg-green-950`).

### Header (`app/components/Header.vue`)
- Bouton recherche (l.34) : aucune action → brancher UCommandPalette dans UModal.
- UPopover content (l.44) : pas de `bg` → fond transparent. Ajouter `bg-CustomColor-900`.
- Boutons "Compte"/"Favoris" (l.56-70) : aucun `to` → ne naviguent pas. Cibles : `/users/me`, `/users/favorite`.
- UModals overlay : typo `bg-customcolor-900/60` (classe inexistante) → `bg-CustomColor-900/60`.
- CUButton fait fall-through des attrs (`to`, `@click`) vers UButton. ✓

### Profil public (`profil/[username].vue` + `api/users/[username].get.ts`)
Existe, design OK. Manque : stats. Endpoint ne renvoie que `_count.articles`.
À ajouter (author/admin) : totaux (articles/vues/likes), articles populaires, dernière activité.

### Stats auteur privées
- Util serveur : `requireRole(event, 'author')` (author+admin), `requireAuth`, `percentChange`.
- Modèles : Article(authorId String, status, views[], likes[], comments[], publishedAt), ArticleView(viewedAt).
- Réutilisable : `AdminStatsCard`, `AdminChartLine` (pas de garde interne).
- Plan : page `/users/me/stats` (middleware `author`) + endpoint `api/users/me/stats.get.ts` scoping `authorId = session.user.id`.

### Baseline
`pnpm typecheck` → exit 0 (propre).

## Acceptance Criteria
- [ ] AC1: `categories/index.vue` liste les catégories (design conforme).
- [ ] AC2: Bouton recherche navbar ouvre une command palette branchée sur l'API search.
- [ ] AC3: Popover compte a un fond aux couleurs de l'app ; Compte→/users/me, Favoris→/users/favorite.
- [ ] AC4: Profil public auteur affiche stats (totaux, articles populaires, activité).
- [ ] AC5: Page `/users/me/stats` (author/admin) affiche les stats de l'auteur, scopées à lui seul.
- [ ] AC6: typecheck + lint OK ; api-docs.md à jour.
