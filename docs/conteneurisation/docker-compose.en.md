# Docker Compose

Docker Compose orchestrates several containers described in a single `compose.yml` file.

## Typical structure

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

!!! tip "Sensitive values in a `.env` file"
    Keep passwords and keys in a `.env` file at the project root (excluded from the repository via `.gitignore`). Compose loads it automatically.

## Compose commands

```bash
docker compose up -d                    # starts every service in the background
docker compose up -d --build            # rebuilds images before starting
docker compose up -d <service>          # starts a single service

docker compose down                     # stops and removes containers + networks
docker compose down -v                  # also removes named volumes
docker compose down --rmi all           # also removes images

docker compose ps                       # service status
docker compose logs -f                  # follows the logs of every service
docker compose logs -f <service>        # restricted to one service

docker compose exec <service> /bin/bash # shell inside one of the project's containers
docker compose restart <service>        # restarts a service

docker compose pull                     # downloads the latest images
docker compose config                   # validates and prints the resolved configuration
```

## Verification

```bash
docker compose ps
docker compose config
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| A Compose project's containers can't reach each other by name | No network declared in `compose.yml` | Declare a shared network under each service's `networks:` section |
