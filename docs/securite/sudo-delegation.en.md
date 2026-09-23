# Privilege delegation with sudo

## Context

`sudo` lets you grant a user or group specific rights, without opening up full or permanent root access. Every command run with elevation is also logged with the name of the user who ran it — unlike sharing a single admin account, where every trace becomes anonymous.

Common uses: installing packages, system updates, managing services, changing network configuration.

This page also covers a point that's often overlooked: a poorly scoped delegation can be exploited to get full root access. The end of the page documents that risk and how to fix it.

## Prerequisites

- A Linux machine (Debian or Ubuntu) with root access
- `sudo` installed — check with `sudo --version`
- An account that already has root rights, to create the test accounts

## Accounts used in this procedure

| Account | Status | Role |
|---|---|---|
| `root` | Superuser | Reference account, full rights |
| `lambda` | Standard user | No particular rights, used as a control |
| `superman` | Member of the `sudo` group | Illustrates full root access via the group |
| `epsilon` | Precise delegated rights | Illustrates a targeted delegation, then its bypass |
| `omicron`, `omega` | `TECHINFO` alias | Illustrate aliases and a separate file under `sudoers.d` |

!!! note "Root account on Ubuntu"
    Unlike Debian, the Ubuntu installer doesn't set a root password: the account stays locked (`L` in `passwd -S root`, or `!`/`*` in `/etc/shadow`), and the first user created gets sudo rights directly.

## Procedure

### 1. Check the installation and the sudoers file

```bash
sudo --version
ls -al /etc/sudoers
ls -al /etc/sudoers.d/
```

`/etc/sudoers` is only readable by root (`r--r-----`). The `/etc/sudoers.d/` directory extends its configuration: any file placed there is read as an addition to the main file, provided `/etc/sudoers` contains the line `@includedir /etc/sudoers.d`.

### 2. Watch the default behavior, with no delegation

A freshly created user, with no entry in `sudoers`, can neither read nor modify a file reserved for root:

```bash
adduser lambda
su lambda
nano /etc/shadow
sudo nano /etc/hosts
```

The first command fails for lack of permission. The second asks for `lambda`'s password, then refuses: *"lambda is not in the sudoers file"*.

!!! note "This failure still gets logged"
    A refused `sudo` attempt leaves a trace in the logs, just like a successful one — see the Verification section.

### 3. Grant full rights via the `sudo` group

This is the broadest delegation: adding the user to the `sudo` group gives them, once their password is entered, the equivalent of root rights on any command.

```bash
adduser superman sudo
id superman
```

`id` should now show `27(sudo)` in the group list.

!!! warning "Reserve this for accounts that are genuinely administrators"
    Without finer-grained configuration, `superman` can run any command as root. It's the simplest delegation level to set up, but also the least controlled.

### 4. Edit sudoers with `visudo`

Editing `/etc/sudoers` directly with a text editor isn't recommended: `visudo` validates the syntax before saving and locks the file for the duration of the edit, to keep an invalid save from breaking `sudo` or two admins from writing at the same time.

```bash
sudo visudo
```

If the file is already open by another admin, `visudo` replies *"/etc/sudoers is currently being edited, try again later"* rather than allowing a concurrent edit. A syntax error at save time is also flagged, with the offending line number, and offers a chance to fix it before quitting.

The editor `visudo` uses (`nano` or `vi` by default, depending on the distribution) is changed with:

```bash
sudo update-alternatives --config editor
```

### 5. Delegate a precise right to a user

Create `epsilon`, without adding them to the `sudo` group, then grant them only the right to edit a specific file:

```bash
adduser epsilon
sudo visudo
```

Add the line:

```text
epsilon ALL=(ALL) /usr/bin/vi /etc/hosts
```

The syntax reads: `user` `hosts=(as whom)` `allowed command(s)`. Here, `ALL` in the host position means the rule applies regardless of machine name (only useful if this file is shared across several hosts, for example via LDAP); `(ALL)` means `epsilon` can take on the identity of any user, root included by default if none is specified.

Check it: `epsilon` can now edit `/etc/hosts` via `sudo vi /etc/hosts`, but stays blocked on every other command — including `sudo vi /etc/hostname` or `sudo passwd lambda`, which explicitly return *"user epsilon is not allowed to execute…"*.

!!! tip "The full path is mandatory"
    `sudoers` compares the exact path of the command, not just its name. A rule on `/usr/bin/vi` doesn't allow `/usr/bin/nano`, even if the user has set `nano` as their default editor.

### 6. The risk: bypassing an overly broad delegation

This step illustrates a classic configuration flaw, not a practice to reproduce as-is — the fix is in the next step.

The weak point: the rule from step 5 grants privilege elevation for the whole editing session, not just for writing the file. And `vi` lets you run a shell command from inside the editor, with `:!`. That shell command then inherits the root rights of the current `sudo` session.

```text
:!passwd root
```

From the editor opened by `sudo vi /etc/hosts`, this sequence changes the root password with no rule explicitly allowing it — the restriction only covered the `vi` command, not what it can be made to do once running.

!!! danger "Scope of the risk"
    A user who should only have access to a single file gets, through this, a full root shell. They can change the root password — the legitimate administrator then loses access, while the user who exploited the flaw can log in as root and carry on.

One more thing worth noting: checking the `sudo`-related logs afterward only shows the initial `vi /etc/hosts` command, never the shell command run from inside the editor. Only the logs specific to the command actually executed downstream — here `passwd`, via `journalctl _COMM=passwd` — reveal that a password was changed at that moment, without directly pointing to who did it.

### 7. Fixing it: the NOEXEC option

`NOEXEC` stops the allowed command from launching a subshell or an external program — which blocks exactly the `:!` escape demonstrated above.

```bash
sudo visudo
```

```text
epsilon ALL=(ALL) NOEXEC:/usr/bin/vi /etc/hosts
```

With this option, the escape attempt fails. The same principle applies to `nano` and any other editor or program with a way to run external commands.

### 8. Restricting a command with exclusions

A rule can forbid specific arguments of an otherwise allowed command, using `!`. Example: allow `epsilon` to change any user's password, except root's.

```text
epsilon ALL=(ALL) /usr/bin/passwd, !/usr/bin/passwd root
```

!!! warning "A named exclusion isn't always enough"
    With this rule alone, `epsilon` can still run `sudo passwd --expire lambda` or `sudo passwd -l lambda`, which force expiration or lock an account without going through the excluded argument. To limit `passwd` to strictly named use, also constrain the shape of the accepted argument:

```text
epsilon ALL=(ALL) /usr/bin/passwd [A-Za-z0-9]*, !/usr/bin/passwd root
```

This expression only allows `passwd` with a username made of letters and digits, which excludes options starting with `-` or `--`.

### 9. Grouping with aliases, in a separate file

For repetitive rules, `sudoers` accepts aliases for users, hosts, and commands. They can be defined directly in `/etc/sudoers`, or in a dedicated file under `/etc/sudoers.d/` — which keeps the customization isolated from the main file.

Example scenario: two technicians (`omicron`, `omega`) need to edit `/etc/network/interfaces` and `/etc/resolv.conf` with `sudoedit`, and run `ifdown`/`ifup`, only on the machines `srv1` and `srv2`.

```text
# /etc/sudoers.d/SUDO_TECHINFO
User_Alias    TECHINFO = omicron, omega
Host_Alias    SRVINFO  = srv1, srv2
Cmnd_Alias    NETCDES  = /usr/sbin/ifdown, /usr/sbin/ifup, sudoedit /etc/network/interfaces, sudoedit /etc/resolv.conf

TECHINFO SRVINFO=(ALL) NETCDES
```

## Rollback plan

=== "Rule added in /etc/sudoers"

    ```bash
    sudo visudo
    ```

    Delete the added line (for example `epsilon ALL=(ALL) NOEXEC:/usr/bin/vi /etc/hosts`), then save. `visudo` revalidates the syntax on exit: it's impossible to leave the file in a broken state, even when removing something.

=== "Separate file in sudoers.d"

    ```bash
    sudo rm /etc/sudoers.d/SUDO_TECHINFO
    ```

    A file isolated in `sudoers.d` is removed without touching the main file — a concrete advantage of this approach over a rule added directly in `/etc/sudoers`.

!!! tip "Keep a copy before editing"
    `visudo` doesn't keep a history of previous versions. Before a change in a real environment, `sudo cp /etc/sudoers /etc/sudoers.bak-$(date +%F)` lets you get back to the prior state with a simple copy if the targeted removal turns out incomplete.

If the accounts created for this procedure (`lambda`, `superman`, `epsilon`, `omicron`, `omega`) have no use beyond the test, removing them fully settles the rollback:

```bash
sudo deluser --remove-home epsilon
```

## Verification

```bash
id <user>
groups <user>
sudo -l
```

`sudo -l`, run by the user concerned, lists the commands they're allowed to run with `sudo` — the most direct way to confirm a rule has the intended effect, without testing every command one by one.

```bash
journalctl | grep sudo
journalctl _COMM=passwd
```

Every `sudo` attempt, successful or refused, is logged with the user's identity. However, a shell command launched *from* a program elevated by `sudo` (see step 6) doesn't show up under `sudo` in the logs — only the log trail of the program actually executed downstream (here `passwd`) lets you find it.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| *"user is not in the sudoers file"* | No rule concerns this account | Add the user to the `sudo` group, or write them a dedicated rule with `visudo` |
| *"/etc/sudoers is currently being edited, try again later"* | A `visudo` session is already open elsewhere | Wait for the other edit to finish, or check that no session was left stuck |
| Syntax error flagged on save | Malformed line in `sudoers` | Fix the line at the given line number before exiting `visudo` |
| Command refused even though the rule looks correct | Command path differs from the one declared in the rule | Check the exact path with `which <command>` and align it with the rule |
| A restricted user manages to run an arbitrary command | Missing `NOEXEC` on an interactive command (editor, pager, etc.) | Add `NOEXEC:` in front of the command concerned |
| An exclusion (`!command`) doesn't prevent a bypass | The exclusion doesn't cover every variant of the command | Also restrict the shape of the accepted arguments, not just one named case |
