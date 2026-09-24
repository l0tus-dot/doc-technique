---
description: Aide-mémoire des commandes Cisco IOS essentielles — modes, configuration initiale, SSH, interfaces, diagnostic, sauvegarde, debug.
tags:
  - Cisco
  - Réseau
  - Mémo
---

# Mémo Cisco IOS

Aide-mémoire des commandes IOS les plus utilisées en TP et en production. Chaque section suit la même progression : mode → commande → résultat attendu.

---

## 1. Modes de l'IOS

| Invite | Mode | Accès | Quitter |
|---|---|---|---|
| `R1>` | Utilisateur | Connexion console ou SSH | — |
| `R1#` | Privilégié | `enable` | `disable` |
| `R1(config)#` | Configuration globale | `configure terminal` | `end` ou ++ctrl+z++ |
| `R1(config-if)#` | Configuration d'interface | `interface Gi0/0` | `exit` |
| `R1(config-router)#` | Configuration de routage | `router rip` / `router ospf 1` | `exit` |
| `R1(config-line)#` | Configuration de ligne | `line vty 0 4` | `exit` |

`exit` remonte d'un niveau. `end` et ++ctrl+z++ retournent directement au mode privilégié depuis n'importe où.

---

## 2. Configuration initiale

À effectuer sur tout équipement neuf ou réinitialisé avant de commencer.

```cisco
enable
configure terminal

hostname R1
no ip domain-lookup              ! évite les délais sur les fautes de frappe
enable secret <mot-de-passe>     ! mot de passe chiffré pour le mode privilégié
service password-encryption      ! chiffre les mots de passe en clair dans la config

banner motd #Acces reserve - Toute connexion non autorisee est interdite#

line console 0
 password <mot-de-passe>
 login
 logging synchronous             ! empêche les messages système de couper la saisie
 exec-timeout 10 0               ! déconnexion après 10 min d'inactivité
exit

line vty 0 4
 transport input ssh
 login local
exit

end
copy running-config startup-config
```

!!! tip "`no ip domain-lookup`"
    Sans cette commande, toute faute de frappe est interprétée comme un nom d'hôte — le routeur reste bloqué plusieurs secondes à tenter de le résoudre par DNS.

---

## 3. SSH

Activer l'accès SSH sécurisé en remplacement de Telnet.

```cisco
configure terminal

ip domain-name lab.local
crypto key generate rsa modulus 2048     ! clé RSA 2048 bits minimum pour SSHv2
username admin privilege 15 secret <mot-de-passe>

line vty 0 4
 transport input ssh                     ! interdit Telnet
 login local
exit

ip ssh version 2
ip ssh time-out 60                       ! délai d'authentification en secondes
ip ssh authentication-retries 3          ! tentatives avant déconnexion
end
copy running-config startup-config
```

Vérification :

```cisco
show ip ssh
show users
```

---

## 4. Interfaces

```cisco
interface GigabitEthernet0/0
 description Liaison vers R2
 ip address 10.0.0.1 255.255.255.252
 no shutdown                             ! activation obligatoire
exit
```

| Commande | Résultat |
|---|---|
| `show interfaces` | État détaillé de toutes les interfaces (compteurs, erreurs) |
| `show ip interface brief` | Tableau condensé : IP, état physique, état protocolaire |
| `show interfaces GigabitEthernet0/0` | Détail d'une seule interface |
| `show interfaces status` | État des ports (pour les switchs) |

!!! warning "Interface down / down"
    Un état `administratively down` signifie que `shutdown` est actif. Un état `down / down` signifie un problème physique (câble, SFP, partenaire inactif).

---

## 5. Diagnostic réseau

```cisco
show running-config                      ! configuration active en RAM
show running-config | section interface  ! filtrer par section
show running-config | include ip route   ! filtrer par mot-clé
show startup-config                      ! configuration sauvegardée en NVRAM

show ip route                           ! table de routage complète
show ip route static                    ! routes statiques uniquement
show ip route connected                 ! réseaux directement connectés

show ip protocols                       ! protocoles de routage actifs
show ip interface brief                 ! état rapide de toutes les interfaces
show cdp neighbors detail               ! équipements voisins (CDP)
show vlan brief                         ! VLANs configurés (switch)
show mac address-table                  ! table MAC (switch)
show access-lists                       ! ACLs et compteurs de correspondances
show ip nat translations                ! table NAT active
show ip nat statistics                  ! statistiques NAT, interfaces inside/outside
show version                            ! IOS version, uptime, registre de démarrage
show processes cpu                      ! charge CPU par processus
show memory                             ! utilisation mémoire
```

!!! tip "Filtres de commandes `show`"
    `| section <mot>` extrait un bloc, `| include <mot>` filtre ligne par ligne, `| exclude <mot>` exclut, `| begin <mot>` affiche à partir de la première occurrence.

---

## 6. Sauvegarde et restauration

```cisco
! Sauvegarder la config en cours
end
copy running-config startup-config       ! ou : write memory (wr)

! Sauvegarder vers un serveur TFTP
copy running-config tftp:
! → entrer l'adresse IP du serveur, puis le nom du fichier

! Restaurer depuis TFTP
copy tftp: running-config

! Comparer running et startup
show archive config differences system:running-config nvram:startup-config
```

!!! danger "Réinitialisation complète"
    ```cisco
    erase startup-config
    reload
    ```
    Efface la configuration sauvegardée. Aucun retour possible une fois `reload` confirmé.

---

## 7. Debug (environnement de test uniquement)

```cisco
debug ip rip                    ! mises à jour RIP en temps réel
debug ip ospf events            ! événements OSPF
debug ip nat                    ! traductions NAT paquet par paquet
debug ip routing                ! modifications de la table de routage

undebug all                     ! couper TOUS les debugs actifs
no debug all                    ! équivalent
```

!!! danger "`debug` en production"
    Chaque ligne de debug est traitée par le CPU principal. Sur un équipement chargé, activer le debug peut provoquer une saturation et rendre l'équipement injoignable. Toujours terminer par `undebug all`.

---

## 8. Raccourcis et touches utiles

| Touche | Action |
|---|---|
| ++tab++ | Complétion automatique de la commande |
| ++ctrl+z++ | Retour direct au mode privilégié |
| ++ctrl+c++ | Interrompt une commande en cours |
| ++ctrl+shift+6++ | Interrompt un ping ou traceroute en cours |
| `show history` | Historique des commandes saisies |
| `terminal history size 50` | Augmente la taille de l'historique |
