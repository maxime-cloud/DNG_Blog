## Commands

```bash
pnpm dev          # Serveur de développement (http://localhost:3000)
pnpm build        # Build de production
pnpm preview      # Prévisualisation du build de production
pnpm lint         # ESLint
pnpm typecheck    # Vérification TypeScript

# Prisma
pnpm dlx prisma migrate dev --name <nom>   # Créer et appliquer une migration
pnpm dlx prisma migrate deploy             # Appliquer les migrations en production
pnpm dlx prisma generate                   # Régénérer le client Prisma
pnpm dlx prisma studio                     # Interface visuelle de la base de données
```
