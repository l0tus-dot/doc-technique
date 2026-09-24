---
description: Configurer le réseau sur Ubuntu Server avec Netplan — adressage statique, DHCP, dual-homed, netplan try et retour arrière.
tags:
  - Linux
  - Réseau
  - Ubuntu
  - Mémo
---

# Mémo Netplan

Netplan est l'outil de configuration réseau standard sur Ubuntu Server (18.04 et plus). Il traduit un fichier YAML vers un moteur sous-jacent — `systemd-networkd` par défaut sur un serveur, `NetworkManager` sur un poste de bureau.

---

## 1. Fichiers de configuration

```bash
ls /etc/netplan/          # liste les fichiers présents
cat /etc/netplan/*.yaml   # affiche tous les fichiers d'un coup
```

| Fichier typique | Origine |
|---|---|
| `00-installer-config.yaml` | Installation via l'installateur Ubuntu Server |
| `50-cloud-init.yaml` | Machine provisionnée par cloud-init (Proxmox, image cloud…) |
| `01-netcfg.yaml` | Nom historique, encore rencontré sur certaines images |

!!! tip "Plusieurs fichiers coexistants"
    S'il y en a plusieurs, ils sont fusionnés par ordre alphabétique — le dernier lu l'emporte en cas de clé en conflit. Pour éviter toute ambiguïté, ne garder qu'un seul fichier faisant autorité.

---

## 2. Syntaxe du fichier YAML

Le YAML est sensible à l'indentation : **espaces uniquement**, jamais de tabulation, chaque niveau strictement aligné sous son parent.

### Adressage statique

```yaml
network:
  version: 2
  ethernets:
    ens160:
      dhcp4: false
      addresses:
        - 192.168.10.11/24
      routes:
        - to: default
          via: 192.168.10.1
      nameservers:
        addresses:
          - 1.1.1.1
          - 8.8.8.8
        search:
          - lab.local
```

### Adressage DHCP

```yaml
network:
  version: 2
  ethernets:
    ens160:
      dhcp4: true
```

### Deux interfaces (serveur dual-homed)

```yaml
network:
  version: 2
  ethernets:
    ens160:
      dhcp4: false
      addresses: [192.168.10.11/24]
      routes:
        - to: default
          via: 192.168.10.1
    ens192:
      dhcp4: false
      addresses: [10.0.0.11/30]
```

| Clé | Rôle |
|---|---|
| `ens160` | Nom de l'interface — retrouver avec `ip a` ou `networkctl list` |
| `dhcp4: false` | Désactive le DHCP pour passer en adressage statique |
| `addresses` | Adresse au format CIDR |
| `routes` / `to: default` | Route par défaut — remplace `gateway4` (dépréciée) |
| `nameservers.addresses` | Serveurs DNS |
| `nameservers.search` | Domaines de recherche DNS |
| `version: 2` | Version du format Netplan (seule valeur utilisée) |

!!! note "`gateway4` est dépréciée"
    Les versions récentes de Netplan avertissent si `gateway4` est utilisée. Préférer la forme `routes` / `to: default` / `via` sur toute configuration nouvelle.

---

## 3. Procédure d'application

### 1. Identifier l'interface et le fichier

```bash
ip a                              # liste les interfaces et leurs adresses actuelles
networkctl list                   # état réseau via systemd-networkd
ls /etc/netplan/                  # fichier(s) à modifier
```

### 2. Sauvegarder avant de modifier

```bash
sudo cp /etc/netplan/<fichier>.yaml /etc/netplan/<fichier>.yaml.bak
```

Toujours faire cette copie avant d'éditer — c'est ce qui rend le retour arrière immédiat.

### 3. Éditer le fichier

```bash
sudo nano /etc/netplan/<fichier>.yaml
```

### 4. Valider la syntaxe sans appliquer

```bash
sudo netplan generate
```

Traduit la configuration vers le moteur sans y toucher, et signale toute erreur avant de toucher à la connectivité.

### 5. Appliquer avec filet de sécurité

```bash
sudo netplan try
```

!!! warning "Le réflexe à prendre en SSH"
    `netplan try` applique la configuration immédiatement, mais l'**annule automatiquement après 120 secondes** si elle n'est pas confirmée avec ++enter++. C'est la commande à utiliser systématiquement à distance — une erreur d'adresse ou de route ne coupe pas la session, la machine revient seule à l'état précédent.

    `netplan apply` applique directement, sans filet — à réserver à un accès console ou à une configuration déjà validée avec `try`.

### 6. Corriger les permissions si Netplan les signale

```bash
sudo chmod 600 /etc/netplan/<fichier>.yaml
```

Netplan avertit si le fichier reste lisible par d'autres utilisateurs que root (`-rw-r--r--` au lieu de `-rw-------`).

---

## 4. Plan de retour arrière

```bash
sudo cp /etc/netplan/<fichier>.yaml.bak /etc/netplan/<fichier>.yaml
sudo netplan try
```

La sauvegarde faite à l'étape 2 rend le retour immédiat. Sans elle, il faut ressaisir manuellement les anciennes valeurs.

!!! tip "Pas de sauvegarde disponible"
    Si la machine était en DHCP avant cette procédure, repasser `dhcp4: true` et supprimer les clés `addresses`, `routes` et `nameservers` reproduit l'état d'origine dans la plupart des cas.

---

## 5. Vérification

```bash
ip a show ens160                  # adresse appliquée sur l'interface
ip route                          # table de routage (route par défaut présente ?)
resolvectl status ens160          # DNS pris en compte par le résolveur
ping -c 4 8.8.8.8                 # connectivité Internet
ping -c 4 lab.local               # résolution DNS locale
networkctl status ens160          # état détaillé via systemd-networkd
```

`resolvectl status` confirme que les DNS sont bien pris en compte par le résolveur, pas seulement écrits dans le fichier.

---

## 6. Dépannage

| Symptôme | Cause probable | Correction |
|---|---|---|
| `netplan generate` échoue | Indentation incohérente ou tabulation | Comparer avec l'exemple ; utiliser un éditeur affichant les espaces |
| Configuration appliquée mais pas de connectivité | Mauvais nom d'interface | Vérifier le nom réel avec `ip a` (`ens160`, `eth0`, `enp0s3`…) |
| Perte de connexion SSH après `netplan apply` | `apply` utilisé sans passer par `try` | Accès console pour corriger ; toujours utiliser `netplan try` à distance |
| Adresse correcte mais DNS en échec | Bloc `nameservers` mal indenté | Vérifier l'alignement ; confirmer avec `resolvectl status` |
| Deux fichiers `.yaml` se contredisent | Fusion par ordre alphabétique | `cat /etc/netplan/*.yaml` pour repérer le conflit |
| Avertissement `gateway4 deprecated` | Clé dépréciée utilisée | Remplacer par `routes` / `to: default` / `via` |
