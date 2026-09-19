# Projets transverses

Les autres sections documentent une technologie à la fois : une commande de routage, un tunnel, un annuaire, pris isolément. Cette section fait l'inverse — elle documente des architectures complètes, où plusieurs briques s'assemblent pour répondre à un besoin métier. C'est là que se joue la vision globale attendue en SISR : une infrastructure ne vaut pas par la somme de ses technologies, mais par la façon dont elles s'articulent.

Une fiche de projet ne réexplique pas chaque brique en détail — elle renvoie vers la fiche unitaire correspondante quand elle existe, et se concentre sur ce qu'une fiche unitaire ne peut pas montrer : pourquoi cette architecture, dans quel ordre la construire, et surtout **où les briques se touchent** — c'est précisément à ces points de contact que les architectures mal conçues échouent.

## À rédiger

- [ ] Portail web interne en HTTPS : Nginx Proxy Manager, certificats automatiques, résolution interne via Pi-hole
- [ ] Inventaire et documentation d'infrastructure : NetBox comme source de vérité, alimenté par le déploiement réel
- [ ] Zone DMZ : segmentation pare-feu, relais DNS, filtrage applicatif pour un service exposé
- [ ] Conteneurs en production : ferme Docker derrière un reverse proxy, sauvegarde et supervision

## Gabarit de projet

Structure différente de celle des fiches unitaires ([gabarit général](../gabarit.md)) — copier le bloc ci-dessous pour démarrer une nouvelle fiche de projet.

````markdown
# Titre du projet

## Contexte métier

Le besoin auquel répond cette architecture, en une situation concrète — pas une liste de technologies.

## Architecture globale

```mermaid
flowchart LR
    Client["Poste client"]
    FW((Pare-feu))
    SRV["Serveur"]

    Client --- FW
    FW --- SRV
```

Un paragraphe par zone du schéma : ce qu'elle contient, ce qui la sépare des autres.

## Composants et rôle de chacun

| Composant | Rôle | Fiche détaillée |
|---|---|---|
| | | |

## Séquencement du déploiement

1. Étape, et pourquoi elle doit précéder la suivante.

## Points d'intégration critiques

Ce qui ne fonctionne que si les briques sont correctement raccordées entre elles : règles de pare-feu qui laissent passer un flux précis, résolution de noms qui traverse une frontière réseau, route retour, authentification partagée ou volontairement séparée.

## Vérification de bout en bout

Un test qui traverse toute la chaîne, pas brique par brique.

## Plan de retour arrière global

L'ordre dans lequel désactiver chaque brique sans casser les autres.
````
