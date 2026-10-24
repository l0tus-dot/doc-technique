# Graph Report - doc-technique  (2026-10-24)

## Corpus Check
- 36 files · ~24,144 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 376 nodes · 400 edges · 32 communities (23 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `57365b3c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Privilege delegation with sudo
- NAT et PAT
- Routage statique
- Docker
- GitHub Pages Deployment
- reseau/index.md
- Dépannage réseau
- 3. Procédure d'application
- NAT and PAT
- recent_pages.py
- tags.md
- tags.en.md
- Template Override System
- Partial Source Overrides
- Dynamic routing — RIP version 2
- Listes de contrôle d'accès (ACL Cisco)
- Procédure
- Static routing
- Docker
- Netplan cheat sheet
- Network troubleshooting
- Procedure
- Conventions
- Conventions
- Sous-projet 1 — Architecture de l'information
- Gabarit de fiche
- Cisco IOS cheat sheet
- Documentation technique
- Page template
- CLAUDE.md
- .claude/CLAUDE.md
- 404.md

## God Nodes (most connected - your core abstractions)
1. `Docker` - 15 edges
2. `Docker` - 12 edges
3. `Privilege delegation with sudo` - 12 edges
4. `Dépannage réseau` - 11 edges
5. `NAT et PAT` - 11 edges
6. `Routage statique` - 11 edges
7. `Listes de contrôle d'accès (ACL Cisco)` - 11 edges
8. `Network troubleshooting` - 10 edges
9. `Mémo Cisco IOS` - 10 edges
10. `Délégation de droits avec sudo` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Accueil` --conceptually_related_to--> `BTS SIO SISR`  [INFERRED]
  docs/index.md → README.md
- `Privilege delegation with sudo` --semantically_similar_to--> `Délégation de droits avec sudo`  [INFERRED] [semantically similar]
  docs/securite/sudo-delegation.en.md → docs/securite/sudo-delegation.md
- `Routage statique` --conceptually_related_to--> `NAT et PAT`  [EXTRACTED]
  docs/reseau/routage-statique.md → docs/reseau/nat-pat.md
- `ACL Cisco` --references--> `NAT et PAT`  [EXTRACTED]
  docs/securite/cisco-acl.md → docs/reseau/nat-pat.md
- `RIP version 2` --references--> `Routage statique`  [EXTRACTED]
  docs/reseau/rip-v2.md → docs/reseau/routage-statique.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Network Configuration & Troubleshooting** — docs_reseau_routage_statique_routage_statique, docs_reseau_rip_v2_md, docs_reseau_nat_pat_nat_et_pat, docs_depannage_index_dépannage_réseau [EXTRACTED 0.90]
- **Sudo Security Best Practices** — concept_sudo_noexec, concept_sudo_visudo, concept_sudo_aliases [EXTRACTED 0.90]

## Communities (32 total, 9 thin omitted)

### Community 0 - "Privilege delegation with sudo"
Cohesion: 0.06
Nodes (30): Sudoers Aliases, NOEXEC Security Option, visudo Utility, Available pages, Cybersecurity, To be written, 1. Vérifier l'installation et le fichier sudoers, 2. Observer le comportement par défaut, sans délégation (+22 more)

### Community 1 - "NAT et PAT"
Cohesion: 0.12
Nodes (16): 1. Marquer les interfaces, 2. Définir le trafic à traduire, 3. Activer le PAT, 4. Variante : NAT dynamique avec un pool, 5. Exposer un serveur interne, 6. Enregistrer, Contexte, Dépannage (+8 more)

### Community 2 - "Routage statique"
Cohesion: 0.12
Nodes (16): BTS SIO SISR, Accueil, RIP version 2, 1. Adresser les interfaces de R1, 2. Déclarer la route vers le réseau distant, 3. Configurer R2 symétriquement, 4. Ajouter une route par défaut vers l'extérieur, 5. Enregistrer (+8 more)

### Community 3 - "Docker"
Cohesion: 0.05
Nodes (39): 10. Enregistrer un conteneur modifié, 11. Maintenance et nettoyage, 1. Installation, 2. Concepts clés, 3. Images, 4. Conteneurs — cycle de vie, 5. Réseau, 6. Volumes et persistance (+31 more)

### Community 5 - "reseau/index.md"
Cohesion: 0.12
Nodes (15): Comment lire une fiche, Documentation technique, How to read a page, Technical documentation, Where to start, Par où commencer, Available pages, Network (+7 more)

### Community 6 - "Dépannage réseau"
Cohesion: 0.11
Nodes (19): Adressage IP et DHCP, Commandes de diagnostic générales, Commutation et VLAN, Connectivité physique et liaison, Dépannage réseau, Méthode, Pare-feu et listes de contrôle d'accès, Performance et MTU (+11 more)

### Community 7 - "3. Procédure d'application"
Cohesion: 0.12
Nodes (16): 1. Fichiers de configuration, 1. Identifier l'interface et le fichier, 2. Sauvegarder avant de modifier, 2. Syntaxe du fichier YAML, 3. Procédure d'application, 3. Éditer le fichier, 4. Plan de retour arrière, 4. Valider la syntaxe sans appliquer (+8 more)

### Community 8 - "NAT and PAT"
Cohesion: 0.12
Nodes (15): 1. Mark the interfaces, 2. Define the traffic to translate, 3. Enable PAT, 4. Variant: dynamic NAT with a pool, 5. Expose an internal server, 6. Save, Context, Linux equivalent (+7 more)

### Community 9 - "recent_pages.py"
Cohesion: 0.38
Nodes (5): _git_timestamp(), on_page_markdown(), _recent_pages(), _render(), _title()

### Community 15 - "Dynamic routing — RIP version 2"
Cohesion: 0.13
Nodes (15): 1. Enable RIP and set the version, 2. Declare the directly connected networks, 3. Configure R2 symmetrically, 4. Disable announcements on LAN-facing interfaces, 5. Inject a default route (on the edge router), 6. Authenticate exchanges (recommended beyond a lab setup), 7. Save, Context (+7 more)

### Community 16 - "Listes de contrôle d'accès (ACL Cisco)"
Cohesion: 0.12
Nodes (16): 1. ACL standard — filtrer par IP source, 2. ACL étendue — filtrage L3/L4, 3. Trafic de retour — option `established`, 4. Restriction d'accès VTY — `access-class`, 5. Édition en production (numéros de séquence), Contexte, Dépannage, Listes de contrôle d'accès (ACL Cisco) (+8 more)

### Community 17 - "Procédure"
Cohesion: 0.13
Nodes (15): 1. Activer RIP et déclarer la version, 2. Déclarer les réseaux directement connectés, 3. Configurer R2 symétriquement, 4. Désactiver l'émission sur les interfaces côté LAN, 5. Injecter une route par défaut (sur le routeur de bordure), 6. Authentifier les échanges (recommandé au-delà d'une maquette), 7. Enregistrer, Contexte (+7 more)

### Community 18 - "Static routing"
Cohesion: 0.15
Nodes (13): 1. Address R1's interfaces, 2. Declare the route to the remote network, 3. Configure R2 symmetrically, 4. Add a default route to the outside, 5. Save, Context, Prerequisites, Procedure (+5 more)

### Community 19 - "Docker"
Cohesion: 0.15
Nodes (12): Containers — lifecycle, Default network, Docker, Images, Installation, Prerequisites, Rollback plan, Saving a modified container as a new image (+4 more)

### Community 20 - "Netplan cheat sheet"
Cohesion: 0.15
Nodes (12): 1. Identify the file and the interface, 2. Back up, then edit the file, 3. Check the syntax without applying anything, 4. Apply without risking losing access, 5. Fix the permissions if Netplan flags them, File location, Netplan cheat sheet, Procedure (+4 more)

### Community 21 - "Network troubleshooting"
Cohesion: 0.20
Nodes (10): Firewall and access control lists, General diagnostic commands, IP addressing and DHCP, Method, Name resolution (DNS), Network troubleshooting, Performance and MTU, Physical connectivity and data link (+2 more)

### Community 23 - "Procedure"
Cohesion: 0.20
Nodes (10): 1. Check the installation and the sudoers file, 2. Watch the default behavior, with no delegation, 3. Grant full rights via the `sudo` group, 4. Edit sudoers with `visudo`, 5. Delegate a precise right to a user, 6. The risk: bypassing an overly broad delegation, 7. Fixing it: the NOEXEC option, 8. Restricting a command with exclusions (+2 more)

### Community 24 - "Conventions"
Cohesion: 0.22
Nodes (8): Callouts, Conventions, Cross-cutting project pages, File naming, Notation, Reference addressing plan, Rollback plan, Topology diagrams

### Community 25 - "Conventions"
Cohesion: 0.25
Nodes (8): Conventions, Encarts, Fiches de projet transverse, Nommage des fichiers, Notations, Plan d'adressage de référence, Plan de retour arrière, Schémas de topologie

### Community 26 - "Sous-projet 1 — Architecture de l'information"
Cohesion: 0.11
Nodes (18): Contexte et objectif, Contexte important, Décisions validées, Décisions validées, Décisions validées, Décisions validées, Fichiers touchés, Hors scope de ce sous-projet (+10 more)

### Community 27 - "Gabarit de fiche"
Cohesion: 0.29
Nodes (7): Admonitions disponibles, Blocs de code, Conventions de rédaction, Gabarit de fiche, Gabarit de projet, Gabarit à copier, Rôle de chaque section

### Community 28 - "Cisco IOS cheat sheet"
Cohesion: 0.29
Nodes (6): Backup and reset, Cisco IOS cheat sheet, Diagnostics, Modes, SSH, Typical initial configuration

### Community 29 - "Documentation technique"
Cohesion: 0.40
Nodes (4): Ajouter une fiche, Aperçu local, Documentation technique, Mise en ligne

## Knowledge Gaps
- **8 isolated node(s):** `Sudoers Aliases`, `visudo Utility`, `ACL Cisco`, `Main Template Override`, `Source File Partial Override` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 290 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Docker` connect `Docker` to `reseau/index.md`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **What connects `Sudoers Aliases`, `visudo Utility`, `ACL Cisco` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Privilege delegation with sudo` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Why does `Privilege delegation with sudo` connect `Privilege delegation with sudo` to `Procedure`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `NAT et PAT` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Routage statique` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Docker` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._