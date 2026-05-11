# FRONTEND — Structure et Layout des Pages
# StackTrace Blog — Document de référence pour Claude Code
# Ce fichier décrit le contenu et la position des éléments de chaque page,
# sans mention de couleurs ou de design. Claude Code se base sur le design existant.

---

## COMPOSANTS GLOBAUX

### Navbar (présente sur toutes les pages publiques)
- Logo + nom du site à gauche
- Liens de navigation centrés : Accueil, Articles, Catégories, Parcours, Séries, Apropos
- À droite : icône de recherche, bouton "S'inscrire", bouton "Connexion", toggle dark/light
- Quand connecté : remplacer "S'inscrire" et "Connexion" par avatar + menu dropdown (Mon profil, Mes favoris, Mon historique, Déconnexion). Si admin/author : lien "Administration" dans le dropdown.

### Footer (présent sur toutes les pages publiques)
- Logo + nom du site + courte description du blog
- Liens de navigation groupés par section (Blog, Communauté, Légal)
- Liens réseaux sociaux (GitHub)
- Mention copyright + lien politique de confidentialité
- Lien vers le flux RSS

---

## PAGES PUBLIQUES

---

### `/` — Page d'accueil

**Section Hero (déjà codée)**
- Titre principal avec mots-clés mis en avant visuellement
- Sous-titre descriptif
- Deux boutons CTA côte à côte : "Articles récents" (secondaire) et "Parcourir les articles" (principal avec flèche)
- Fond avec texture de grille de points

**Section "Derniers articles"**
- Titre de section + lien "Voir tous les articles"
- Grille de 6 cartes d'articles (3 colonnes sur desktop, 2 sur tablette, 1 sur mobile)
- Chaque carte contient : image de couverture, badge de catégorie, titre, extrait court, nom de l'auteur avec avatar, date de publication, compteur de vues et de likes

**Section "Catégories"**
- Titre de section
- Grille de toutes les catégories disponibles
- Chaque item : icône, nom de la catégorie, nombre d'articles associés

**Section "Parcours d'apprentissage"**
- Titre de section + lien "Voir tous les parcours"
- Liste horizontale scrollable de 3 cartes de parcours
- Chaque carte : image, titre, niveau de difficulté (badge), nombre d'étapes, description courte

**Section "Séries en cours"**
- Titre de section + lien "Voir toutes les séries"
- 2 à 3 cartes de séries mises en avant
- Chaque carte : image de couverture, titre de la série, nombre d'épisodes, description

**Section Newsletter**
- Titre accrocheur + description de la valeur ajoutée
- Formulaire avec champ prénom, champ email, bouton de soumission
- Mention du double opt-in et de la politique de confidentialité

---

### `/blog` — Liste de tous les articles

**En-tête de page**
- Titre "Articles" + description de la page
- Barre de filtres : dropdown catégorie, dropdown tag, dropdown tri (récent, populaire, tendance)
- Barre de recherche rapide

**Grille d'articles**
- Grille de 9 articles par page (3 colonnes desktop)
- Mêmes cartes que sur la page d'accueil
- Pagination en bas (précédent / numéros / suivant)

---

### `/blog/[slug]` — Page d'un article

**En-tête article**
- Fil d'Ariane (Accueil > Catégorie > Titre article)
- Badges de catégories cliquables
- Titre complet de l'article
- Sous-titre / extrait
- Ligne d'informations : avatar auteur + nom, date de publication, compteur de vues
- Badge "Vérifié le [date] — testé sur [version]" si renseigné
- Sélecteur de distribution Linux (Ubuntu / Fedora / Arch) si l'article contient des commandes multi-distros
- Image de couverture pleine largeur

**Layout deux colonnes (desktop)**
- Colonne principale (gauche, ~70%) : contenu Markdown rendu avec coloration syntaxique, bouton "Copier" sur chaque bloc de code
- Colonne latérale (droite, ~30%) : table des matières sticky avec liens vers les titres H2/H3 de l'article

**Barre d'actions sous le contenu**
- Bouton Like (avec compteur) — connecté requis
- Bouton Favori (icône bookmark) — connecté requis
- Boutons de partage : Twitter/X, LinkedIn, copier le lien

**Navigation série**
- Si l'article fait partie d'une série : bloc de navigation avec article précédent / article suivant dans la série, et liste de tous les épisodes dépliable

**Section "Articles liés"**
- Titre "Vous pourriez aussi aimer"
- 3 cartes d'articles liés (même catégorie/tags)

**Section Commentaires**
- Titre "Commentaires" + compteur
- Si connecté : formulaire de rédaction (textarea Markdown + bouton soumettre)
- Si non connecté : message invitant à se connecter pour commenter
- Liste des commentaires approuvés, triés par date
- Chaque commentaire : avatar + pseudo, date, contenu, bouton like, bouton répondre, bouton signaler
- Réponses imbriquées sous chaque commentaire parent (un niveau)
- Formulaire de réponse inline sous chaque commentaire (toggle au clic sur "Répondre")

---

### `/categories` — Liste des catégories (déjà codée)

**En-tête**
- Titre + description

**Grille des catégories**
- Toutes les catégories en grille
- Chaque carte : icône, nom, description courte, nombre d'articles

---

### `/categories/[slug]` — Articles d'une catégorie

**En-tête**
- Icône + nom de la catégorie + description
- Nombre total d'articles dans cette catégorie

**Grille d'articles**
- Même grille que `/blog` avec pagination
- Filtres : tag, tri

---

### `/tags/[slug]` — Articles d'un tag

**En-tête**
- Nom du tag + nombre d'articles associés

**Grille d'articles**
- Même grille que `/blog` avec pagination

---

### `/series` — Liste des séries

**En-tête**
- Titre + description

**Grille des séries**
- Grille de cartes de séries
- Chaque carte : image, titre, description, nombre d'épisodes, statut (en cours / terminée)

---

### `/series/[slug]` — Page d'une série

**En-tête**
- Image de couverture
- Titre de la série + description
- Nombre d'épisodes + statut

**Liste des épisodes**
- Liste ordonnée des articles de la série
- Chaque item : numéro d'épisode, titre, extrait, date, durée de lecture estimée
- Indicateur de lecture (si connecté : épisode lu ou non)

---

### `/parcours` — Liste des parcours d'apprentissage

**En-tête**
- Titre + description

**Filtres**
- Filtre par niveau (Débutant, Intermédiaire, Avancé)

**Grille des parcours**
- Grille de cartes
- Chaque carte : image, titre, niveau (badge), nombre d'étapes, description, barre de progression (si connecté et déjà commencé)

---

### `/parcours/[slug]` — Page d'un parcours

**En-tête**
- Image de couverture
- Titre + description
- Badge niveau + nombre d'étapes
- Bouton "Commencer le parcours" ou "Continuer" (si déjà commencé)
- Barre de progression globale (si connecté)

**Liste des étapes**
- Liste ordonnée des articles du parcours
- Chaque item : numéro, titre, extrait, temps de lecture, statut (à faire / fait — si connecté)
- Lien vers l'article

---

### `/recherche` — Page de recherche

**Barre de recherche**
- Champ de recherche centré, prominent, avec icône
- Suggestions temps réel (dropdown au-dessus des résultats)

**Filtres actifs**
- Chips de filtres appliqués (catégorie, tag) avec bouton de suppression individuel
- Bouton "Effacer tous les filtres"

**Résultats**
- Nombre de résultats trouvés + terme recherché
- Liste de résultats (format carte compacte, pas grille) avec le terme en surbrillance dans l'extrait
- Pagination si plus de 10 résultats
- État vide : message + suggestions d'articles populaires

---

### `/changelog` — Historique des mises à jour

**En-tête**
- Titre + description

**Timeline des entrées**
- Liste chronologique verticale
- Chaque entrée : badge type (Feature, Fix, Content, Design), version optionnelle, titre, description, date

---

### `/a-propos` — Page à propos

**Section auteur**
- Photo de profil, nom, titre/rôle
- Bio longue
- Liens GitHub, site

**Section "Ce blog"**
- Description de la philosophie du blog
- Sujets couverts

**Section "Technologies utilisées"**
- Liste des outils et stacks couverts dans les articles

---

### `/auth/login` — Connexion

**Formulaire centré**
- Titre "Connexion"
- Bouton "Continuer avec GitHub" (OAuth)
- Séparateur "ou"
- Champ email
- Champ mot de passe + lien "Mot de passe oublié ?"
- Bouton "Se connecter"
- Lien vers la page d'inscription

---

### `/auth/register` — Inscription

**Formulaire centré**
- Titre "Créer un compte"
- Bouton "Continuer avec GitHub" (OAuth)
- Séparateur "ou"
- Champ nom/pseudo
- Champ email
- Champ mot de passe
- Champ confirmation mot de passe
- Bouton "Créer mon compte"
- Lien vers la page de connexion
- Mention RGPD + lien politique de confidentialité

---

### `/auth/reset-password` — Réinitialisation mot de passe

**Étape 1 — Demande**
- Champ email
- Bouton "Envoyer le lien"
- Message de confirmation après soumission

**Étape 2 — Nouveau mot de passe (depuis le lien email)**
- Champ nouveau mot de passe
- Champ confirmation
- Bouton "Réinitialiser"

---

### `/profil/[username]` — Profil public

**En-tête profil**
- Avatar, nom, pseudo, bio, liens

**Onglets**
- Onglet "Articles" : liste des articles publiés par cet auteur (si author/admin)
- Onglet "Activité" : commentaires récents

---

### `/mon-profil` — Édition du profil (connecté requis)

**Formulaire d'édition**
- Upload avatar
- Champs : nom d'affichage, pseudo, bio, lien GitHub, lien site
- Section changement email (avec confirmation)
- Section changement mot de passe
- Zone danger : bouton "Supprimer mon compte"

---

### `/mes-favoris` — Favoris (connecté requis)

**En-tête**
- Titre + compteur d'articles sauvegardés

**Grille d'articles favoris**
- Même format que `/blog` mais avec bouton de retrait rapide sur chaque carte

---

### `/mon-historique` — Historique (connecté requis)

**En-tête**
- Titre + bouton "Vider l'historique"

**Liste chronologique**
- Articles groupés par date (Aujourd'hui, Cette semaine, Ce mois)
- Format liste compacte : titre, catégorie, date de consultation

---

## PAGES ADMINISTRATION (`/admin/*`)

> Layout admin : sidebar de navigation à gauche, zone de contenu à droite. Navbar simplifiée en haut avec nom de l'admin et bouton déconnexion.

---

### `/admin` — Dashboard

**Ligne de KPIs (4 cartes)**
- Total articles publiés
- Total utilisateurs inscrits
- Total abonnés newsletter confirmés
- Total commentaires en attente

**Graphique de trafic**
- Graphique de lignes : vues par jour sur les 30 derniers jours
- Sélecteur de période (7j, 30j, 90j)

**Deux colonnes**
- Colonne gauche : Top 5 articles (les plus vus ce mois)
- Colonne droite : File de modération (derniers commentaires PENDING avec actions rapides Approuver/Rejeter)

**Activité récente**
- Journal des dernières actions (publications, inscriptions, signalements) en liste chronologique

---

### `/admin/articles` — Gestion des articles

**Barre d'outils**
- Bouton "Nouvel article"
- Filtres : statut (Tous, Brouillon, En révision, Publié, Archivé), catégorie, auteur
- Barre de recherche

**Tableau des articles**
- Colonnes : image miniature, titre, auteur, catégorie, statut (badge), vues, date de création, date de publication, actions
- Actions par ligne : Éditer, Prévisualiser, Archiver/Publier, Supprimer
- Pagination

---

### `/admin/articles/new` — Créer un article

**Layout deux colonnes**
- Colonne principale : champ titre, éditeur Markdown avec prévisualisation split-screen temps réel, toolbar de l'éditeur (bold, italic, code, liens, images)
- Colonne latérale (settings) : statut, catégories (multi-select), tags (multi-select avec création à la volée), série (select + ordre), image de couverture (upload), extrait, date de publication planifiée

**Section SEO (accordéon)**
- Meta title, meta description, URL canonique, image OG

**Section technique (accordéon)**
- Distros Linux ciblées (checkboxes), version tech testée, date de vérification

**Barre d'actions en bas**
- Bouton "Sauvegarder en brouillon", "Enregistrer", "Publier maintenant"

---

### `/admin/articles/[id]/edit` — Éditer un article

- Même layout que la création
- Sélecteur de révision en haut (liste des 5 dernières révisions avec restauration)

---

### `/admin/commentaires` — Modération

**Filtres**
- Statut, article, utilisateur, date

**File de modération**
- Liste des commentaires avec : extrait du commentaire, article concerné, auteur, date, compteur de signalements
- Actions par ligne : Approuver, Rejeter, Spam, Supprimer
- Cases à cocher pour actions en lot + barre d'actions groupées

---

### `/admin/utilisateurs` — Gestion des utilisateurs

**Tableau des utilisateurs**
- Colonnes : avatar, nom, email, rôle (badge), statut (actif/banni), date d'inscription, nb articles, actions
- Actions : voir le profil, changer le rôle, bannir/débannir

---

### `/admin/newsletter` — Gestion newsletter

**Onglet "Abonnés"**
- Compteurs : total, confirmés, désinscrits
- Tableau des abonnés avec filtres + export CSV

**Onglet "Campagnes"**
- Liste des campagnes avec statut, date, destinataires
- Bouton "Nouvelle campagne"
- Éditeur de campagne : objet, corps HTML/texte, boutons planifier / envoyer un test / envoyer

---

### `/admin/categories` — CRUD Catégories & Tags

**Section Catégories**
- Liste des catégories avec actions (éditer, supprimer)
- Formulaire inline de création/édition : nom, slug, description, couleur, icône

**Section Tags**
- Liste des tags avec compteur d'articles
- Actions : éditer, fusionner, supprimer
- Formulaire de création

---

### `/admin/parcours` — Gestion des parcours

**Liste des parcours**
- Tableau avec titre, niveau, nb étapes, statut publié
- Bouton "Nouveau parcours"

**Éditeur de parcours**
- Champs : titre, slug, description, niveau, image, statut
- Liste des étapes avec drag-and-drop pour réordonner
- Ajout d'étapes via recherche d'articles

---

### `/admin/series` — Gestion des séries

**Liste des séries**
- Tableau avec titre, nb épisodes, statut
- Bouton "Nouvelle série"

**Éditeur de série**
- Champs : titre, slug, description, image
- Liste des articles associés avec ordre et drag-and-drop

---

### `/admin/medias` — Galerie des médias

**Barre d'outils**
- Bouton "Uploader des fichiers"
- Filtres : type, article associé, date

**Grille des médias**
- Grille de miniatures avec nom, poids, dimensions au survol
- Actions sur chaque média : copier l'URL, éditer l'alt text, supprimer

---

### `/admin/analytiques` — Statistiques

**Sélecteur de période en haut**

**Graphique de trafic général**
- Vues par jour (graphique lignes)

**Section top articles**
- Tableau des articles les plus vus + les plus likés sur la période

**Section sources de trafic**
- Graphique ou tableau des référents

---

### `/admin/changelog` — Changelog

**Liste des entrées**
- Tableau avec type, titre, version, date
- Bouton "Nouvelle entrée"
- Formulaire : type (Feature/Fix/Content/Design/Perf/Security), version, titre, description

---

### `/admin/parametres` — Paramètres généraux

**Formulaire de configuration**
- Nom du site, description, article mis en avant (sélecteur)
- Nombre d'articles par page
- Seuil de signalement auto des commentaires
- Email de notification admin
- Bouton "Sauvegarder"
