# Cisco IOS cheat sheet

## Modes

| Prompt | Mode | Access |
|---|---|---|
| `R1>` | User | Console or SSH connection |
| `R1#` | Privileged | `enable` |
| `R1(config)#` | Global configuration | `configure terminal` |
| `R1(config-if)#` | Interface configuration | `interface Gi0/0` |

`exit` goes up one level, `end` jumps straight back to privileged mode — so does ++ctrl+z++.

## Diagnostics

```cisco
show running-config
show ip interface brief
show ip route
show ip protocols
show cdp neighbors detail
show interfaces status
show vlan brief
show mac address-table
show access-lists
show ip nat translations
```

## Backup and reset

```cisco
end
copy running-config startup-config
```

!!! tip "Filename confirmation"
    `copy running-config startup-config` asks you to confirm the destination filename (`Destination filename [startup-config]?`) — pressing ++enter++ is enough.

`write memory` (or `wr`) does the same thing as a historical shorthand, without that confirmation prompt. Still supported, but `copy running-config startup-config` is the form to prefer in a procedure.

```cisco
copy running-config tftp:
```

Backs up to a remote TFTP server instead of the device's local memory.

!!! danger "Full reset"
    `erase startup-config` followed by `reload` wipes the saved configuration. No confirmation is asked for after you validate.

## Typical initial configuration

```cisco
enable
configure terminal
hostname R1
no ip domain-lookup
enable secret <password>
service password-encryption
banner motd #Authorized access only#
line console 0
 password <password>
 login
 logging synchronous
 exec-timeout 10 0
exit
```

!!! tip "`no ip domain-lookup`"
    Without this command, any typo is interpreted as a hostname and the router hangs for several seconds trying to resolve it.

## SSH

```cisco
ip domain-name lab.local
crypto key generate rsa modulus 2048
username admin privilege 15 secret <password>
line vty 0 4
 transport input ssh
 login local
exit
ip ssh version 2
```
