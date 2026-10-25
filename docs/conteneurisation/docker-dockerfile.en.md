# Dockerfile and custom images

A `Dockerfile` describes the instructions for assembling a custom image.

## Typical structure

```dockerfile
# Base image
FROM ubuntu:22.04

# Metadata
LABEL maintainer="name@example.com"
LABEL version="1.0"

# Variables available at build time
ARG DEBIAN_FRONTEND=noninteractive

# Environment variables inside the container
ENV APP_HOME=/app \
    APP_PORT=8080

# Installing dependencies (a single RUN layer to limit size)
RUN apt-get update && apt-get install -y \
    curl \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Working directory
WORKDIR $APP_HOME

# Copy source files
COPY . .

# Expose the port (documentation only, no automatic publishing)
EXPOSE $APP_PORT

# Command run when the container starts
CMD ["nginx", "-g", "daemon off;"]
```

## Building

```bash
docker build -t <image>:<tag> .                   # builds from the current directory
docker build -t <image>:<tag> -f <Dockerfile> .   # Dockerfile at a specific path
docker build --no-cache -t <image>:<tag> .         # ignores the cache (useful after an update)
docker build --build-arg VAR=value -t <image> .    # passes an ARG variable
```

## Best practices

- Group `RUN apt install` instructions into a single layer to reduce their number
- Clean the APT cache in the same `RUN`: `&& rm -rf /var/lib/apt/lists/*`
- Use `.dockerignore` to exclude unneeded files from the build context
- Prefer official images and versioned tags over `:latest`

## Saving a modified container as a new image

After manually modifying a container (installing packages, configuration…), its state can be frozen into a new image — reserve this for ad hoc tests and snapshots; a `Dockerfile` remains preferable for any image meant to be reproducible or shared:

```bash
docker commit <container> <new-image>
docker commit -m "Change description" -a "Author" <container> <new-image>:<tag>
```

!!! note "Image name must be lowercase"
    `docker commit` rejects an image name containing uppercase letters.

## Verification

```bash
docker images
docker history <image>:<tag>
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `docker commit` refused | Image name contains an uppercase letter | Rewrite the name entirely in lowercase |
| Image not found after `docker build` | Forgotten tag, or wrong build context | Check the path passed to `docker build` and that the `Dockerfile` is present |
