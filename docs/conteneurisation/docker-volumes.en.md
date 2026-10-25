# Volumes and persistence

Data written inside a container disappears when it's removed. Volumes let it persist.

## Mount types

| Type | Syntax | Use case |
|---|---|---|
| **Named volume** | `-v volume_name:/path` | Persistent data managed by Docker |
| **Bind mount** | `-v /host/path:/container/path` | Sharing files from the host |
| **tmpfs** | `--tmpfs /path` | Temporary data in RAM |

## Named volumes

```bash
docker volume create <volume>               # creates a volume
docker volume ls                            # lists volumes
docker volume inspect <volume>              # location on the host, metadata
docker volume rm <volume>                   # removes a volume
docker volume prune                         # removes unused volumes
```

## Bind mounts

```bash
# Read/write (default)
docker run -it --name <container> \
  -v /host/path:/container/path \
  <image>

# Read-only
docker run -it --name <container> \
  -v /host/path:/container/path:ro \
  <image>
```

`:ro` mounts the share read-only — any write attempt from the container fails.

## Verification

```bash
docker volume ls
docker volume inspect <volume>
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Write refused inside a mounted volume | Mounted read-only (`:ro`) | Expected behavior; remount without `:ro` if writing is needed |
