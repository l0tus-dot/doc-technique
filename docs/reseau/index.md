# Réseau

Configuration des équipements d'interconnexion : routage, traduction d'adresses, segmentation et filtrage.

## Fiches disponibles

- [Routage statique](routage-statique.md) — interconnexion de deux LAN, route par défaut, distance administrative
- [RIP version 2](rip-v2.md) — routage dynamique, no auto-summary, route par défaut, authentification
- [NAT et PAT](nat-pat.md) — sortie du LAN derrière une adresse publique, publication d'un serveur
- [Docker](docker.md) — installation, réseau docker0, images, conteneurs, partage de fichiers avec l'hôte

Pour les pannes qui ne sont pas propres à une procédure précise, voir [Dépannage réseau](../depannage/index.md).

## À rédiger

- [ ] VLAN et liaison trunk (802.1Q)
- [ ] Routage inter-VLAN sur bâton
- [ ] OSPF aire unique
- [ ] Listes de contrôle d'accès standard et étendues
- [ ] Relais DHCP (`ip helper-address`)
- [ ] Agrégation de liens (EtherChannel)
