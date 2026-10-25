# Documentation technique

Les procédures que j'applique en TP, en stage et dans mon homelab : configuration réseau, administration système, sécurisation et services. Chaque fiche est écrite pour être rejouée telle quelle, avec les commandes de vérification qui vont avec.

## Par où commencer

<div class="grid cards" markdown>

-   __Réseau__

    Routage, NAT/PAT, VLAN, ACL et méthode de dépannage réseau par couche.

    [Ouvrir la section](reseau/index.md)

-   __Conteneurisation__

    Docker : installation, conteneurs, images, réseaux, volumes, Dockerfile et Compose.

    [Ouvrir la section](conteneurisation/index.md)

-   __Cybersécurité__

    Filtrage par ACL Cisco, pfSense, WireGuard, durcissement et délégation de privilèges avec sudo.

    [Ouvrir la section](securite/index.md)

-   __Mémos__

    Aide-mémoire synthétiques des commandes Cisco IOS et Netplan.

    [Ouvrir la section](memos/cisco-ios.md)

</div>

## Comment lire une fiche

Les fiches par technologie suivent la même structure : contexte, prérequis, topologie, procédure, plan de retour arrière, vérification, dépannage. La section **Vérification** donne la commande qui prouve que la configuration fonctionne — c'est elle qu'il faut lancer avant de considérer une manipulation terminée.

Une fiche qui combine plusieurs briques (une architecture complète plutôt qu'une procédure isolée) suit une structure différente — voir le gabarit de projet dans le [gabarit](gabarit.md).

Les [conventions d'écriture](conventions.md) détaillent les notations utilisées. Le [gabarit](gabarit.md) sert de point de départ pour toute nouvelle fiche.

<!-- recent-pages -->
