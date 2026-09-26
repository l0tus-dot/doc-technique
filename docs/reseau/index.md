# Réseau

Configuration des équipements d'interconnexion : routage, traduction d'adresses, segmentation et filtrage.

## Fiches disponibles

- [Routage statique](routage-statique.md) — interconnexion de deux LAN, route par défaut, distance administrative
- [RIP version 2](rip-v2.md) — routage dynamique, no auto-summary, route par défaut, authentification
- [NAT et PAT](nat-pat.md) — sortie du LAN derrière une adresse publique, publication d'un serveur
- [Dépannage réseau](../depannage/index.md) — méthode par couche et diagnostic des pannes fréquentes

Pour la conteneurisation et Docker, voir la section [Systèmes](../systemes/index.md).

Pour les listes de contrôle d'accès et le filtrage de sécurité, voir [Listes de contrôle d'accès (ACL Cisco)](../securite/cisco-acl.md) dans la section Cybersécurité.

## À rédiger

- [ ] VLAN et liaison trunk (802.1Q)
- [ ] Routage inter-VLAN sur bâton
- [ ] OSPF aire unique
- [ ] Relais DHCP (`ip helper-address`)
- [ ] Agrégation de liens (EtherChannel)
