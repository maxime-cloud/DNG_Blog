# GEMINI.md — Server API (server/api/)

## Documentation Obligatoire
**OBLIGATOIRE** : Après toute création ou modification d'un endpoint dans ce répertoire, mettre à jour le fichier `api-docs.md` (ou `API_ROUTES.md`) à la racine du projet.

Pour chaque endpoint, documenter :
- **Méthode + Chemin** (ex: `GET /api/auth/session`)
- **Description** : Fonctionnalité de l'endpoint.
- **Requête** : Paramètres (query) ou corps (body) attendus (schéma Zod).
- **Réponse** : Structure de l'objet retourné.
- **Erreurs** : Codes HTTP et messages d'erreur possibles.

## Sécurité
- Vérifier systématiquement la session via `auth.api.getSession(toWebRequest(event))`.
- Valider les rôles utilisateur si nécessaire avant de traiter la requête.
