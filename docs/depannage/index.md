# Dépannage réseau

Les fiches de la section [Réseau](../reseau/index.md) documentent chacune leur propre dépannage, limité à la procédure concernée. Cette page rassemble les pannes qui reviennent le plus souvent, tous contextes confondus, classées par couche.

## Méthode

Avant de chercher une cause précise, isoler la couche en cause évite de corriger un symptôme à la mauvaise place — inutile de vérifier le routage si le câble est débranché.

1. **Physique** — le lien est-il actif ? (voyants, `show interfaces status`)
2. **Liaison** — l'interface est-elle dans le bon VLAN, le trunk est-il monté ?
3. **Réseau** — l'adresse IP est-elle correcte, la route existe-t-elle dans les deux sens ?
4. **Transport / application** — le port du service est-il ouvert, atteignable ?

!!! tip "Toujours tester dans les deux sens"
    Un ping qui part mais dont la réponse ne revient jamais n'est pas une panne de connectivité : c'est une route, une ACL ou un pare-feu asymétrique. Voir [Routage statique](../reseau/routage-statique.md#depannage) pour l'exemple le plus courant.

## Connectivité physique et liaison

| Symptôme | Cause probable | Résolution |
|---|---|---|
| Interface `down/down` | Câble débranché, mauvais port, matériel en panne | `show interfaces status` ; tester avec un câble et un port connus bons |
| Interface `up/down` (protocole down) | Duplex ou vitesse en désaccord avec l'autre extrémité, mauvais type de câble (droit/croisé sur une liaison sans auto-MDIX) | Aligner `speed`/`duplex` des deux côtés, ou repasser en `auto` sur les deux |
| Port bloqué en `err-disabled` | Violation port-security, boucle détectée par le spanning-tree | `show interfaces status err-disabled` puis `show port-security` ou `show spanning-tree` selon la cause ; réactiver avec `shutdown` / `no shutdown` une fois la cause corrigée |
| Topologie instable, pertes intermittentes sur un commutateur | Boucle physique sans spanning-tree actif | `show spanning-tree` sur chaque commutateur ; vérifier qu'aucun port n'est resté en configuration statique sans STP |
| Deux postes du même VLAN ne se voient pas | Câblage correct mais VLAN natif différent sur un trunk | `show interfaces trunk` des deux côtés, comparer le native VLAN |

## Adressage IP et DHCP

| Symptôme | Cause probable | Résolution |
|---|---|---|
| Adresse en `169.254.x.x` (APIPA) sous Windows, ou absence d'adresse sous Linux | Aucune réponse DHCP reçue | Vérifier que le serveur DHCP est joignable ; sur un réseau multi-VLAN, contrôler le relais (`ip helper-address`) |
| Deux machines partagent la même adresse IP | Adresse statique en conflit avec une plage DHCP, ou bail dupliqué | `arp -a` pour repérer les deux adresses MAC associées à l'IP ; sortir l'adresse statique de l'étendue DHCP |
| Un poste perd sa connexion après quelques heures | Bail DHCP expiré, non renouvelé | Vérifier la durée de bail côté serveur ; forcer un renouvellement (`ipconfig /renew` ou `dhclient -r && dhclient`) |
| Poste injoignable bien qu'adressé correctement | Passerelle par défaut absente ou incorrecte | `ip route` / `route print` côté client ; comparer avec l'adresse réelle de la passerelle du VLAN |

## Résolution de noms (DNS)

| Symptôme | Cause probable | Résolution |
|---|---|---|
| `ping nom.domaine` échoue, `ping <adresse-ip>` fonctionne | Résolution DNS en cause, pas la connectivité | `nslookup nom.domaine` ou `dig nom.domaine` pour confirmer, puis vérifier le serveur DNS configuré côté client |
| Résolution lente ou incohérente selon les postes | Serveurs DNS différents d'un poste à l'autre, ou cache DNS local obsolète | Aligner le DNS distribué par DHCP ; vider le cache (`ipconfig /flushdns` ou `systemd-resolve --flush-caches`) |
| Un enregistrement modifié n'est pas pris en compte | Propagation TTL non expirée, cache intermédiaire | Attendre l'expiration du TTL, ou interroger directement le serveur autoritaire avec `dig @<serveur> nom.domaine` |
| Résolution interne échoue, résolution externe fonctionne | Zone interne absente ou mal déléguée sur le serveur DNS local | Vérifier la zone sur le serveur (AD DS / BIND) et l'ordre des serveurs DNS côté client |

## Routage

| Symptôme | Cause probable | Résolution |
|---|---|---|
| Route absente de la table | Interface de sortie down, ou prochain saut injoignable | Voir [Routage statique — dépannage](../reseau/routage-statique.md#depannage) |
| Ping part, réponse jamais reçue | Route retour absente sur le routeur distant | Ajouter la route symétrique |
| Route apprise dynamiquement puis retirée | Voisin injoignable, timeout du protocole atteint | Voir [RIP version 2 — dépannage](../reseau/rip-v2.md#depannage) |
| Une route statique reste utilisée malgré une meilleure route dynamique | Distance administrative plus basse pour la statique (1 contre 120 en RIP, 110 en OSPF) | Comportement normal ; retirer ou augmenter la distance de la route statique si la dynamique doit prévaloir |
| Trafic sortant bloqué au niveau du routeur de bordure | NAT ou ACL manquant | Voir [NAT et PAT — dépannage](../reseau/nat-pat.md#depannage) |

## Pare-feu et listes de contrôle d'accès

| Symptôme | Cause probable | Résolution |
|---|---|---|
| Tout le trafic d'un sous-réseau est bloqué alors qu'une seule règle de refus était prévue | Deny implicite en fin d'ACL Cisco : toute ACL se termine par un refus de tout ce qui n'est pas explicitement autorisé | Ajouter une ligne d'autorisation explicite en fin d'ACL si un flux par défaut doit passer |
| Une règle censée bloquer un flux ne s'applique pas | Ordre des règles : une règle plus permissive placée avant capte le trafic en premier | `show access-lists` pour lire l'ordre réel ; les ACL Cisco s'évaluent séquentiellement, la première correspondance l'emporte |
| Un service précis reste injoignable malgré une ACL correcte | Filtrage appliqué dans le mauvais sens (`in`/`out`) ou sur la mauvaise interface | Vérifier avec `show ip interface` la direction et l'interface d'application de l'ACL |

## Commutation et VLAN

| Symptôme | Cause probable | Résolution |
|---|---|---|
| Deux ports du même VLAN ne communiquent pas | Port en mode `access` sur un VLAN différent de celui attendu | `show interfaces switchport` pour confirmer le VLAN d'accès réel |
| Aucun trafic ne traverse la liaison entre deux commutateurs | Trunk non monté (négociation DTP échouée, encapsulation différente) | `show interfaces trunk` des deux côtés ; forcer `switchport mode trunk` plutôt que `dynamic desirable` si la négociation échoue |
| Un VLAN précis ne passe pas sur un trunk actif | VLAN exclu de la liste autorisée sur le trunk | `switchport trunk allowed vlan add <numéro>` |
| Adresses MAC dupliquées ou instables dans `show mac address-table` | Boucle réseau non couverte par le spanning-tree | Vérifier qu'aucun câblage redondant n'a été ajouté sans activer STP sur les ports concernés |

## Performance et MTU

| Symptôme | Cause probable | Résolution |
|---|---|---|
| Petits paquets passent (ping) mais les transferts de fichiers échouent ou se figent | MTU trop élevée sur une portion du chemin (tunnel VPN, PPPoE) fragmentant mal | Tester avec `ping -f -l <taille>` (Windows) ou `ping -M do -s <taille>` (Linux) pour trouver la MTU réelle du chemin |
| Débit très inférieur au débit attendu sur un lien donné | Négociation duplex incohérente (un côté en full, l'autre en half) | Comparer `show interfaces` des deux extrémités ; forcer les deux côtés en `auto` ou aligner manuellement |
| Latence ou pertes qui n'apparaissent qu'en charge | Sous-dimensionnement d'un lien, ou boucle de queuing | `show interfaces` pour les compteurs d'erreurs et de drops (`output drops`, `CRC`) |

## Commandes de diagnostic générales

=== "Depuis un routeur/commutateur Cisco"

    ```cisco
    show interfaces status
    show ip interface brief
    show mac address-table
    show spanning-tree
    show cdp neighbors detail
    ```

=== "Depuis un poste Linux"

    ```bash
    ip addr
    ip route
    ss -tulnp
    mtr <adresse-ip>
    ```

=== "Depuis un poste Windows"

    ```powershell
    ipconfig /all
    Get-NetRoute
    Test-NetConnection <adresse-ip> -Port <port>
    pathping <adresse-ip>
    ```

Le [mémo Cisco IOS](../memos/cisco-ios.md) détaille l'ensemble des commandes `show` utiles à ces diagnostics.
