# Network troubleshooting

Each page in the [Network](../reseau/index.md) section documents its own troubleshooting, scoped to that procedure. This page collects the failures that come up most often, across every context, sorted by layer.

## Method

Before chasing a specific cause, isolating the layer at fault keeps you from fixing a symptom in the wrong place — no point checking routing if the cable is unplugged.

1. **Physical** — is the link up? (LEDs, `show interfaces status`)
2. **Data link** — is the interface in the right VLAN, is the trunk up?
3. **Network** — is the IP address correct, does the route exist in both directions?
4. **Transport / application** — is the service's port open and reachable?

!!! tip "Always test in both directions"
    A ping that goes out but whose reply never comes back isn't a connectivity failure: it's an asymmetric route, ACL, or firewall. See [Static routing](../reseau/routage-statique.md#troubleshooting) for the most common example.

## Physical connectivity and data link

| Symptom | Likely cause | Fix |
|---|---|---|
| Interface `down/down` | Cable unplugged, wrong port, faulty hardware | `show interfaces status`; test with a known-good cable and port |
| Interface `up/down` (protocol down) | Duplex or speed mismatch with the other end, wrong cable type (straight/crossover on a link without auto-MDIX) | Align `speed`/`duplex` on both sides, or set both back to `auto` |
| Port stuck in `err-disabled` | Port-security violation, loop detected by spanning tree | `show interfaces status err-disabled` then `show port-security` or `show spanning-tree` depending on the cause; re-enable with `shutdown` / `no shutdown` once the cause is fixed |
| Unstable topology, intermittent loss on a switch | Physical loop with no active spanning tree | `show spanning-tree` on each switch; check that no port was left in a static configuration without STP |
| Two hosts on the same VLAN can't see each other | Cabling correct but native VLAN differs on a trunk | `show interfaces trunk` on both sides, compare the native VLAN |

## IP addressing and DHCP

| Symptom | Likely cause | Fix |
|---|---|---|
| Address in `169.254.x.x` (APIPA) on Windows, or no address on Linux | No DHCP reply received | Check that the DHCP server is reachable; on a multi-VLAN network, check the relay (`ip helper-address`) |
| Two machines share the same IP address | Static address conflicting with a DHCP range, or duplicated lease | `arp -a` to spot the two MAC addresses tied to the IP; move the static address out of the DHCP scope |
| A host loses its connection after a few hours | Expired DHCP lease, not renewed | Check the lease duration on the server; force a renewal (`ipconfig /renew` or `dhclient -r && dhclient`) |
| Host unreachable despite correct addressing | Default gateway missing or incorrect | `ip route` / `route print` on the client; compare against the VLAN's actual gateway address |

## Name resolution (DNS)

| Symptom | Likely cause | Fix |
|---|---|---|
| `ping hostname.domain` fails, `ping <ip-address>` works | DNS resolution is the issue, not connectivity | `nslookup hostname.domain` or `dig hostname.domain` to confirm, then check the DNS server configured on the client |
| Resolution is slow or inconsistent between hosts | Different DNS servers from one host to another, or a stale local DNS cache | Align the DNS handed out by DHCP; clear the cache (`ipconfig /flushdns` or `systemd-resolve --flush-caches`) |
| A changed record isn't taken into account | TTL hasn't expired yet, intermediate cache | Wait for the TTL to expire, or query the authoritative server directly with `dig @<server> hostname.domain` |
| Internal resolution fails, external resolution works | Internal zone missing or poorly delegated on the local DNS server | Check the zone on the server (AD DS / BIND) and the order of DNS servers on the client |

## Routing

| Symptom | Likely cause | Fix |
|---|---|---|
| Route missing from the table | Outbound interface down, or next hop unreachable | See [Static routing — troubleshooting](../reseau/routage-statique.md#troubleshooting) |
| Ping goes out, reply never received | Return route missing on the remote router | Add the symmetric route |
| Route learned dynamically then withdrawn | Neighbor unreachable, protocol timeout reached | See [RIP version 2 — troubleshooting](../reseau/rip-v2.md#troubleshooting) |
| A static route is still used despite a better dynamic route | Lower administrative distance for the static route (1 vs. 120 for RIP, 110 for OSPF) | Normal behavior; remove or raise the static route's distance if the dynamic one should win |
| Outbound traffic blocked at the edge router | Missing NAT or ACL | See [NAT and PAT — troubleshooting](../reseau/nat-pat.md#troubleshooting) |

## Firewall and access control lists

| Symptom | Likely cause | Fix |
|---|---|---|
| All traffic from a subnet is blocked when only one deny rule was intended | Implicit deny at the end of a Cisco ACL: every ACL ends by denying anything not explicitly permitted | Add an explicit permit line at the end of the ACL if default traffic should pass |
| A rule meant to block a flow doesn't apply | Rule order: a more permissive rule placed earlier catches the traffic first | `show access-lists` to read the actual order; Cisco ACLs are evaluated sequentially, first match wins |
| A specific service stays unreachable despite a correct ACL | Filtering applied in the wrong direction (`in`/`out`) or on the wrong interface | Check the ACL's direction and applied interface with `show ip interface` |

## Switching and VLANs

| Symptom | Likely cause | Fix |
|---|---|---|
| Two ports on the same VLAN don't communicate | Port in `access` mode on a different VLAN than expected | `show interfaces switchport` to confirm the actual access VLAN |
| No traffic crosses the link between two switches | Trunk not up (DTP negotiation failed, different encapsulation) | `show interfaces trunk` on both sides; force `switchport mode trunk` rather than `dynamic desirable` if negotiation fails |
| A specific VLAN doesn't cross an active trunk | VLAN excluded from the trunk's allowed list | `switchport trunk allowed vlan add <number>` |
| Duplicate or unstable MAC addresses in `show mac address-table` | Network loop not covered by spanning tree | Check that no redundant cabling was added without enabling STP on the ports involved |

## Performance and MTU

| Symptom | Likely cause | Fix |
|---|---|---|
| Small packets get through (ping) but file transfers fail or hang | MTU too high on part of the path (VPN tunnel, PPPoE) fragmenting badly | Test with `ping -f -l <size>` (Windows) or `ping -M do -s <size>` (Linux) to find the path's real MTU |
| Throughput far below what's expected on a given link | Inconsistent duplex negotiation (one side full, the other half) | Compare `show interfaces` on both ends; force both sides to `auto` or align manually |
| Latency or loss that only shows up under load | Link undersized, or a queuing loop | `show interfaces` for error and drop counters (`output drops`, `CRC`) |

## General diagnostic commands

=== "From a Cisco router/switch"

    ```cisco
    show interfaces status
    show ip interface brief
    show mac address-table
    show spanning-tree
    show cdp neighbors detail
    ```

=== "From a Linux host"

    ```bash
    ip addr
    ip route
    ss -tulnp
    mtr <ip-address>
    ```

=== "From a Windows host"

    ```powershell
    ipconfig /all
    Get-NetRoute
    Test-NetConnection <ip-address> -Port <port>
    pathping <ip-address>
    ```

The [Cisco IOS cheat sheet](../memos/cisco-ios.md) details the full set of `show` commands useful for this diagnostic work.
