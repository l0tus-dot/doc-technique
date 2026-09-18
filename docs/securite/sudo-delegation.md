# Délégation de droits avec sudo

## Contexte

`sudo` permet d'accorder à un utilisateur ou à un groupe des droits précis, sans lui ouvrir un accès root complet ni permanent. Chaque commande exécutée avec élévation est en outre consignée dans les journaux avec le nom de l'utilisateur qui l'a lancée — contrairement au partage d'un compte administrateur unique, où toute trace devient anonyme.

Usages courants : installation de paquets, mises à jour système, gestion de services, modification de la configuration réseau.

Cette fiche couvre aussi un point de vigilance souvent négligé : une délégation mal bornée peut être détournée pour obtenir un accès root complet. La fin de la fiche documente ce risque et sa correction.

## Prérequis

- Une machine Linux (Debian ou Ubuntu) avec un accès root
- `sudo` installé — vérifier avec `sudo --version`
- Un compte disposant déjà des droits root pour créer les comptes de test

## Comptes utilisés dans cette procédure

| Compte | Statut | Rôle |
|---|---|---|
| `root` | Super-utilisateur | Compte de référence, tous les droits |
| `lambda` | Utilisateur standard | Aucun droit particulier, sert de témoin |
| `superman` | Membre du groupe `sudo` | Illustre l'accès root complet via le groupe |
| `epsilon` | Droits délégués précis | Illustre une délégation ciblée, puis son contournement |
| `omicron`, `omega` | Alias `TECHINFO` | Illustrent les alias et un fichier séparé dans `sudoers.d` |

!!! note "Compte root sur Ubuntu"
    Contrairement à Debian, l'installateur Ubuntu ne définit pas de mot de passe root : le compte reste verrouillé (`L` dans `passwd -S root` ou `!`/`*` dans `/etc/shadow`), et le premier utilisateur créé reçoit directement les droits sudo.

## Procédure

### 1. Vérifier l'installation et le fichier sudoers

```bash
sudo --version
ls -al /etc/sudoers
ls -al /etc/sudoers.d/
```

`/etc/sudoers` n'est lisible que par root (`r--r-----`). Le répertoire `/etc/sudoers.d/` complète sa configuration : tout fichier qui s'y trouve est lu comme un ajout au fichier principal, à condition que `/etc/sudoers` contienne la ligne `@includedir /etc/sudoers.d`.

### 2. Observer le comportement par défaut, sans délégation

Un utilisateur fraîchement créé, sans entrée dans `sudoers`, ne peut ni lire ni modifier un fichier réservé à root :

```bash
adduser lambda
su lambda
nano /etc/shadow
sudo nano /etc/hosts
```

La première commande échoue par manque de permission. La seconde demande le mot de passe de `lambda`, puis refuse : *« lambda n'est pas dans le fichier sudoers »*.

!!! note "Cet échec est tout de même journalisé"
    Une tentative de `sudo` refusée laisse une trace dans les journaux, au même titre qu'un usage réussi — voir la section Vérification.

### 3. Accorder tous les droits via le groupe `sudo`

C'est la délégation la plus large : ajouter l'utilisateur au groupe `sudo` lui donne, une fois son mot de passe saisi, l'équivalent des droits root sur toute commande.

```bash
adduser superman sudo
id superman
```

`id` doit maintenant faire apparaître `27(sudo)` dans la liste des groupes.

!!! warning "À réserver aux comptes réellement administrateurs"
    Sans configuration plus fine, `superman` peut exécuter n'importe quelle commande en tant que root. C'est le niveau de délégation le plus simple à mettre en place, mais aussi le moins contrôlé.

### 4. Éditer sudoers avec `visudo`

Modifier `/etc/sudoers` directement avec un éditeur de texte est déconseillé : `visudo` valide la syntaxe avant d'enregistrer et verrouille le fichier le temps de l'édition, pour éviter qu'un enregistrement invalide ne rende `sudo` inutilisable ou que deux administrateurs n'écrivent en même temps.

```bash
sudo visudo
```

Si le fichier est déjà ouvert par un autre administrateur, `visudo` répond *« /etc/sudoers n'est pas disponible, réessayez plus tard »* plutôt que d'autoriser une édition concurrente. Une erreur de syntaxe à l'enregistrement est elle aussi signalée, avec le numéro de ligne fautif, et propose de corriger avant de quitter.

L'éditeur utilisé par `visudo` (par défaut `nano` ou `vi` selon la distribution) se change avec :

```bash
sudo update-alternatives --config editor
```

### 5. Déléguer un droit précis à un utilisateur

Créer `epsilon`, sans l'ajouter au groupe `sudo`, puis lui accorder uniquement le droit d'éditer un fichier précis :

```bash
adduser epsilon
sudo visudo
```

Ajouter la ligne :

```text
epsilon ALL=(ALL) /usr/bin/vi /etc/hosts
```

La syntaxe se lit : `utilisateur` `hôtes=(en tant que qui)` `commande(s) autorisée(s)`. Ici, `ALL` en position hôte signifie que la règle s'applique quel que soit le nom de machine (utile seulement si ce fichier est partagé sur plusieurs postes, par exemple via LDAP) ; `(ALL)` signifie qu'`epsilon` peut prendre l'identité de n'importe quel utilisateur, root inclus par défaut si aucun n'est précisé.

Vérification : `epsilon` peut désormais modifier `/etc/hosts` via `sudo vi /etc/hosts`, mais reste bloqué sur toute autre commande — y compris `sudo vi /etc/hostname` ou `sudo passwd lambda`, qui renvoient explicitement *« l'utilisateur epsilon n'est pas autorisé à exécuter … »*.

!!! tip "Le chemin complet est obligatoire"
    `sudoers` compare le chemin exact de la commande, pas seulement son nom. Une règle sur `/usr/bin/vi` n'autorise pas `/usr/bin/nano`, même si l'utilisateur choisit `nano` comme éditeur par défaut.

### 6. Le risque : contourner une délégation trop large

Cette étape illustre une faille classique de configuration, pas une pratique à reproduire telle quelle — le correctif est à l'étape suivante.

Le point faible : la règle de l'étape 5 accorde une élévation de privilèges pour toute la durée de la session d'édition, pas seulement pour l'écriture du fichier. Or `vi` permet d'exécuter une commande shell depuis l'éditeur, avec `:!`. Cette commande shell hérite alors des droits root de la session `sudo` en cours.

```text
:!passwd root
```

Depuis l'éditeur ouvert par `sudo vi /etc/hosts`, cette séquence change le mot de passe root sans qu'aucune règle ne l'autorise explicitement — la restriction ne portait que sur la commande `vi`, pas sur ce qu'elle permet de faire une fois lancée.

!!! danger "Portée du risque"
    Un utilisateur qui ne devrait avoir accès qu'à un seul fichier obtient, par ce biais, un shell root complet. Il peut changer le mot de passe root — l'administrateur légitime perd alors son accès, tandis que l'utilisateur ayant exploité la faille peut se connecter en root et poursuivre.

Autre point à noter : consulter les journaux liés à `sudo` après coup ne montre que la commande `vi /etc/hosts` lancée initialement, jamais la commande shell exécutée depuis l'intérieur de l'éditeur. Seuls les journaux propres à la commande exécutée en aval — ici `passwd`, via `journalctl _COMM=passwd` — révèlent qu'un mot de passe a été changé à cet instant, sans indiquer directement qui en est à l'origine.

### 7. Corriger : l'option NOEXEC

`NOEXEC` empêche la commande autorisée de lancer un sous-shell ou un programme externe — ce qui bloque précisément l'échappement `:!` démontré ci-dessus.

```bash
sudo visudo
```

```text
epsilon ALL=(ALL) NOEXEC:/usr/bin/vi /etc/hosts
```

Avec cette option, la tentative d'échappement échoue. Le même principe s'applique à `nano` et à tout autre éditeur ou programme disposant d'une fonction d'exécution de commande externe.

### 8. Restreindre une commande avec des exclusions

Une règle peut interdire certains arguments précis d'une commande par ailleurs autorisée, avec `!`. Exemple : permettre à `epsilon` de changer le mot de passe de n'importe quel utilisateur, sauf celui de root.

```text
epsilon ALL=(ALL) /usr/bin/passwd, !/usr/bin/passwd root
```

!!! warning "Une exclusion nominative ne suffit pas toujours"
    Avec cette seule règle, `epsilon` reste capable d'exécuter `sudo passwd --expire lambda` ou `sudo passwd -l lambda`, qui forcent l'expiration ou verrouillent un compte sans passer par l'argument exclu. Pour limiter `passwd` à un usage strictement nominal, contraindre aussi la forme de l'argument accepté :

```text
epsilon ALL=(ALL) /usr/bin/passwd [A-Za-z0-9]*, !/usr/bin/passwd root
```

Cette expression n'autorise `passwd` qu'avec un nom d'utilisateur composé de lettres et de chiffres, ce qui exclut les options commençant par `-` ou `--`.

### 9. Regrouper avec des alias, dans un fichier séparé

Pour des règles répétitives, `sudoers` accepte des alias d'utilisateurs, d'hôtes et de commandes. Ils peuvent être définis directement dans `/etc/sudoers`, ou dans un fichier dédié sous `/etc/sudoers.d/` — ce qui isole la personnalisation du fichier principal.

Exemple de scénario : deux techniciens (`omicron`, `omega`) doivent pouvoir éditer `/etc/network/interfaces` et `/etc/resolv.conf` avec `sudoedit`, et lancer `ifdown`/`ifup`, uniquement sur les machines `srv1` et `srv2`.

```text
# /etc/sudoers.d/SUDO_TECHINFO
User_Alias    TECHINFO = omicron, omega
Host_Alias    SRVINFO  = srv1, srv2
Cmnd_Alias    NETCDES  = /usr/sbin/ifdown, /usr/sbin/ifup, sudoedit /etc/network/interfaces, sudoedit /etc/resolv.conf

TECHINFO SRVINFO=(ALL) NETCDES
```

## Plan de retour arrière

=== "Règle ajoutée dans /etc/sudoers"

    ```bash
    sudo visudo
    ```

    Supprimer la ligne ajoutée (par exemple `epsilon ALL=(ALL) NOEXEC:/usr/bin/vi /etc/hosts`), puis enregistrer. `visudo` revalide la syntaxe à la sortie : impossible de laisser le fichier dans un état cassé, y compris lors d'un retrait.

=== "Fichier séparé dans sudoers.d"

    ```bash
    sudo rm /etc/sudoers.d/SUDO_TECHINFO
    ```

    Un fichier isolé dans `sudoers.d` se retire sans toucher au fichier principal — c'est un avantage concret de cette approche par rapport à une règle ajoutée directement dans `/etc/sudoers`.

!!! tip "Garder une copie avant de modifier"
    `visudo` ne conserve pas d'historique des versions précédentes. Avant une modification en environnement réel, `sudo cp /etc/sudoers /etc/sudoers.bak-$(date +%F)` permet de revenir à l'état antérieur par une simple copie si le retrait ciblé s'avère incomplet.

Si les comptes créés pour cette procédure (`lambda`, `superman`, `epsilon`, `omicron`, `omega`) n'ont plus d'usage au-delà du test, les supprimer solde complètement le retour arrière :

```bash
sudo deluser --remove-home epsilon
```

## Vérification

```bash
id <utilisateur>
groups <utilisateur>
sudo -l
```

`sudo -l`, exécuté par l'utilisateur concerné, liste les commandes qu'il est autorisé à lancer avec `sudo` — c'est le moyen le plus direct de confirmer qu'une règle produit l'effet attendu, sans avoir à tester chaque commande une à une.

```bash
journalctl | grep sudo
journalctl _COMM=passwd
```

Toute tentative avec `sudo`, réussie ou refusée, est journalisée avec l'identité de l'utilisateur. En revanche, une commande shell lancée *depuis* un programme élevé par `sudo` (voir l'étape 6) n'apparaît pas sous `sudo` dans les journaux — seule la trace du programme réellement exécuté en aval (ici `passwd`) permet de la retrouver.

## Dépannage

| Symptôme | Cause probable | Correction |
|---|---|---|
| *« utilisateur n'est pas dans le fichier sudoers »* | Aucune règle ne concerne ce compte | Ajouter l'utilisateur au groupe `sudo`, ou lui écrire une règle dédiée avec `visudo` |
| *« /etc/sudoers n'est pas disponible, réessayez plus tard »* | Une session `visudo` est déjà ouverte ailleurs | Attendre la fin de l'autre édition, ou vérifier qu'aucune session n'est restée bloquée |
| Erreur de syntaxe signalée à l'enregistrement | Ligne mal formée dans `sudoers` | Corriger la ligne indiquée par le numéro de ligne fourni avant de quitter `visudo` |
| Commande refusée alors que la règle semble correcte | Chemin de la commande différent de celui déclaré dans la règle | Vérifier le chemin exact avec `which <commande>` et l'aligner sur la règle |
| Un utilisateur restreint parvient à exécuter une commande arbitraire | Absence de `NOEXEC` sur une commande interactive (éditeur, pager, etc.) | Ajouter `NOEXEC:` devant la commande concernée |
| Une exclusion (`!commande`) n'empêche pas un contournement | L'exclusion ne couvre pas toutes les variantes de la commande | Restreindre aussi la forme des arguments acceptés, pas seulement un cas nommé |
