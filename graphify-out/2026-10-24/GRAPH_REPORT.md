# Graph Report - doc-technique-main  (2026-09-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 26 nodes · 13 edges · 15 communities (2 shown, 13 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.93)
- Token cost: 444 input · 142 output

## Graph Freshness
- Built from commit: `b51d7c58`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Sudo Privilege Management
- Cisco Network Routing
- Documentation Project Home
- Cisco Network Troubleshooting
- GitHub Pages Deployment
- Docker Containerization
- Documentation Conventions
- Document Templates
- Netplan Configuration
- English Services Index
- French Services Index
- English Systems Index
- System Indexing
- Template Override System
- Partial Source Overrides

## God Nodes (most connected - your core abstractions)
1. `Privilege delegation with sudo` - 4 edges
2. `Routage statique` - 3 edges
3. `NOEXEC Security Option` - 2 edges
4. `Délégation de droits avec sudo` - 2 edges
5. `NAT et PAT` - 2 edges
6. `Accueil` - 2 edges
7. `Sudoers Aliases` - 1 edges
8. `visudo Utility` - 1 edges
9. `RIP version 2` - 1 edges
10. `ACL Cisco` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Accueil` --conceptually_related_to--> `BTS SIO SISR`  [INFERRED]
  docs/index.md → README.md
- `Privilege delegation with sudo` --semantically_similar_to--> `Délégation de droits avec sudo`  [INFERRED] [semantically similar]
  docs/securite/sudo-delegation.en.md → docs/securite/sudo-delegation.md
- `Délégation de droits avec sudo` --conceptually_related_to--> `NOEXEC Security Option`  [EXTRACTED]
  docs/securite/sudo-delegation.md → docs/securite/sudo-delegation.en.md
- `Routage statique` --conceptually_related_to--> `NAT et PAT`  [EXTRACTED]
  docs/reseau/routage-statique.md → docs/reseau/nat-pat.md
- `ACL Cisco` --references--> `NAT et PAT`  [EXTRACTED]
  docs/securite/cisco-acl.md → docs/reseau/nat-pat.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Network Configuration & Troubleshooting** — docs_reseau_routage_statique_md, docs_reseau_rip_v2_md, docs_reseau_nat_pat_md, docs_depannage_index_md [EXTRACTED 0.90]
- **Sudo Security Best Practices** — concept_sudo_noexec, concept_sudo_visudo, concept_sudo_aliases [EXTRACTED 0.90]

## Communities (15 total, 13 thin omitted)

### Community 0 - "Sudo Privilege Management"
Cohesion: 0.50
Nodes (5): Sudoers Aliases, NOEXEC Security Option, visudo Utility, Privilege delegation with sudo, Délégation de droits avec sudo

### Community 1 - "Cisco Network Routing"
Cohesion: 0.50
Nodes (4): NAT et PAT, RIP version 2, Routage statique, ACL Cisco

## Knowledge Gaps
- **18 isolated node(s):** `Sudoers Aliases`, `visudo Utility`, `Services Index (FR)`, `Systems Index (EN)`, `Systems Index (FR)` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 19 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Routage statique` connect `Cisco Network Routing` to `Documentation Project Home`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `Sudoers Aliases`, `visudo Utility`, `Services Index (FR)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._