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
```
git add .
git commit -m "Ajout de la fiche VLAN et trunk"
git push
```

Si la pastille passe au rouge : Actions → clique sur l'exécution → job build → déplie l'étape mkdocs build. 
Le message indique le fichier et le lien fautifs. Dans neuf cas sur dix, c'est un lien relatif vers une page renommée ou pas encore créée.

Un dernier point : quand tu ajoutes une fiche, pense à la déclarer dans la section nav de mkdocs.yml. 
Sans ça, la page est bien publiée et trouvable par la recherche, mais elle n'apparaît nulle part dans le menu latéral — et le build ne te préviendra pas, puisque ce n'est pas une erreur.

## Ajouter une fiche

1. Copier le gabarit de `docs/gabarit.md` dans le dossier de la section concernée.
2. Nommer le fichier en minuscules sans accent : `vlan-trunk.md`.
3. Déclarer la page dans la section `nav` de `mkdocs.yml`.
