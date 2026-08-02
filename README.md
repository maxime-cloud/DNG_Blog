# StackTrace

Le blog technique de StackTrace.

<img alt="StackTrace OG" src="/public/OG.png" width="830" height="466">

## 🚀 Installation

1. Clonez le dépôt :
   ```bash
   git clone <votre-url-depot>
   cd DNGBlog
   ```

2. Installez les dépendances :
   ```bash
   pnpm install
   ```

## ⚙️ Configuration

1. Copiez le fichier d'exemple des variables d'environnement :
   ```bash
   cp .env.example .env
   ```
2. Remplissez les variables manquantes dans le fichier `.env` généré.

## 💾 Base de données

Initialisez et migrez la base de données :
```bash
pnpm dlx prisma migrate deploy
pnpm dlx prisma generate
```

## 🛠️ Développement

Lancez le serveur de développement :
```bash
pnpm dev
```

## 🚀 Production

Build de l'application :
```bash
pnpm build
```

Prévisualisation locale du build :
```bash
pnpm preview
```
