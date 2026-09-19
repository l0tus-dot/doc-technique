# Documentation technique

Procédures réseau, systèmes et sécurité — BTS SIO SISR.

## Aperçu local

```bash
python -m venv .venv
source .venv/bin/activate        # Windows : .venv\Scripts\activate
pip install -r requirements.txt
mkdocs serve
```

Le site est servi sur <http://127.0.0.1:8000> et se recharge à chaque enregistrement.

## Mise en ligne

Chaque `git push` sur `main` déclenche le workflow `.github/workflows/deploy.yml`, qui construit le site et le publie sur GitHub Pages.

Avant le premier push : dans **Settings → Pages**, régler **Source** sur **GitHub Actions**.

## Ajouter une fiche

1. Copier le gabarit de `docs/gabarit.md` dans le dossier de la section concernée.
2. Nommer le fichier en minuscules sans accent : `vlan-trunk.md`.
3. Déclarer la page dans la section `nav` de `mkdocs.yml`.
