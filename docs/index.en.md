# Technical documentation

The procedures I apply in labs, on internships, and in my homelab: network configuration, system administration, security, and services. Each page is written to be replayed as-is, with the verification commands that go with it.

## Where to start

<div class="grid cards" markdown>

-   __Network__

    Routing, NAT/PAT, VLAN, ACL, and network troubleshooting methodology by layer.

    [Open the section](reseau/index.md)

-   __Systems__

    Windows Server, Ubuntu Server administration, and Docker / DevOps containerization.

    [Open the section](systemes/index.md)

-   __Cybersecurity__

    Cisco ACL filtering, pfSense, WireGuard, hardening, and privilege delegation with sudo.

    [Open the section](securite/index.md)

-   __Cross-cutting projects__

    Complete architectures combining several building blocks — the overall vision, not a single technology.

    [Open the section](projets-transverses/index.md)

-   __Services__

    NetBox, Pi-hole, Nginx Proxy Manager, monitoring.

    [Open the section](services/index.md)

-   __Cheat sheets__

    Concise cheat sheets for Cisco IOS and Netplan commands.

    [Open the section](memos/cisco-ios.md)

</div>

## How to read a page

Technology pages all follow the same structure: context, prerequisites, topology, procedure, rollback plan, verification, troubleshooting. The **Verification** section gives the command that proves the configuration works — run it before considering a change complete.

[Cross-cutting projects](projets-transverses/index.md) pages follow a different structure, built for a multi-brick architecture rather than a single procedure — see their index page.

The [writing conventions](conventions.md) detail the notations used. The [template](gabarit.md) is the starting point for any new technology page.

!!! note "Some pages are still French-only"
    This site is being translated progressively. Any page without an English version yet falls back to its French original — the content is still there, just not translated.
