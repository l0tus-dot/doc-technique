# Dockerfile et images personnalisées

Un `Dockerfile` décrit les instructions pour assembler une image personnalisée.

## Structure type

```dockerfile
# Image de base
FROM ubuntu:22.04

# Métadonnées
LABEL maintainer="nom@exemple.fr"
LABEL version="1.0"

# Variables disponibles à la construction
ARG DEBIAN_FRONTEND=noninteractive

# Variables d'environnement dans le conteneur
ENV APP_HOME=/app \
    APP_PORT=8080

# Installation de dépendances (une seule couche RUN pour limiter la taille)
RUN apt-get update && apt-get install -y \
    curl \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Répertoire de travail
WORKDIR $APP_HOME

# Copie des fichiers sources
COPY . .

# Exposition du port (documentation, pas de publication automatique)
EXPOSE $APP_PORT

# Commande lancée au démarrage du conteneur
CMD ["nginx", "-g", "daemon off;"]
```

## Construction

```bash
docker build -t <image>:<tag> .                   # construit depuis le répertoire courant
docker build -t <image>:<tag> -f <Dockerfile> .   # Dockerfile à un chemin précis
docker build --no-cache -t <image>:<tag> .         # ignore le cache (utile après mise à jour)
docker build --build-arg VAR=valeur -t <image> .   # passe une variable ARG
```

## Bonnes pratiques

- Regrouper les `RUN apt install` en une seule instruction pour réduire le nombre de couches
- Nettoyer le cache APT dans le même `RUN` : `&& rm -rf /var/lib/apt/lists/*`
- Utiliser `.dockerignore` pour exclure les fichiers inutiles du contexte de build
- Préférer les images officielles et les tags versionnés plutôt que `:latest`

## Enregistrer un conteneur modifié

Après avoir modifié un conteneur manuellement (installation de paquets, configuration…), il est possible de figer son état dans une nouvelle image — à réserver aux tests et snapshots ponctuels, un `Dockerfile` restant préférable pour toute image reproductible ou partagée :

```bash
docker commit <conteneur> <nouvelle-image>
docker commit -m "Description du changement" -a "Auteur" <conteneur> <nouvelle-image>:<tag>
```

!!! note "Nom d'image en minuscules"
    `docker commit` refuse un nom d'image contenant des majuscules.

## Vérification

```bash
docker images
docker history <image>:<tag>
```

## Dépannage

| Symptôme | Cause probable | Correction |
|---|---|---|
| `docker commit` refusé | Nom d'image contenant une majuscule | Reprendre le nom entièrement en minuscules |
| Image introuvable après `docker build` | Tag oublié ou mauvais contexte de build | Vérifier le chemin passé à `docker build` et que le `Dockerfile` est présent |
