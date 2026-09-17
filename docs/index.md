# Documentation technique

Les procédures que j'applique en TP, en stage et dans mon homelab : configuration réseau, administration système, sécurisation et services. Chaque fiche est écrite pour être rejouée telle quelle, avec les commandes de vérification qui vont avec.

## Par où commencer

<div class="grid cards" markdown>

-   __Réseau__

    Routage, NAT/PAT, VLAN, ACL. Les commandes Cisco IOS et leurs équivalents Linux.

    [Ouvrir la section](reseau/index.md)

-   __Systèmes__

    Windows Server (AD DS, DNS, DHCP, GPO) et Ubuntu Server.

    [Ouvrir la section](systemes/index.md)

-   __Cybersécurité__

    pfSense, WireGuard, durcissement, délégation de droits.

    [Ouvrir la section](securite/index.md)

-   __Services__

    NetBox, Pi-hole, Nginx Proxy Manager, supervision.

    [Ouvrir la section](services/index.md)

</div>

## Comment lire une fiche

Toutes les fiches suivent la même structure : contexte, prérequis, topologie, procédure, vérification, dépannage. La section **Vérification** donne la commande qui prouve que la configuration fonctionne — c'est elle qu'il faut lancer avant de considérer une manipulation terminée.

Les [conventions d'écriture](conventions.md) détaillent les notations utilisées. Le [gabarit](gabarit.md) sert de point de départ pour toute nouvelle fiche.
