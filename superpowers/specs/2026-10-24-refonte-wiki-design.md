# Refonte du wiki — note de design

## Contexte et objectif

Site utilisé en priorité comme aide-mémoire personnel (TP, stage, homelab). Trois problèmes identifiés :

1. Mise en page trop dense, parcours pas assez fluide.
2. Organisation du contenu à revoir (sections vides, découpage, pas de fil conducteur pour un nouveau lecteur).
3. Fonctionnalités manquantes : recherche/filtres, page d'accueil plus riche, tags transverses.

Ces trois points ne se traitent pas d'un bloc : ils dépendent les uns des autres (tags et accueil s'appuient sur la structure finale ; la recherche s'appuie sur les tags). Décomposé en 5 sous-projets, chacun brainstormé et validé séparément :

1. **Architecture de l'information** (ce document) — fondation
2. Mise en page / espacement
3. Page d'accueil et chemin de lecture
4. Tags / catégories transverses
5. Recherche / filtres

## Sous-projet 1 — Architecture de l'information

### Décisions validées

- **Sections vides retirées du menu** jusqu'à contenu réel : Systèmes, Services, Projets transverses disparaissent de `nav`. Leurs listes « à rédiger » sont consolidées dans `Changement.txt` (backlog hors navigation, à la racine du dépôt).
- **Docker obtient sa propre section** « Conteneurisation » (le fichier vivait déjà dans `docs/conteneurisation/`, seule la navigation change).
- **Dépannage réseau reste rattaché à Réseau** dans le menu — non identifié comme un problème, pas de changement sans raison.
- **Pas de parcours de lecture imposé** entre sections : usage en aide-mémoire ponctuel, chaque section reste accessible directement. Le « fil conducteur » se traite plutôt au niveau de la page d'accueil (sous-projet 3), pas de l'ordre des onglets.
- Le gabarit de projet transverse (actuellement dans `projets-transverses/index.md`) est récupéré comme second modèle dans `gabarit.md` avant suppression de la page stub, pour ne pas perdre ce contenu réutilisable.

### Nav résultant

Accueil · Réseau · Conteneurisation · Cybersécurité · Mémos

### Fichiers touchés

- `mkdocs.yml` — nav + `i18n.nav_translations`
- `docs/index.md` / `.en.md` — cartes d'accueil, paragraphe « Comment lire une fiche »
- `docs/conventions.md` / `.en.md` — lien vers le gabarit de projet
- `docs/reseau/index.md` / `.en.md` — lien Docker vers Conteneurisation
- `docs/gabarit.md` / `.en.md` — ajout du gabarit de projet
- Suppression : `docs/systemes/index.md(.en.md)`, `docs/services/index.md(.en.md)`, `docs/projets-transverses/index.md(.en.md)`
- Création : `Changement.txt` (backlog consolidé)

### Hors scope de ce sous-projet

Mise en page, page d'accueil enrichie, tags, recherche — traités dans les sous-projets suivants.

## Sous-projet 2 — Mise en page / espacement

### Décisions validées

Approche retenue : réglages ciblés plutôt qu'un indicateur de progression sur-mesure (trop pour le gain) ou un retour aux réglages par défaut de Material (dilue l'identité visuelle déjà posée, pas le problème signalé).

- **Fil d'Ariane retiré** (`navigation.path`) : redondant avec les onglets + le menu latéral qui montrent déjà la hiérarchie.
- **`toc_depth` remonté à 3** et suppression de la règle CSS qui masquait les sous-niveaux du sommaire de droite (`.md-nav--secondary .md-nav { display: none; }`) : les étapes numérotées (`### 1.`, `### 2.`...) d'une procédure apparaissent maintenant dans le sommaire, qui se surligne au scroll — c'est le repère « où j'en suis », sans rien construire de nouveau.
- **Marges aérées** : `h2` (2.5em → 3em au-dessus, 0.75em → 1em en dessous), paragraphes (`--sp-4` → `--sp-6`), blocs de code (marge verticale ajoutée), grille de cartes de l'accueil (`gap` + `padding` augmentés).

Vérifié visuellement via `mkdocs serve` + aperçu navigateur (accueil et une fiche longue avec blocs de code) avant validation finale, plutôt qu'avec des maquettes génériques.

### Hors scope de ce sous-projet

Contenu de la page d'accueil, tags, recherche — sous-projets suivants.

## Sous-projet 3 — Page d'accueil et chemin de lecture

### Décisions validées

- **Priorité : accès rapide**, pas vue d'ensemble — usage principal en aide-mémoire. La structure actuelle de l'accueil (intro + grille de sections + « Comment lire une fiche ») reste quasi inchangée, elle fait déjà ce travail.
- **Pas de parcours de lecture imposé** — cohérent avec la décision du sous-projet 1 (chaque section indépendante). Le besoin de « fil conducteur pour un nouveau lecteur » se résout plutôt par un repère léger de fraîcheur du contenu, pas par un ordre forcé.
- **Ajout : bloc « Récemment modifié »**, discret, en bas de l'accueil (3 liens, après « Comment lire une fiche »), en FR et EN.
- **Génération automatique** via un hook mkdocs natif (`hooks/recent_pages.py`, déclaré dans `mkdocs.yml`, aucune dépendance supplémentaire) qui lit les dates `git log` des fiches de contenu au moment du build. Fonctionne en local et en CI (`fetch-depth: 0` déjà posé dans le workflow). Pages d'accueil, de référence et index de section exclus du classement.
- Vérifié visuellement via `mkdocs serve` (FR et EN) avant validation.

### Hors scope de ce sous-projet

Tags, recherche — sous-projets suivants.
