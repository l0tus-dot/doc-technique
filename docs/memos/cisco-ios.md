# Mémo Cisco IOS

## Modes

| Invite | Mode | Accès |
|---|---|---|
| `R1>` | Utilisateur | Connexion console ou SSH |
| `R1#` | Privilégié | `enable` |
| `R1(config)#` | Configuration globale | `configure terminal` |
| `R1(config-if)#` | Configuration d'interface | `interface Gi0/0` |

`exit` remonte d'un niveau, `end` retourne directement au mode privilégié, ++ctrl+z++ également.

## Diagnostic

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

## Sauvegarde et réinitialisation

```cisco
write memory
copy running-config startup-config
copy running-config tftp:
```

!!! danger "Réinitialisation complète"
    `erase startup-config` puis `reload` efface la configuration enregistrée. Aucune confirmation n'est demandée après validation.

## Configuration initiale type

```cisco
enable
configure terminal
hostname R1
no ip domain-lookup
enable secret <mot-de-passe>
service password-encryption
banner motd #Acces reserve#
line console 0
 password <mot-de-passe>
 login
 logging synchronous
 exec-timeout 10 0
exit
```

!!! tip "`no ip domain-lookup`"
    Sans cette commande, toute faute de frappe est interprétée comme un nom d'hôte et le routeur reste bloqué plusieurs secondes à tenter de le résoudre.

## SSH

```cisco
ip domain-name lab.local
crypto key generate rsa modulus 2048
username admin privilege 15 secret <mot-de-passe>
line vty 0 4
 transport input ssh
 login local
exit
ip ssh version 2
```
