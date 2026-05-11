# Design System — DNGBlog

Ne jamais modifier le design existant sans demande explicite. Respecter strictement les conventions ci-dessous.

---

## Identité visuelle

**Style** : Minimaliste tech — angles droits, bordures pointillées, ombres 3D multidirectionnelles.  
**Police** : Roboto (définie via `@theme static` dans `main.css`)  
**Border-radius** : Toujours `rounded-none` — aucune exception.

---

## Couleurs

### Variables CSS personnalisées (définies dans `main.css`)
```
--color-CustomColor-900: rgb(10, 10, 10)   // fond dark mode
--color-CustomLight: #FFF                   // fond light mode
--color-dashcolor: #E5E7EB44               // bordures pointillées dark
```

### Palette exacte
| Usage | Light | Dark |
|-------|-------|------|
| Fond principal | `#FFF` (CustomLight) | `#0A0A0A` (CustomColor-900) |
| Fond alternatif | `#EEE` | `#111` |
| Texte principal | `#0F0F0F` | `#FFFFFF` |
| Texte secondaire | `#0F0F0F/70` | `#F3F4F6/70` |
| Texte tertiaire | `zinc-500` | `zinc-500` |
| Erreurs | `red-400` / `red-500` | idem |
| Accent bleu | `blue-500` | idem |

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
- Couleur light : `border-CustomColor-900/60`, `border-primary/30`
- Couleur dark : `border-dashcolor`, `border-dashcolor/50`

---

## Pattern de carte / conteneur (réutiliser tel quel)

```html
class="bg-CustomLight dark:bg-CustomColor-900
       border-[0.1px] border-primary/30 dark:border-dashcolor/50
       shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)]
       shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)]
       shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]
       rounded-none"
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
bg-CustomLight dark:bg-CustomColor-900
border-CustomColor-900/30 dark:border-dashcolor/50
shadow-[-6px_7px_24px_0px_rgb(0,0,0,0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0,0.51)]
placeholder-[#0F0F0F]/40 dark:placeholder-[#F3F4F6]/60
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

| Élément | Classes |
|---------|---------|
| Hero H1 | `text-[24px] sm:text-[32px] lg:text-[40px] font-bold` |
| Header H1 | `text-xl lg:text-2xl font-semibold` |
| Titre section | `text-[24px] sm:text-[32px] lg:text-[38px] font-bold` |
| H2 formulaire | `text-3xl font-bold` |
| H3 carte | `text-2xl font-semibold` |

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
- Light : `#EEE` avec points `radial-gradient(circle, #888 2px, transparent 1px)` 22x22px + noise SVG + fade elliptique
- Dark : `#111` avec points `#555` + fade elliptique vers `#111`

### `.bgCategorie`
- Light : `#DEDEDE` avec même structure que bgHero

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

- Basé sur `colorMode` de Nuxt
- Toujours doubler les classes : `bg-CustomLight dark:bg-CustomColor-900`
- Le header, footer, et toutes les sections doivent supporter les deux modes

---

## Header

- Fixe (`fixed top-0`), `z-50`
- Hauteur : `h-12 lg:h-16`
- Fond : `bg-CustomLight dark:bg-CustomColor-900`
- Border bottom dashed par défaut → solid + shadow + `backdrop-blur-sm` au scroll (y >= 300px)
- Max-width interne : `max-w-7xl`

---

## Modales

```
overlay: 'bg-CustomColor-900/60 dark:bg-CustomColor-900/60 backdrop-blur-xs'
content: 'ring-0 flex justify-center bg-transparent items-center'
```

---

## Règles absolues

1. `rounded-none` partout — jamais de border-radius
2. Toujours les 3 ombres directionnelles sur les éléments en relief
3. `border-dashed border-[0.1px]` pour les délimitations de sections
4. Toujours `CUButton` et `CUInput`, jamais `UButton`/`UInput` directement
5. Responsive mobile-first : défaut → `sm:` → `md:` → `lg:`
6. Pas de couleurs hardcodées autres que celles de la palette — utiliser les variables CSS
