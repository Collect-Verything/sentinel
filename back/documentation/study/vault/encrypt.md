# Démarrage rapide — Ansible + Vault (DEV)

## 0) Pré-requis

* Arbo existante :

  ```
  ansible/
    ansible.cfg
    inventory/hosts.ini
    inventory/group_vars/demo/        # présent mais vide ou manquant
    playbooks/ping.yml
  ```
* Docker compose (profil `dev`) opérationnel.

## 1) Ajuster les cibles dans l’inventaire

Éditer `ansible/inventory/hosts.ini` et renseigner IP + user :

```ini
[demo]
server1 ansible_host=IP_DU_SERVEUR ansible_user=root 
# server2 ansible_host=... ansible_user=...
```

## 2) Écrire le mot de passe SSH (en clair) dans le vault *avant chiffrement*

Créer (ou écraser) `ansible/inventory/group_vars/demo/vault.yml` en clair :

```bash
mkdir -p ansible/inventory/group_vars/demo
cat > ansible/inventory/group_vars/demo/vault.yml <<'YAML'
ansible_password: "MOT_DE_PASSE_SSH_DU_SERVEUR"
# ansible_user: "root"   # optionnel si non défini dans hosts.ini
YAML
```

## 3) Créer le fichier contenant le mot de passe **du coffre** (non versionné)

À la racine du monorepo :

```bash
mkdir -p secrets
printf '%s\n' 'MOT_DE_PASSE_DU_COFFRE_VAULT' > secrets/vault_pass.txt
```

> `vault_pass.txt` = **mot de passe du coffre** (sert à chiffrer/déchiffrer). **Ne pas** confondre avec `ansible_password` (mot de passe SSH).

## 4) Chiffrer le fichier de variables

```bash
ansible-vault encrypt ansible/inventory/group_vars/demo/vault.yml \
  --vault-password-file secrets/vault_pass.txt
```

Vérifier :

```bash
ansible-vault view ansible/inventory/group_vars/demo/vault.yml \
  --vault-password-file secrets/vault_pass.txt
# doit afficher ansible_password: "...."
```

## 5) Lancer le back en dev (avec le secret monté via compose)

```bash
docker compose --profile dev up -d --force-recreate back-dev
```

## 6) Tester

* Depuis le conteneur (optionnel) :

  ```bash
  docker exec -it back-dev sh -lc 'cd /back/ansible && ansible-playbook playbooks/ping.yml'
  ```
* Via l’API :

  ```bash
  curl -X POST http://localhost:3001/configs/ping
  ```

Résultat attendu : `ok: [server1] … unreachable=0 failed=0`.

---

## Note (fallback pour test rapide)

Pour un test express **sans Vault**, il est possible de mettre user + mdp **en clair** dans `hosts.ini` :

```ini
[demo]
server1 ansible_host=IP ansible_user=root ansible_password="MOT_DE_PASSE_SSH"
```

> **Déconseillé en prod.** Remets ensuite la variante Vault (étapes 2–4) dès que le test est validé.

---

## Rappels importants

* `vault_pass.txt` **n’est pas versionné** (ajouter `secrets/` au `.gitignore`).
* Structure recommandée pour éviter les surprises :

  ```
  ansible/
    inventory/hosts.ini
    inventory/group_vars/<groupe>/vault.yml  (chiffré)
    playbooks/...
    ansible.cfg
  ```
* En conteneur, l’environnement doit exposer :

    * `ANSIBLE_CONFIG=/back/ansible/ansible.cfg`
    * `ANSIBLE_VAULT_PASSWORD_FILE=/run/secrets/vault_pass` (monté par compose)

C’est tout : ajuste IP/user, mets le mdp SSH dans `vault.yml`, chiffre-le avec le **coffre**, lance le `back-dev`, et ping ! ✅

Si un probleme apparait, placer les element du /vault/debug dans le controller de test /configs/ping, pour verifier les elements donnée.