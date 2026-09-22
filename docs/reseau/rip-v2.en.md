# Dynamic routing — RIP version 2

## Context

Having routers learn routes automatically instead of entering them one by one. RIPv2 suits small topologies (under 15 hops) where simplicity of setup matters more than fast convergence — beyond that, or on a more demanding network, OSPF is preferred.

## Prerequisites

- At least two Cisco routers (IOS 15.x or later) with privileged-mode access
- Interfaces already addressed, [static routing](routage-statique.md) disabled on the networks involved to avoid conflicting sources of information
- The reference addressing plan from the [conventions](../conventions.md)

## Topology

```mermaid
flowchart LR
    PC1["PC1"]
    R1(("R1"))
    R2(("R2"))
    SRV1["SRV1"]

    PC1 ---|"Gi0/1 · 192.168.10.1/24"| R1
    R1 ===|"Gi0/0 ↔ Gi0/0 · 10.0.0.0/30<br>RIP domain"| R2
    R2 ---|"Gi0/1 · 192.168.20.1/24"| SRV1
```

## Procedure

### 1. Enable RIP and set the version

```cisco
enable
configure terminal
router rip
 version 2
 no auto-summary
```

!!! warning "`no auto-summary` isn't optional"
    Without this command, RIPv2 automatically summarizes routes at the classful boundary (class A/B/C aggregation), just like RIPv1 does. On a discontiguous subnetting plan, this breaks routing with no visible error message.

### 2. Declare the directly connected networks

```cisco
network 192.168.10.0
network 10.0.0.0
```

`network` takes the full classful address, not the interface's exact prefix — IOS figures out the right mask on the interface concerned by itself.

### 3. Configure R2 symmetrically

```cisco
enable
configure terminal
router rip
 version 2
 no auto-summary
 network 192.168.20.0
 network 10.0.0.0
```

### 4. Disable announcements on LAN-facing interfaces

RIP sends its announcements out every interface declared by `network`, including ones that only lead to client hosts. That's both pointless and slightly exposed.

```cisco
router rip
 passive-interface GigabitEthernet0/1
```

The interface stays part of the RIP process — its network is still advertised to other routers — but R1 no longer sends updates out of it.

### 5. Inject a default route (on the edge router)

```cisco
ip route 0.0.0.0 0.0.0.0 203.0.113.1
router rip
 default-information originate
```

Without `default-information originate`, the default route stays local to the edge router and isn't propagated to the other RIP routers.

### 6. Authenticate exchanges (recommended beyond a lab setup)

```cisco
key chain RIP-KEYS
 key 1
  key-string <shared-key>
exit
interface GigabitEthernet0/0
 ip rip authentication mode md5
 ip rip authentication key-chain RIP-KEYS
```

!!! note "Why authenticate"
    Without it, any device connected to the segment can advertise fake RIP routes and hijack traffic. MD5 authentication is a minimum, not an absolute guarantee, but it closes the widest door.

### 7. Save

```cisco
end
copy running-config startup-config
```

## Rollback plan

Two cases, depending on whether RIP was introduced solely for this procedure, or already handles other networks on this router.

=== "RIP introduced just for this procedure"

    Remove the whole process:

    ```cisco
    configure terminal
    no router rip
    end
    copy running-config startup-config
    ```

    `no router rip` removes the entire RIP configuration in one go — declared networks, `passive-interface`, `default-information originate` included.

=== "RIP already used for other networks"

    Remove only what was added:

    ```cisco
    configure terminal
    router rip
     no network 192.168.10.0
     no passive-interface GigabitEthernet0/1
     no default-information originate
    exit
    end
    copy running-config startup-config
    ```

!!! warning "A RIP rollback can cut routes silently"
    Once the process stops, the routes it was advertising gradually disappear from the table on other routers (until timeout). If no backup static route exists, connectivity drops with no explicit error message at the moment of removal.

## Verification

```cisco
show ip protocols
show ip route rip
show ip rip database
```

In `show ip route`, routes learned via RIP show up prefixed `R`, with an administrative distance of 120: `R 192.168.20.0/24 [120/1] via 10.0.0.2, 00:00:12, GigabitEthernet0/0`. The number in brackets is the hop count — RIP discards any route beyond 15 hops.

To watch update exchanges live on a lab setup:

```cisco
debug ip rip
undebug all
```

!!! danger "`debug` in production"
    As with NAT, `debug ip rip` keeps the CPU busy continuously. Reserve it for test environments.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| No `R` route shows up | Network not declared, or declared with the wrong classful address | Check `network` with `show ip protocols` (*Routing for Networks* section) |
| Route learned then withdrawn after ~3 minutes | Neighbor unreachable, RIP timeout reached | Check the physical link and the addressing of the shared interface |
| Routes looping or unstable | Auto-summary active on a discontiguous plan | Add `no auto-summary` on every router in the RIP domain |
| Default route doesn't reach the other routers | `default-information originate` missing | Add it on the router that holds the `0.0.0.0/0` route |
| A static route still takes priority despite RIP having a better metric | Administrative distance: static = 1, RIP = 120 | Normal behavior — remove or raise the static route's distance if RIP should win |
