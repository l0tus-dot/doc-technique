# Conventions

## Callouts

!!! note "Note"
    Useful detail, no consequence if skipped.

!!! tip "Tip"
    Shortcut or good practice that saves time.

!!! warning "Warning"
    Risk of service interruption, configuration loss, or security gap. Read before running.

!!! danger "Irreversible"
    Destructive operation: wipe, factory reset, data deletion.

## Reference addressing plan

The examples always use the same plan, so pages combine cleanly with one another.

| Network | Address | Role |
|---|---|---|
| User LAN | `192.168.10.0/24` | Client hosts, gateway `.1` |
| Server LAN | `192.168.20.0/24` | Internal servers, gateway `.1` |
| Interconnection | `10.0.0.0/30` | Link between routers |
| WAN | `203.0.113.0/24` | Internet simulation (RFC 5737) |

## Notation

- `R1`, `R2` — routers; `SW1` — switch; `SRV1` — server.
- `Gi0/0` — GigabitEthernet 0/0 interface.
- A value in angle brackets is meant to be replaced: `<ip-address>`.
- Commands are given in full exec mode, prompt included when the mode matters.

## Topology diagrams

Topologies are drawn in Mermaid (blocks linked by connections), rendered directly by the site — no image to attach or regenerate whenever something changes.

- Circle (`((...))`) — interconnection device: router, switch.
- Rectangle (`[...]`) — host: workstation, server.
- Single line (`---`) — regular wired link.
- Double line (`===`) — point-to-point or WAN link.
- The label on the link carries the interface and address: `"Gi0/1 · 192.168.10.1/24"`.

The [template](gabarit.md) has a ready-to-copy example.

## Rollback plan

In a production environment, every change comes with an undo plan. Every page that modifies an existing configuration includes a **Rollback plan** section, right after the Procedure: the commands that precisely undo what was just added, not a general reset. A purely reference page (command cheat sheet, troubleshooting page) doesn't need one.

## Cross-cutting project pages

A page combining several distinct building blocks doesn't follow the template above: it documents the architecture and its integration points, not a single procedure. Structure and template in [Cross-cutting projects](projets-transverses/index.md).

## File naming

One file per procedure, lower case, no accents, words separated by hyphens: `routage-statique.md`, `nat-pat.md`. The file lives in its section's folder.
