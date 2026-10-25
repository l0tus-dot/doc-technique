# Portainer et maintenance

## Interface graphique : Portainer

Portainer expose une interface web complète pour gérer les conteneurs, images, volumes et réseaux.

```bash
docker volume create portainer_data

docker run -d \
  --name portainer \
  --restart unless-stopped \
  -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Accès depuis un navigateur : `http://<adresse-ip-serveur>:9000`
Le mot de passe administrateur est défini au premier lancement.

!!! note "Portainer via Compose"
    Portainer s'intègre naturellement dans un `compose.yml` aux côtés des autres services — voir [Docker Compose](docker-compose.md) — ce qui facilite sa mise à jour et sa gestion.

## Nettoyage ciblé

```bash
docker container prune          # conteneurs arrêtés
docker image prune              # images dangling (sans tag ni conteneur associé)
docker image prune -a           # toutes les images non utilisées
docker volume prune             # volumes non rattachés à un conteneur
docker network prune            # réseaux inutilisés
```

## Nettoyage global

```bash
docker system df                # espace occupé par images, conteneurs, volumes
docker system prune             # supprime conteneurs arrêtés + images dangling + réseaux inutilisés
docker system prune -a          # inclut toutes les images non utilisées
docker system prune -a --volumes  # inclut aussi les volumes
```

!!! danger "Irréversible"
    `docker system prune -a --volumes` supprime toutes les données non actives sans confirmation individuelle. À n'utiliser que sur un environnement que l'on est prêt à reconstruire entièrement.

## Désinstallation complète

```bash
docker rm -f $(docker ps -aq)
docker rmi -f $(docker images -q)
docker volume prune -f
sudo apt purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo rm -rf /var/lib/docker /etc/docker
```

!!! danger "Destruction totale"
    Cette séquence supprime **tout** Docker et ses données sur l'hôte. À réserver à une désinstallation complète décidée délibérément, jamais à un retour arrière partiel.

## Vérification

```bash
docker system df
docker ps -a
docker images
docker network ls
docker volume ls
```

## Dépannage

| Symptôme | Cause probable | Correction |
|---|---|---|
| Espace disque toujours occupé après un nettoyage ciblé | Images ou volumes encore référencés par un conteneur arrêté, non couverts par `prune` seul | `docker system df` pour localiser le poste, puis `docker system prune -a --volumes` si tout est bien voué à la suppression |
