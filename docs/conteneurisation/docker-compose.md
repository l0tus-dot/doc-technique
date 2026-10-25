# Docker Compose

Docker Compose orchestre plusieurs conteneurs décrits dans un fichier `compose.yml`.

## Structure type

```yaml
services:
  web:
    image: nginx:1.25
    container_name: web
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./html:/usr/share/nginx/html:ro
      - ./conf/nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - frontend
    depends_on:
      - db
    environment:
      - TZ=Europe/Paris

  db:
    image: mariadb:10.11
    container_name: db
    restart: unless-stopped
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - frontend
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_DATABASE: ${DB_NAME}
      MARIADB_USER: ${DB_USER}
      MARIADB_PASSWORD: ${DB_PASSWORD}

volumes:
  db_data:

networks:
  frontend:
    driver: bridge
```

!!! tip "Variables sensibles dans un fichier `.env`"
    Placer les mots de passe et clés dans un fichier `.env` à la racine du projet (exclu du dépôt via `.gitignore`). Compose le charge automatiquement.

## Commandes Compose

```bash
docker compose up -d                    # démarre tous les services en arrière-plan
docker compose up -d --build            # reconstruit les images avant de démarrer
docker compose up -d <service>          # démarre un seul service

docker compose down                     # arrête et supprime les conteneurs + réseaux
docker compose down -v                  # supprime aussi les volumes nommés
docker compose down --rmi all           # supprime aussi les images

docker compose ps                       # état des services
docker compose logs -f                  # suivi des logs de tous les services
docker compose logs -f <service>        # restreint à un service

docker compose exec <service> /bin/bash # shell dans un conteneur du projet
docker compose restart <service>        # redémarre un service

docker compose pull                     # télécharge les images les plus récentes
docker compose config                   # valide et affiche la configuration résolue
```

## Vérification

```bash
docker compose ps
docker compose config
```

## Dépannage

| Symptôme | Cause probable | Correction |
|---|---|---|
| Les conteneurs d'un Compose ne se joignent pas par nom | Réseau non déclaré dans `compose.yml` | Déclarer un réseau commun dans la section `networks:` de chaque service |
