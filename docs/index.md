# Documentation technique

Les procédures que j'applique en TP, en stage et dans mon homelab : configuration réseau, administration système, sécurisation et services. Chaque fiche est écrite pour être rejouée telle quelle, avec les commandes de vérification qui vont avec.

## Par où commencer

<div class="grid cards" markdown>

-   __Réseau__

    Routage, NAT/PAT, VLAN, ACL et méthode de dépannage réseau par couche.

    [Ouvrir la section](reseau/index.md)

-   __Systèmes__

    Administration Windows Server, Ubuntu Server et conteneurisation Docker / DevOps.

    [Ouvrir la section](systemes/index.md)

-   __Cybersécurité__

    Filtrage par ACL Cisco, pfSense, WireGuard, durcissement et délégation de privilèges avec sudo.

    [Ouvrir la section](securite/index.md)

-   __Projets transverses__

    Architectures complètes combinant plusieurs briques — la vision globale, pas une technologie isolée.

    [Ouvrir la section](projets-transverses/index.md)

-   __Services__

    NetBox, Pi-hole, Nginx Proxy Manager, supervision.

    [Ouvrir la section](services/index.md)

-   __Mémos__

    Aide-mémoire synthétiques des commandes Cisco IOS et Netplan.

    [Ouvrir la section](memos/cisco-ios.md)

</div>

## Comment lire une fiche

Les fiches par technologie suivent la même structure : contexte, prérequis, topologie, procédure, plan de retour arrière, vérification, dépannage. La section **Vérification** donne la commande qui prouve que la configuration fonctionne — c'est elle qu'il faut lancer avant de considérer une manipulation terminée.

Les fiches de [Projets transverses](projets-transverses/index.md) suivent une structure différente, pensée pour une architecture multi-briques plutôt qu'une procédure unique — voir leur page d'index.

Les [conventions d'écriture](conventions.md) détaillent les notations utilisées. Le [gabarit](gabarit.md) sert de point de départ pour toute nouvelle fiche par technologie.
