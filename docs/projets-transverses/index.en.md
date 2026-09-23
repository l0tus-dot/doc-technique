# Cross-cutting projects

The other sections each document one technology at a time: a routing command, a tunnel, a directory service, taken in isolation. This section does the opposite — it documents complete architectures, where several building blocks come together to meet a business need. This is where the overall vision expected in SISR comes into play: an infrastructure isn't worth the sum of its technologies, but the way they fit together.

A project page doesn't re-explain every building block in detail — it links to the corresponding unitary page when one exists, and focuses on what a unitary page can't show: why this architecture, in what order to build it, and above all **where the building blocks touch each other** — it's precisely at these contact points that poorly designed architectures fail.

## To be written

- [ ] Internal HTTPS web portal: Nginx Proxy Manager, automatic certificates, internal resolution via Pi-hole
- [ ] Infrastructure inventory and documentation: NetBox as source of truth, fed by the actual deployment
- [ ] DMZ zone: firewall segmentation, DNS relay, application filtering for an exposed service
- [ ] Containers in production: a Docker fleet behind a reverse proxy, backup and monitoring

## Project template

A different structure from the unitary pages ([general template](../gabarit.md)) — copy the block below to start a new project page.

````markdown
# Project title

## Business context

The need this architecture addresses, as a concrete situation — not a list of technologies.

## Overall architecture

```mermaid
flowchart LR
    Client["Client workstation"]
    FW((Firewall))
    SRV["Server"]

    Client --- FW
    FW --- SRV
```

One paragraph per zone of the diagram: what it contains, what separates it from the others.

## Components and each one's role

| Component | Role | Detailed page |
|---|---|---|
| | | |

## Deployment sequencing

1. Step, and why it must precede the next one.

## Critical integration points

What only works if the building blocks are correctly connected to each other: firewall rules that let a specific flow through, name resolution crossing a network boundary, return route, shared or deliberately separate authentication.

## End-to-end verification

A test that goes through the whole chain, not block by block.

## Global rollback plan

The order in which to disable each building block without breaking the others.
````
