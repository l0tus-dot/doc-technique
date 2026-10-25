# Images and containers

Assumes Docker is already installed — see [Installation and concepts](docker-installation.md) for the image/container/registry vocabulary.

## Images

### Search and download

```bash
docker search <term>                        # lists images available on Docker Hub
docker search <term> --filter stars=50      # filter by minimum popularity
docker search <term> --limit 5              # limit the number of results

docker pull <image>                         # downloads the latest version (:latest tag)
docker pull <image>:<tag>                   # a precise version, e.g. ubuntu:22.04
docker pull <image> --platform linux/amd64  # force the target architecture
```

### List and inspect

```bash
docker images                        # local images (alias: docker image ls)
docker images -a                     # includes intermediate layers
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"  # custom display

docker inspect <image>               # full configuration as JSON
docker inspect <image> --format '{{ .Config.Env }}'  # extract one field
docker history <image>               # the layers an image is made of, and their size
```

### Remove

```bash
docker rmi <image>                   # removes the local image
docker rmi <image>:<tag>             # a specific tag
docker image prune                   # removes all unused (dangling) images
docker image prune -a                # removes every image with no container attached
```

### Export / import an image (without a registry)

```bash
docker tag <image> <image>:<tag>                     # tag it before exporting
docker save <image>:<tag> -o <archive>.tar           # export to a tar file
docker load -i <archive>.tar                         # import from a tar file
```

`save`/`load` are useful for moving an image to a host with no access to the original registry.

## Containers — lifecycle

### Run

```bash
docker run <image>                              # runs then stops after it exits
docker run -d <image>                           # detached mode (background)
docker run -it <image> /bin/bash               # interactive shell
docker run --name <name> <image>                # name the container
docker run --rm <image>                         # auto-remove once stopped
docker run -e VAR=value <image>                 # environment variable
docker run -e VAR=value --env-file .env <image>  # variables from a file

docker run -d \
  --name <name> \
  --hostname <fqdn> \               # the container's internal hostname
  --restart unless-stopped \        # restarts unless stopped manually
  -p 8080:80 \                      # host-port:container-port
  -v /host/path:/container/path \
  -e KEY=value \
  <image>
```

| `--restart` policy | Behavior |
|---|---|
| `no` (default) | Never restarted |
| `on-failure[:n]` | Restarts on error, up to `n` times |
| `always` | Always restarted, even after `docker stop` |
| `unless-stopped` | Restarts unless stopped manually — **recommended in production** |

### Interacting with a running container

```bash
docker ps                           # running containers
docker ps -a                        # every container, including stopped ones
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

docker exec -it <container> /bin/bash   # opens a new shell inside the container
docker exec <container> <command>       # runs a command without an interactive shell
docker attach <container>               # reattaches to the container's main process
```

!!! tip "Detach without stopping"
    In an interactive shell (`-it`), ++ctrl+p++ then ++ctrl+q++ detaches the console without stopping the container. `exit`, on the other hand, closes the shell **and** stops the container if no other process is running in it.

### Stop, restart, remove

```bash
docker stop <container>             # sends SIGTERM, then SIGKILL after 10s
docker stop -t 30 <container>       # custom delay before SIGKILL
docker kill <container>             # immediate SIGKILL
docker restart <container>          # stop + start

docker start <container>            # start a stopped container
docker start -i <container>         # with an interactive shell

docker pause <container>            # suspends every process (cgroup freeze)
docker unpause <container>

docker rm <container>               # removes the container (must be stopped)
docker rm -f <container>            # forces removal even while running
docker container prune              # removes every stopped container
```

!!! danger "Mass removal"
    ```bash
    docker rm -f $(docker ps -aq)
    ```
    Removes **every** container on the host, no exceptions. Reserve this for a deliberate test.

### Inspect and diagnose

```bash
docker logs <container>             # the container's stdout/stderr stream
docker logs -f <container>          # live follow (tail)
docker logs --tail 50 <container>   # last 50 lines
docker logs --since 1h <container>  # since 1 hour ago

docker inspect <container>          # full configuration as JSON
docker inspect <container> --format '{{ .State.Status }}'
docker stats                        # live CPU, memory, I/O for every container
docker stats <container>            # restricted to one container
docker top <container>              # processes currently running inside the container
docker diff <container>             # files modified since it started
docker port <container>             # active port mappings
```

## Verification

```bash
docker ps -a
docker images
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| The container stops when leaving the shell | Exited with `exit` instead of detaching | Use ++ctrl+p++ ++ctrl+q++ to detach without stopping the container |
| Every container has disappeared | `docker rm $(docker ps -aq)` run with no filtering | Avoid this command as-is; target specific containers or filter before removing |
