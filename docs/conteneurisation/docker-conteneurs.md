---
description: Cycle de vie complet des images et conteneurs Docker — rechercher, lancer, interagir, arrêter, diagnostiquer.
---

# Images et conteneurs

Docker déjà installé — voir [Installation et concepts](docker-installation.md) pour le vocabulaire image/conteneur/registry.

## Images

### Rechercher et télécharger

```bash
docker search <terme>                       # liste les images disponibles sur Docker Hub
docker search <terme> --filter stars=50     # filtre par popularité minimum
docker search <terme> --limit 5             # limite le nombre de résultats

docker pull <image>                         # télécharge la dernière version (tag :latest)
docker pull <image>:<tag>                   # version précise, ex. ubuntu:22.04
docker pull <image> --platform linux/amd64  # force l'architecture cible
```

### Lister et inspecter

```bash
docker images                        # images locales (alias : docker image ls)
docker images -a                     # inclut les couches intermédiaires
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"  # affichage personnalisé

docker inspect <image>               # configuration complète en JSON
docker inspect <image> --format '{{ .Config.Env }}'  # extrait un champ précis
docker history <image>               # couches qui composent l'image et leur taille
```

### Supprimer

```bash
docker rmi <image>                   # supprime l'image locale
docker rmi <image>:<tag>             # tag précis
docker image prune                   # supprime toutes les images non utilisées (dangling)
docker image prune -a                # supprime toutes les images sans conteneur associé
```

### Exporter / importer une image (sans registry)

```bash
docker tag <image> <image>:<tag>                     # attribue un tag avant export
docker save <image>:<tag> -o <archive>.tar           # export vers un fichier tar
docker load -i <archive>.tar                         # import depuis un fichier tar
```

`save`/`load` sont utiles pour transférer une image vers un hôte sans accès au dépôt d'origine.

## Conteneurs — cycle de vie

### Lancer

```bash
docker run <image>                              # lance et arrête après exécution
docker run -d <image>                           # mode détaché (arrière-plan)
docker run -it <image> /bin/bash               # shell interactif
docker run --name <nom> <image>                 # nommer le conteneur
docker run --rm <image>                         # supprime automatiquement après arrêt
docker run -e VAR=valeur <image>                # variable d'environnement
docker run -e VAR=valeur --env-file .env <image>  # variables depuis un fichier

docker run -d \
  --name <nom> \
  --hostname <fqdn> \               # nom d'hôte interne du conteneur
  --restart unless-stopped \        # redémarre sauf si arrêté manuellement
  -p 8080:80 \                      # port hôte:port conteneur
  -v /chemin/hôte:/chemin/conteneur \
  -e CLE=valeur \
  <image>
```

| Politique `--restart` | Comportement |
|---|---|
| `no` (défaut) | Jamais redémarré |
| `on-failure[:n]` | Redémarre en cas d'erreur, `n` fois max |
| `always` | Toujours redémarré, même après `docker stop` |
| `unless-stopped` | Redémarre sauf si stoppé manuellement — **recommandé en production** |

### Interagir avec un conteneur en cours d'exécution

```bash
docker ps                           # conteneurs actifs
docker ps -a                        # tous les conteneurs, y compris arrêtés
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

docker exec -it <conteneur> /bin/bash   # ouvre un nouveau shell dans le conteneur
docker exec <conteneur> <commande>      # exécute une commande sans shell interactif
docker attach <conteneur>               # se rattache au processus principal du conteneur
```

!!! tip "Détacher sans arrêter"
    Dans un shell interactif (`-it`), ++ctrl+p++ puis ++ctrl+q++ détache la console sans arrêter le conteneur. `exit` en revanche ferme le shell **et** arrête le conteneur si aucun autre processus n'y tourne.

### Arrêter, relancer, supprimer

```bash
docker stop <conteneur>             # envoie SIGTERM puis SIGKILL après 10 s
docker stop -t 30 <conteneur>       # délai personnalisé avant SIGKILL
docker kill <conteneur>             # SIGKILL immédiat
docker restart <conteneur>          # stop + start

docker start <conteneur>            # démarrer un conteneur arrêté
docker start -i <conteneur>         # avec shell interactif

docker pause <conteneur>            # suspend tous les processus (cgroup freeze)
docker unpause <conteneur>

docker rm <conteneur>               # supprime le conteneur (doit être arrêté)
docker rm -f <conteneur>            # force la suppression même si en cours d'exécution
docker container prune              # supprime tous les conteneurs arrêtés
```

!!! danger "Suppression en masse"
    ```bash
    docker rm -f $(docker ps -aq)
    ```
    Supprime **tous** les conteneurs de l'hôte sans distinction. À réserver aux tests volontaires.

### Inspecter et diagnostiquer

```bash
docker logs <conteneur>             # flux stdout/stderr du conteneur
docker logs -f <conteneur>          # suivi en temps réel (tail)
docker logs --tail 50 <conteneur>   # 50 dernières lignes
docker logs --since 1h <conteneur>  # depuis 1 heure

docker inspect <conteneur>          # configuration complète en JSON
docker inspect <conteneur> --format '{{ .State.Status }}'
docker stats                        # CPU, mémoire, I/O de tous les conteneurs en live
docker stats <conteneur>            # restreint à un conteneur
docker top <conteneur>              # processus en cours dans le conteneur
docker diff <conteneur>             # fichiers modifiés depuis le démarrage
docker port <conteneur>             # mappages de ports actifs
```

## Vérification

```bash
docker ps -a
docker images
```

## Dépannage

| Symptôme | Cause probable | Correction |
|---|---|---|
| Le conteneur s'arrête en quittant le shell | Sortie avec `exit` plutôt qu'un détachement | Utiliser ++ctrl+p++ ++ctrl+q++ pour se détacher sans arrêter le conteneur |
| Tous les conteneurs ont disparu | `docker rm $(docker ps -aq)` exécuté sans filtrage | Éviter cette commande telle quelle ; cibler des conteneurs précis ou filtrer avant suppression |
