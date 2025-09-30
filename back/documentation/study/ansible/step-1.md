# Fiche Ansible — Installation locale & ping de test (macOS)

## 1) Installer Ansible (via Homebrew)

*  Installer Ansible :

```bash
brew update
brew install ansible
ansible --version
```

## 2) Préparer l’arborescence de travail

*  Créer le dossier de démo :

```bash
mkdir -p ~/ansible-demo/{inventory,playbooks}
cd ~/ansible-demo
```

* Créer `ansible.cfg` (à la racine `~/ansible-demo/`) :

```ini
[defaults]
inventory = ./inventory/hosts.ini
host_key_checking = False
timeout = 30
forks = 10
pipelining = True
```

* Créer l’inventaire `inventory/hosts.ini` (adapter `IP` et `USER`) :

```ini
[demo]
server1 ansible_host=82.165.92.40 ansible_user=root ansible_ssh_private_key_file=/Users/canse/.ssh/id_ed25519
```

> Remplacer `~` par **le chemin absolu** évite les soucis : `/Users/canse/...`.

* Créer le playbook de ping `playbooks/ping.yml` :

```yaml
---
- name: Ping demo hosts
  hosts: demo
  gather_facts: false
  tasks:
    - name: Test SSH reachability with Ansible ping
      ansible.builtin.ping:
```

## 3) Gérer l’authentification SSH (clé > mot de passe)

**Décision :** utiliser **clé SSH** plutôt que **mot de passe** (plus sûr, plus rapide, scalable).

* Charger la clé dans l’agent SSH (passphrase mémorisée) :

```bash
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
ssh-add ~/.ssh/id_ed25519
```

* [ ] Vérifier l’accès SSH manuel :

```bash
ssh root@82.165.92.40 "hostname && whoami"
# Attendu : affiche le hostname (ex: ubuntu) puis l'utilisateur (root) sans a voir a saisir le mot de passe
```

> Alternative court terme (possible mais non recommandée à long terme) : utiliser **mot de passe** avec `--ask-pass` ou `ansible_password` chiffré avec **Ansible Vault**.

## 4) Vérifier l’inventaire & exécuter le ping

* [ ] Vérifier la lecture de l’inventaire :

```bash
ansible-inventory -i inventory/hosts.ini --list
```

* [ ] Exécuter le playbook :

```bash
ansible-playbook playbooks/ping.yml
```

**Succès attendu :**

```
ok: [server1]
PLAY RECAP ... server1 : ok=1 changed=0 unreachable=0 failed=0 ...
```

## 5) Problèmes rencontrés & corrections

### Problème A — Permission denied (publickey,password)

**Symptômes :**

```
Failed to connect via ssh: Permission denied (publickey,password).
```

**Causes probables & correctifs :**

* Clé avec passphrase non chargée → **charger dans l’agent** :

```bash
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
ssh-add ~/.ssh/id_ed25519
```

* Chemin `~/.ssh/...` non résolu → **mettre le chemin absolu** dans `hosts.ini`.
* Accès SSH non fonctionnel → **tester** :

Rendre le comportement permanent via ~/.ssh/config :

```
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

## 6) Récapitulatif des commandes utiles

* Version Ansible :
```bash
ansible --version
```

* Lister l’inventaire :
```bash
ansible-inventory -i inventory/hosts.ini --list
```

* Lancer playbook :
```bash
ansible-playbook playbooks/ping.yml
```

* Activer agent + ajouter la clé :
```bash
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
ssh-add ~/.ssh/id_ed25519
```

## 7) Arborescence finale attendue

```
~/ansible-demo
├── ansible.cfg
├── inventory
│   └── hosts.ini
└── playbooks
    └── ping.yml
```

## 8) Ce qu’il faut retenir

* **Ansible installé via Homebrew** et fonctionnel.
* **Inventaire `hosts.ini`** correctement référencé par `ansible.cfg`.
* **Clé SSH** chargée dans l’agent (évite la saisie de passphrase à chaque commande).
* **Playbook `ping.yml`** exécuté avec succès sur l’hôte `server1`.
* **Problèmes** (nom du fichier inventaire, passphrase) **diagnostiqués et corrigés**.

