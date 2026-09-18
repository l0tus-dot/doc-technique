# Mémo Netplan

Netplan est l'outil de configuration réseau standard sur Ubuntu Server (18.04 et plus). Il ne pilote pas directement l'interface : il traduit un fichier YAML vers un moteur sous-jacent — `systemd-networkd` par défaut sur un serveur, `NetworkManager` sur un poste de bureau.

## Emplacement des fichiers

```bash
ls /etc/netplan/
```

Le nom du fichier varie selon l'origine de l'installation :

| Fichier typique | Origine |
|---|---|
| `00-installer-config.yaml` | Installation via l'installateur Ubuntu Server |
| `50-cloud-init.yaml` | Machine provisionnée par cloud-init (image cloud, Proxmox, etc.) |
| `01-netcfg.yaml` | Nom historique, encore rencontré sur certaines images |

!!! tip "Retrouver le bon fichier"
    En cas de doute, `cat /etc/netplan/*.yaml` affiche le contenu de tous les fichiers présents plutôt que de deviner leur nom. S'il y en a plusieurs, ils sont fusionnés par ordre alphabétique, le dernier lu l'emportant en cas de clé en conflit.

## Syntaxe

Le YAML est sensible à l'indentation : uniquement des espaces, jamais de tabulation, chaque niveau strictement aligné sous son parent.

```yaml
network:
  ethernets:
    ens160:
      dhcp4: false
      addresses: [100.115.29.11/23]
      routes:
        - to: default
          via: 100.115.29.254
      nameservers:
        addresses: [100.115.28.41, 100.11.29.41]
  version: 2
```

| Clé | Rôle |
|---|---|
| `ens160` | Nom de l'interface à configurer — le retrouver avec `ip a` ou `networkctl list` |
| `dhcp4: false` | Désactive le DHCP pour passer en adressage statique |
| `addresses` | Adresse de l'interface au format CIDR (`/23` = masque `255.255.254.0`) |
| `routes` / `to: default` | Route par défaut — remplace l'ancienne clé `gateway4`, dépréciée |
| `nameservers.addresses` | Serveurs DNS interrogés par la machine |
| `version: 2` | Version du format de fichier Netplan (seule valeur utilisée actuellement) |

!!! note "`gateway4` est dépréciée"
    Les versions récentes de Netplan avertissent, sans bloquer, si `gateway4: <adresse>` est utilisée à la place de la forme `routes` ci-dessus. Préférer la seconde sur toute configuration nouvelle.

## Procédure

### 1. Identifier le fichier et l'interface

```bash
ls /etc/netplan/
ip a
```

### 2. Éditer le fichier

```bash
sudo nano /etc/netplan/<nom-du-fichier>.yaml
```

Reprendre la structure de l'exemple ci-dessus en adaptant l'interface, l'adresse, la passerelle et les DNS.

### 3. Vérifier la syntaxe sans rien appliquer

```bash
sudo netplan generate
```

Traduit la configuration vers le moteur sous-jacent sans y toucher, et signale toute erreur de syntaxe ou de clé avant qu'elle ne casse la connectivité.

### 4. Appliquer sans risquer de perdre la main

```bash
sudo netplan try
```

!!! warning "Le réflexe à prendre en SSH"
    `netplan try` applique la configuration immédiatement, mais l'annule automatiquement au bout de 120 secondes si elle n'est pas confirmée avec ++enter++. C'est la commande à utiliser systématiquement à distance : une erreur d'adresse ou de route ne coupe pas la session, la machine revient seule à l'état précédent.

    `netplan apply` applique directement, sans filet — à réserver à un accès console ou à une configuration déjà validée avec `try`.

### 5. Corriger les permissions si Netplan les signale

```bash
sudo chmod 600 /etc/netplan/<nom-du-fichier>.yaml
```

Netplan avertit si un fichier de configuration reste lisible par d'autres utilisateurs que root.

## Vérification

```bash
ip a show ens160
ip route
resolvectl status ens160
```

L'adresse, la route par défaut et les serveurs DNS doivent correspondre à ce qui a été déclaré. `resolvectl status` confirme que les DNS sont bien pris en compte par le résolveur, pas seulement écrits dans le fichier.

## Dépannage

| Symptôme | Cause probable | Correction |
|---|---|---|
| `netplan generate` échoue avec une erreur de syntaxe | Indentation incohérente, tabulation au lieu d'espaces | Comparer l'indentation avec l'exemple ; un éditeur affichant les espaces aide à repérer l'erreur |
| Configuration appliquée mais aucune connectivité | Mauvais nom d'interface | Vérifier le nom réel avec `ip a` — il varie selon l'hyperviseur (`ens160`, `eth0`, `enp0s3`…) |
| Perte de connexion SSH après application | `netplan apply` utilisé directement, sans passer par `try` | À l'avenir, toujours valider avec `netplan try` ; en cas de coupure, récupérer un accès console pour corriger le fichier |
| Adresse correcte mais résolution de noms en échec | Bloc `nameservers` mal indenté (doit être au même niveau que `addresses` et `routes`, sous l'interface) | Vérifier l'alignement avec l'exemple ; confirmer avec `resolvectl status` |
| Deux fichiers `.yaml` se contredisent | Plusieurs fichiers dans `/etc/netplan/`, fusionnés par ordre alphabétique | `cat /etc/netplan/*.yaml` pour repérer le conflit ; ne garder qu'un seul fichier faisant autorité si possible |
