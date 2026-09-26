# Netplan cheat sheet

Netplan is the standard network configuration tool on Ubuntu Server (18.04 and later). It doesn't drive the interface directly: it translates a YAML file into an underlying engine — `systemd-networkd` by default on a server, `NetworkManager` on a desktop machine.

## File location

```bash
ls /etc/netplan/
```

The file name varies depending on how the machine was installed:

| Typical file | Origin |
|---|---|
| `00-installer-config.yaml` | Installed via the Ubuntu Server installer |
| `50-cloud-init.yaml` | Machine provisioned by cloud-init (cloud image, Proxmox, etc.) |
| `01-netcfg.yaml` | Historical name, still found on some images |

!!! tip "Finding the right file"
    When in doubt, `cat /etc/netplan/*.yaml` shows the content of every file present instead of guessing the name. If there are several, they're merged in alphabetical order, with the last one read winning on any conflicting key.

## Syntax

YAML is indentation-sensitive: spaces only, never tabs, each level strictly aligned under its parent.

```yaml
network:
  ethernets:
    ens160:
      dhcp4: false
      addresses: [100.115.29.11-15/23]
      route:
        - to: default
          via: 100.115.29.254
      nameservers:
        addresses: [100.115.28.41, 100.115.28.42]
  version: 2
```

| Key | Role |
|---|---|
| `ens160` | Name of the interface to configure — find it with `ip a` or `networkctl list` |
| `dhcp4: false` | Disables DHCP to switch to static addressing |
| `addresses` | Interface address in CIDR form (`/23` = `255.255.254.0` mask) |
| `routes` / `to: default` | Default route — replaces the older `gateway4` key, now deprecated |
| `nameservers.addresses` | DNS servers queried by the machine |
| `version: 2` | Netplan file format version (the only value in current use) |

!!! note "`gateway4` is deprecated"
    Recent Netplan versions warn, without blocking, if `gateway4: <address>` is used instead of the `routes` form above. Prefer the latter for any new configuration.

## Procedure

### 1. Identify the file and the interface

```bash
ls /etc/netplan/
ip a
```

### 2. Back up, then edit the file

```bash
sudo cp /etc/netplan/<file-name>.yaml /etc/netplan/<file-name>.yaml.bak
sudo nano /etc/netplan/<file-name>.yaml
```

Reuse the structure from the example above, adapting the interface, address, gateway and DNS servers. The backup copy is what makes the [rollback plan](#rollback-plan) immediate.

### 3. Check the syntax without applying anything

```bash
sudo netplan generate
```

Translates the configuration to the underlying engine without touching it, and flags any syntax or key error before it can break connectivity.

### 4. Apply without risking losing access

```bash
sudo netplan try
```

!!! warning "The reflex to have over SSH"
    `netplan try` applies the configuration immediately, but automatically rolls it back after 120 seconds if it isn't confirmed with ++enter++. This is the command to use systematically from a remote session: an address or route mistake doesn't cut the session, the machine reverts on its own.

    `netplan apply` applies directly, with no safety net — reserve it for console access, or for a configuration already validated with `try`.

### 5. Fix the permissions if Netplan flags them

```bash
sudo chmod 600 /etc/netplan/<file-name>.yaml
```

Netplan warns if a configuration file remains readable by users other than root.

## Rollback plan

```bash
sudo cp /etc/netplan/<file-name>.yaml.bak /etc/netplan/<file-name>.yaml
sudo netplan try
```

The backup made in step 2 allows an immediate return to the previous configuration. Without it, rolling back means manually re-entering the old values — which is exactly why it's worth backing up before editing, even for a change that looks minor.

!!! tip "No backup available"
    If the machine was on DHCP before this procedure, switching back to `dhcp4: true` and removing the `addresses`, `routes` and `nameservers` keys reproduces the original state in most cases.

## Verification

```bash
ip a show ens160
ip route
resolvectl status ens160
```

The address, default route and DNS servers should match what was declared. `resolvectl status` confirms the DNS servers are actually picked up by the resolver, not just written in the file.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `netplan generate` fails with a syntax error | Inconsistent indentation, a tab used instead of spaces | Compare the indentation against the example; an editor that shows whitespace helps spot the error |
| Configuration applied but no connectivity | Wrong interface name | Check the real name with `ip a` — it varies by hypervisor (`ens160`, `eth0`, `enp0s3`…) |
| Lost SSH connection after applying | `netplan apply` used directly, without going through `try` | From now on, always validate with `netplan try`; if the connection drops, get console access to fix the file |
| Address correct but name resolution fails | `nameservers` block wrongly indented (must sit at the same level as `addresses` and `routes`, under the interface) | Check the alignment against the example; confirm with `resolvectl status` |
| Two `.yaml` files contradict each other | Several files in `/etc/netplan/`, merged in alphabetical order | `cat /etc/netplan/*.yaml` to spot the conflict; keep only one authoritative file if possible |
