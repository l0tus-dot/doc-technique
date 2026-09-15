# Conventions

## Encarts

!!! note "Note"
    Précision utile, sans conséquence si elle est ignorée.

!!! tip "Astuce"
    Raccourci ou bonne pratique qui fait gagner du temps.

!!! warning "Avertissement"
    Risque de coupure de service, de perte de configuration ou de faille. À lire avant d'exécuter.

!!! danger "Irréversible"
    Opération destructrice : effacement, réinitialisation d'usine, suppression de données.

## Plan d'adressage de référence

Les exemples utilisent toujours le même plan, pour que les fiches se combinent entre elles.

| Réseau | Adresse | Rôle |
|---|---|---|
| LAN utilisateurs | `192.168.10.0/24` | Postes clients, passerelle `.1` |
| LAN serveurs | `192.168.20.0/24` | Serveurs internes, passerelle `.1` |
| Interconnexion | `10.0.0.0/30` | Liaison entre routeurs |
| WAN | `203.0.113.0/24` | Simulation Internet (RFC 5737) |

## Notations

- `R1`, `R2` — routeurs ; `SW1` — commutateur ; `SRV1` — serveur.
- `Gi0/0` — interface GigabitEthernet 0/0.
- Une valeur entre chevrons est à remplacer : `<adresse-ip>`.
- Les commandes sont données en mode d'exécution complet, prompt inclus quand le mode compte.

## Nommage des fichiers

Un fichier par procédure, en minuscules, sans accent, mots séparés par des tirets : `routage-statique.md`, `nat-pat.md`. Le fichier est rangé dans le dossier de sa section.
