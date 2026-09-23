# Routage dynamique — RIP version 2

## Contexte

Faire apprendre automatiquement les routes entre plusieurs routeurs, sans les saisir une à une. RIPv2 convient aux petites topologies (moins de 15 sauts) où la simplicité de mise en œuvre prime sur la rapidité de convergence — au-delà, ou sur un réseau plus exigeant, on lui préfère OSPF.

## Prérequis

- Au moins deux routeurs Cisco (IOS 15.x ou plus récent) avec accès en mode privilégié
- Les interfaces déjà adressées, [routage statique](routage-statique.md) désactivé sur les réseaux concernés pour éviter les conflits de source d'information
- Le plan d'adressage de référence des [conventions](../conventions.md)

## Topologie

```mermaid
flowchart LR
    PC1["PC1"]
    R1(("R1"))
    R2(("R2"))
    SRV1["SRV1"]

    PC1 ---|"Gi0/1 · 192.168.10.1/24"| R1
    R1 ===|"Gi0/0 ↔ Gi0/0 · 10.0.0.0/30<br>domaine RIP"| R2
    R2 ---|"Gi0/1 · 192.168.20.1/24"| SRV1
```

## Procédure

### 1. Activer RIP et déclarer la version

```cisco
enable
configure terminal
router rip
 version 2
 no auto-summary
```

!!! warning "`no auto-summary` n'est pas optionnel"
    Sans cette commande, RIPv2 résume automatiquement les routes à la frontière de classe (agrégation en classe A/B/C), comme le fait RIPv1. Sur un plan d'adressage en sous-réseaux discontinus, cela casse le routage sans message d'erreur visible.

### 2. Déclarer les réseaux directement connectés

```cisco
network 192.168.10.0
network 10.0.0.0
```

`network` prend l'adresse de classe complète, pas le préfixe exact de l'interface — IOS retrouve lui-même le bon masque sur l'interface concernée.

### 3. Configurer R2 symétriquement

```cisco
enable
configure terminal
router rip
 version 2
 no auto-summary
 network 192.168.20.0
 network 10.0.0.0
```

### 4. Désactiver l'émission sur les interfaces côté LAN

RIP diffuse ses annonces sur toutes les interfaces déclarées par `network`, y compris celles qui ne mènent qu'à des postes clients. C'est inutile et légèrement exposé.

```cisco
router rip
 passive-interface GigabitEthernet0/1
```

L'interface reste dans le processus RIP — son réseau continue d'être annoncé aux autres routeurs — mais R1 n'y envoie plus de mises à jour.

### 5. Injecter une route par défaut (sur le routeur de bordure)

```cisco
ip route 0.0.0.0 0.0.0.0 203.0.113.1
router rip
 default-information originate
```

Sans `default-information originate`, la route par défaut reste locale au routeur de bordure et n'est pas propagée aux autres routeurs RIP.

### 6. Authentifier les échanges (recommandé au-delà d'une maquette)

```cisco
key chain RIP-KEYS
 key 1
  key-string <clé-partagée>
exit
interface GigabitEthernet0/0
 ip rip authentication mode md5
 ip rip authentication key-chain RIP-KEYS
```

!!! note "Pourquoi authentifier"
    Sans cela, n'importe quel équipement connecté au segment peut annoncer de fausses routes RIP et détourner du trafic. L'authentification MD5 est un minimum, pas une garantie absolue, mais elle ferme la porte la plus large.

### 7. Enregistrer

```cisco
end
copy running-config startup-config
```

## Plan de retour arrière

Deux cas selon que RIP a été introduit uniquement pour cette procédure, ou qu'il gère déjà d'autres réseaux sur ce routeur.

=== "RIP introduit pour cette procédure"

    Supprimer tout le processus :

    ```cisco
    configure terminal
    no router rip
    end
    copy running-config startup-config
    ```

    `no router rip` retire l'ensemble de la configuration RIP d'un coup — réseaux déclarés, `passive-interface`, `default-information originate` inclus.

=== "RIP déjà utilisé pour d'autres réseaux"

    Retirer uniquement ce qui a été ajouté :

    ```cisco
    configure terminal
    router rip
     no network 192.168.10.0
     no passive-interface GigabitEthernet0/1
     no default-information originate
    exit
    end
    copy running-config startup-config
    ```

!!! warning "Un retour arrière RIP peut couper des routes en silence"
    Une fois le processus arrêté, les routes qu'il annonçait disparaissent progressivement de la table sur les autres routeurs (jusqu'au timeout). Si aucune route statique de secours n'existe, la connectivité se coupe sans message d'erreur explicite au moment du retrait.

## Vérification

```cisco
show ip protocols
show ip route rip
show ip rip database
```

Dans `show ip route`, les routes apprises par RIP apparaissent préfixées `R`, avec une distance administrative de 120 : `R 192.168.20.0/24 [120/1] via 10.0.0.2, 00:00:12, GigabitEthernet0/0`. Le chiffre entre crochets est le nombre de sauts — RIP écarte toute route à plus de 15 sauts.

Pour observer les échanges de mises à jour en direct sur une maquette :

```cisco
debug ip rip
undebug all
```

!!! danger "`debug` en production"
    Comme pour le NAT, `debug ip rip` charge le processeur en continu. Réservé aux environnements de test.

## Dépannage

| Symptôme | Cause probable | Correction |
|---|---|---|
| Aucune route `R` n'apparaît | Réseau non déclaré, ou déclaré avec la mauvaise adresse de classe | Vérifier `network` avec `show ip protocols` (section *Routing for Networks*) |
| Route apprise puis retirée après ~3 minutes | Voisin injoignable, timeout RIP atteint | Vérifier la liaison physique et l'adressage de l'interface commune |
| Routes en boucle ou instables | Auto-résumé actif sur un plan discontinu | Ajouter `no auto-summary` sur tous les routeurs du domaine RIP |
| La route par défaut n'atteint pas les autres routeurs | `default-information originate` absent | L'ajouter sur le routeur qui détient la route `0.0.0.0/0` |
| Une route statique reste prioritaire alors que RIP a une meilleure métrique | Distance administrative : statique = 1, RIP = 120 | Comportement normal — retirer ou augmenter la distance de la route statique si RIP doit prévaloir |
