# Volumes et persistance

Les données écrites dans un conteneur disparaissent à sa suppression. Les volumes permettent de les persister.

## Types de montage

| Type | Syntaxe | Cas d'usage |
|---|---|---|
| **Volume nommé** | `-v nom_volume:/chemin` | Données persistantes gérées par Docker |
| **Bind mount** | `-v /chemin/hôte:/chemin/conteneur` | Partage de fichiers de l'hôte |
| **tmpfs** | `--tmpfs /chemin` | Données temporaires en RAM |

## Volumes nommés

```bash
docker volume create <volume>               # crée un volume
docker volume ls                            # liste les volumes
docker volume inspect <volume>              # emplacement sur l'hôte, métadonnées
docker volume rm <volume>                   # supprime un volume
docker volume prune                         # supprime les volumes non utilisés
```

## Bind mounts

```bash
# Lecture/écriture (défaut)
docker run -it --name <conteneur> \
  -v /chemin/hôte:/chemin/conteneur \
  <image>

# Lecture seule
docker run -it --name <conteneur> \
  -v /chemin/hôte:/chemin/conteneur:ro \
  <image>
```

`:ro` monte le partage en lecture seule — toute tentative d'écriture depuis le conteneur échoue.

## Vérification

```bash
docker volume ls
docker volume inspect <volume>
```

## Dépannage

| Symptôme | Cause probable | Correction |
|---|---|---|
| Écriture refusée dans un volume monté | Montage en lecture seule (`:ro`) | Comportement attendu ; remonter sans `:ro` si l'écriture est nécessaire |
