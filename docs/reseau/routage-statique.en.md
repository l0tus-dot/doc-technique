# Static routing

## Context

Getting two local networks talking to each other across a link between routers, without a dynamic routing protocol. This is the expected setup on a small infrastructure whose topology doesn't change.

## Prerequisites

- Two Cisco routers (IOS 15.x or later) with console or SSH access in privileged mode
- The interfaces involved already addressed and up
- The reference addressing plan from the [conventions](../conventions.md)

## Topology

```mermaid
flowchart LR
    PC1["PC1"]
    R1(("R1"))
    R2(("R2"))
    SRV1["SRV1"]

    PC1 ---|"Gi0/1 · 192.168.10.1/24"| R1
    R1 ===|"Gi0/0 ↔ Gi0/0 · 10.0.0.0/30"| R2
    R2 ---|"Gi0/1 · 192.168.20.1/24"| SRV1
```

## Procedure

### 1. Address R1's interfaces

```cisco
enable
configure terminal
interface GigabitEthernet0/1
 description User LAN
 ip address 192.168.10.1 255.255.255.0
 no shutdown
exit
interface GigabitEthernet0/0
 description Link to R2
 ip address 10.0.0.1 255.255.255.252
 no shutdown
exit
```

!!! warning "`no shutdown` isn't optional"
    An interface that's configured but left administratively disabled won't show up in the routing table. It's the number one cause of "the route isn't showing up."

### 2. Declare the route to the remote network

```cisco
ip route 192.168.20.0 255.255.255.0 10.0.0.2
```

The syntax is: destination network, mask, then next-hop address.

### 3. Configure R2 symmetrically

```cisco
enable
configure terminal
interface GigabitEthernet0/1
 ip address 192.168.20.1 255.255.255.0
 no shutdown
exit
interface GigabitEthernet0/0
 ip address 10.0.0.2 255.255.255.252
 no shutdown
exit
ip route 192.168.10.0 255.255.255.0 10.0.0.1
```

!!! tip "The return path always needs configuring too"
    A route only works one way. Without the return route on R2, the ping goes out but the reply never comes back.

### 4. Add a default route to the outside

On the edge router only, for anything not known locally:

```cisco
ip route 0.0.0.0 0.0.0.0 203.0.113.1
```

### 5. Save

```cisco
end
copy running-config startup-config
```

## Rollback plan

Remove only the routes added by this procedure, without touching the interfaces or any pre-existing default route.

```cisco
configure terminal
no ip route 192.168.20.0 255.255.255.0 10.0.0.2
no ip route 0.0.0.0 0.0.0.0 203.0.113.1
end
copy running-config startup-config
```

Do the same on R2 for the symmetric route (`no ip route 192.168.10.0 255.255.255.0 10.0.0.1`).

!!! warning "Check dependencies before removing"
    If NAT or an ACL relies on this route (see [NAT and PAT](nat-pat.md)), removing it also breaks whatever depends on it. Confirm with `show ip route` and `show running-config | include ip route` that nothing else needs it.

## Verification

=== "Cisco IOS"

    ```cisco
    show ip route static
    show ip interface brief
    ping 192.168.20.1 source 192.168.10.1
    traceroute 192.168.20.1
    ```

    In `show ip route`, the route shows up prefixed with `S` (static) or `S*` for the default route, with an administrative distance of 1: `S 192.168.20.0/24 [1/0] via 10.0.0.2`.

=== "From a Linux host"

    ```bash
    ip route show
    ping -c 4 192.168.20.10
    traceroute 192.168.20.10
    ```

=== "From a Windows host"

    ```powershell
    route print
    Test-NetConnection 192.168.20.10
    tracert 192.168.20.10
    ```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Route doesn't show up in `show ip route` | Outbound interface down, or next hop unreachable | `show ip interface brief`, check `no shutdown` and the cabling |
| No ping reply even though the route exists on both sides | Return route missing | Add the symmetric route on the remote router |
| Ping works from the router but not from the host | Default gateway missing on the host | Check the client's IP configuration or the DHCP scope |
| Ping blocked beyond the edge router | Missing ACL or NAT | See [NAT and PAT](nat-pat.md) |

!!! note "Administrative distance"
    A static route has a distance of 1, an OSPF route 110. For the same destination, the static route wins. To turn it into a backup route behind OSPF, give it a higher distance: `ip route 192.168.20.0 255.255.255.0 10.0.0.2 200`.
