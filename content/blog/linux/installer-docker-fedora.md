---
title: "Installer Docker sur Fedora"
description: "Guide d'installation de Docker sur Fedora avec les bonnes pratiques."
category: "linux"
tags: ["docker", "fedora", "linux"]
distros: ["fedora"]
publishedAt: "2025-03-01"
coverImage: ""
author: "admin"
status: "published"
---

Docker est un outil incontournable pour containeriser ses applications et garantir un environnement reproductible quel que soit la machine hôte. Sur Fedora, l'installation diffère légèrement des distributions basées sur Debian, notamment à cause de l'utilisation de DNF comme gestionnaire de paquets. Il est également recommandé de configurer le groupe `docker` pour pouvoir exécuter les commandes sans `sudo`. Ce guide vous accompagne pas à pas pour avoir un environnement Docker fonctionnel sur Fedora en quelques minutes.
