# Portainer and maintenance

## Web interface: Portainer

Portainer exposes a full web interface to manage containers, images, volumes and networks.

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

Access from a browser: `http://<server-ip-address>:9000`
The admin password is set the first time you open the interface.

!!! note "Portainer via Compose"
    Portainer fits naturally into a `compose.yml` alongside other services — see [Docker Compose](docker-compose.md) — which makes it easier to update and manage.

## Targeted cleanup

```bash
docker container prune          # stopped containers
docker image prune              # dangling images (no tag, no attached container)
docker image prune -a           # every unused image
docker volume prune             # volumes not attached to any container
docker network prune            # unused networks
```

## Global cleanup

```bash
docker system df                # space used by images, containers, volumes
docker system prune             # removes stopped containers + dangling images + unused networks
docker system prune -a          # includes every unused image
docker system prune -a --volumes  # also includes volumes
```

!!! danger "Irreversible"
    `docker system prune -a --volumes` removes all inactive data with no individual confirmation. Reserve this for an environment you're fully prepared to rebuild from scratch.

## Full uninstall

```bash
docker rm -f $(docker ps -aq)
docker rmi -f $(docker images -q)
docker volume prune -f
sudo apt purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo rm -rf /var/lib/docker /etc/docker
```

!!! danger "Total destruction"
    This sequence removes **everything** Docker-related on the host, data included. Reserve it for a deliberate, complete uninstall, never for a partial rollback.

## Verification

```bash
docker system df
docker ps -a
docker images
docker network ls
docker volume ls
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Disk space still occupied after a targeted cleanup | Images or volumes still referenced by a stopped container, not covered by `prune` alone | `docker system df` to locate what's taking the space, then `docker system prune -a --volumes` if everything there is meant to go |
