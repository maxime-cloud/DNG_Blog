# Design System — DNGBlog

Ne jamais modifier le design existant sans demande explicite. Respecter strictement les conventions ci-dessous.

---

## ⚠️ Dark mode UNIQUEMENT (règle fondatrice)

L'application n'a **plus de light mode**. `colorMode` est forcé à `dark` dans `nuxt.config.ts`
(`preference: 'dark'`, `fallback: 'dark'`), aucun toggle de thème.

Conséquences **obligatoires** :

- **JAMAIS** le préfixe `dark:` dans les classes Tailwind — toutes les classes sont en base.
- **JAMAIS** doubler les classes (`bg-CustomLight dark:bg-CustomColor-900`) → uniquement `bg-CustomColor-900`.
- **JAMAIS** `bg-CustomLight` ni aucune couleur de fond « light ».
- Les **textes sont clairs par défaut** (`text-white`, `text-[#F3F4F6]`, `text-[#F3F4F6]/70`, `zinc-500`).
- **JAMAIS** de couleur de texte sombre en base (ex. `text-[#0F0F0F]`, `rgb(15,15,15)`) — invisible sur fond noir.

### CSS dans les blocs `<style>` / `<style scoped>` (prose, contenu rendu, etc.)

Même règle qu'en Tailwind, appliquée au CSS brut :

- Les couleurs (texte, bordures, fonds) doivent être **claires/dark par défaut**, directement sur le sélecteur.
- **JAMAIS** gater la version claire derrière `.dark .selector { ... }` — la classe `.dark` ne doit pas
  être une condition. Mettre les bonnes valeurs (claires) directement sur `.selector`.
- **Anti-pattern interdit** (a causé l'invisibilité du markdown) :
  ```css
  .prose :deep(p) {
    color: rgb(15, 15, 15);
  } /* ❌ texte sombre en base */
  .dark .prose :deep(p) {
    color: rgba(243, 244, 246, 0.85);
  } /* ❌ clair gaté sur .dark */
  ```
  **Correct** :
  ```css
  .prose :deep(p) {
    color: rgba(243, 244, 246, 0.85);
  } /* ✅ clair en base, pas de .dark */
  ```
- Palette CSS de référence : texte `rgba(243,244,246,0.85)`, titres/gras `#ffffff`,
  bordures/dash `rgba(229,231,235,0.27)`, fonds subtils `rgba(255,255,255,0.04→0.08)`.
- Effets `:hover` : viser un **contraste net**. Éviter fond blanchâtre + icône blanche
  (blob illisible). Préférer une teinte primary verte :
  `background: oklch(62.7% 0.194 149.214 / 0.2)` + `color: #fff`.

---

## Identité visuelle

**Style** : Minimaliste tech — angles droits, bordures pointillées, ombres 3D multidirectionnelles.  
**Police** : Roboto (définie via `@theme static` dans `main.css`)  
**Border-radius** : Toujours `rounded-none` — aucune exception.

---

## Couleurs

### Variables CSS personnalisées (définies dans `main.css`)

```
--color-CustomColor-900: rgb(10, 10, 10)   // fond (dark only)
--color-dashcolor: #E5E7EB44               // bordures pointillées
```

> **Dark mode uniquement** — `bg-CustomLight` ne doit plus être utilisé. Toujours `bg-CustomColor-900`.

### Palette (dark mode uniquement)

| Usage                 | Valeur                                 |
| --------------------- | -------------------------------------- |
| Fond principal        | `bg-CustomColor-900` (#0A0A0A)         |
| Fond alternatif       | `bg-[#111]`                            |
| Texte principal       | `text-white` / `text-[#FFFFFF]`        |
| Texte secondaire      | `text-[#F3F4F6]/70`                    |
| Texte tertiaire       | `zinc-500`                             |
| Erreurs               | `red-400` / `red-500`                  |
| Accent bleu           | `blue-500`                             |
| Accent vert (primary) | `green` / `oklch(62.7% 0.194 149.214)` |

### Couleurs catégories (OKLCH)

```
Vue.js   : oklch(62.7% 0.194 149.214)
Tailwind : oklch(54.6% 0.245 262.881)
CSS      : oklch(70.7% 0.165 254.624)
```

### Config (`app.config.ts`)

- Primary : `green`
- Secondary : `blue`
- Neutral : `CustomColor`

---

## Ombres (pattern répété partout)

```
shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)]
shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)]
shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]
```

Crée un effet 3D avec ombres multidirectionnelles. Utilisé sur : cartes, inputs, boutons, formulaires.

Ombre nav au scroll : `rgba(0,0,0,0.16) 0px 3px 6px, rgba(0,0,0,0.23) 0px 3px 6px`

---

## Bordures

- Épaisseur : `border-[0.1px]` (très fine)
- Style : `border-dashed` (sections, header par défaut), `border-solid` (header au scroll)
- Couleur : `border-dashcolor`, `border-dashcolor/50` (parfois `border-primary/30` en accent)

---

## Pattern de carte / conteneur (réutiliser tel quel)

```html
class="bg-CustomColor-900 border-[0.1px] border-dashcolor/50
shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)]
shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)] rounded-none"
```

Utilisé dans : `ArticleCard`, `LoginForm`, `RegisterForm`, `ForgotForm`, `ResetForm`, `CUButton`, `CUInput`, `NewsLetter`.

---

## Composants custom (préfixe CU)

### `CUButton` (wrapper UButton)

```
rounded-none
border-[0.1px] border-dashcolor/50
shadow triple (voir ci-dessus)
hover:bg-primary
```

### `CUInput` (wrapper UInput)

```
rounded-none
bg-CustomColor-900
border-dashcolor/50
shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]
placeholder-[#F3F4F6]/60
```

**Toujours utiliser `CUButton` et `CUInput` à la place de `UButton` et `UInput` directement.**

---

## Layout de page (structure standard)

```html
<NoAdminPage>
  <BaseLayaoutContent>
    <!-- contenu -->
  </BaseLayaoutContent>
</NoAdminPage>
```

Pour les pages de formulaire (auth) :

```html
<NoAdminPage>
  <BaseLayaoutContent>
    <div class="flex justify-center items-center py-10 min-h-screen">
      <FormComponent />
    </div>
  </BaseLayaoutContent>
</NoAdminPage>
```

---

## Typographie

| Élément       | Classes                                               |
| ------------- | ----------------------------------------------------- |
| Hero H1       | `text-[24px] sm:text-[32px] lg:text-[40px] font-bold` |
| Header H1     | `text-xl lg:text-2xl font-semibold`                   |
| Titre section | `text-[24px] sm:text-[32px] lg:text-[38px] font-bold` |
| H2 formulaire | `text-3xl font-bold`                                  |
| H3 carte      | `text-2xl font-semibold`                              |

---

## Espacements

- Container global : `max-w-7xl`
- Padding horizontal : `px-4` (mobile), `px-8` (desktop)
- Cartes : `p-6` ou `p-8`
- Sections : `pt-20 mb-10 px-4`
- Champs formulaire : `mb-6`

---

## Backgrounds spéciaux

### `.bgHero` (Hero section — défini dans `main.css`)

- `#111` avec points `radial-gradient(circle, #555 2px, transparent 1px)` 22x22px + fade elliptique vers `#111`
  (seul le rendu dark s'applique — light mode supprimé).

### `.bgCategorie`

- Même structure que `.bgHero`, rendu dark uniquement.

**Ne pas recréer ces classes inline — toujours utiliser les classes CSS définies.**

---

## Animations

### Carousels catégories (CSS pur, `main.css`)

- `scrolling` : de gauche à droite, 20s linear infinite
- `scrollingRight` : de droite à gauche, 20s linear infinite
- Pause au hover : `animation-play-state: paused`

### Transitions

- Header au scroll : `transition-all duration-300` + `backdrop-blur-sm`
- Hover cartes : `transition hover:border-blue-500/50`
- Durée standard : 300ms

---

## Dark mode

- `colorMode` forcé à `dark` (cf. section « Dark mode UNIQUEMENT » en tête de fichier).
- **JAMAIS** doubler les classes ni utiliser `dark:` — fond toujours `bg-CustomColor-900`.
- Header, footer et toutes les sections sont en dark uniquement.

---

## Header

- Fixe (`fixed top-0`), `z-50`
- Hauteur : `h-12 lg:h-16`
- Fond : `bg-CustomColor-900`
- Border bottom dashed par défaut → solid + shadow + `backdrop-blur-sm` au scroll (y >= 300px)
- Max-width interne : `max-w-7xl`

---

## Modales

```
overlay: 'bg-CustomColor-900/60 backdrop-blur-xs'
content: 'ring-0 flex justify-center bg-transparent items-center'
```

> Attention : la classe custom est `CustomColor` (C/C majuscules). `bg-customcolor-900`
> (minuscules) n'existe pas en Tailwind → fond transparent silencieux.

---

## Règles absolues

1. **Dark mode uniquement** : jamais `dark:`, jamais doubler les classes, jamais `bg-CustomLight`, jamais de texte sombre en base (Tailwind **et** CSS `<style>`).
2. `rounded-none` partout — jamais de border-radius
3. Toujours les 3 ombres directionnelles sur les éléments en relief
4. `border-dashed border-[0.1px]` pour les délimitations de sections
5. Toujours `CUButton` et `CUInput`, jamais `UButton`/`UInput` directement
6. Responsive mobile-first : défaut → `sm:` → `md:` → `lg:`
7. Pas de couleurs hardcodées autres que celles de la palette — utiliser les variables CSS
8. CSS `<style>` : couleurs claires **directement** sur le sélecteur, jamais gatées sur `.dark`
