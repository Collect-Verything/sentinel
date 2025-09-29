## 1) Créer le `vault.yml` (en clair) **sous l’inventaire**

```bash
mkdir -p ansible/inventory/group_vars/demo
cat > ansible/inventory/group_vars/demo/vault.yml <<'YAML'
ansible_password: "LE_MDP_SSH_DU_SERVEUR"
# ansible_user: "root"   # (optionnel si pas déjà dans hosts.ini)
YAML
```

## 2) Chiffrer avec **le mot de passe du coffre**

> `secrets/vault_pass.txt` = mot de passe **Vault** (pas le mdp SSH).

```bash
ansible-vault encrypt ansible/inventory/group_vars/demo/vault.yml \
  --vault-password-file secrets/vault_pass.txt
```

## 3) Vérifier le chiffrement/lecture

```bash
head -n1 ansible/inventory/group_vars/demo/vault.yml
# attendu: $ANSIBLE_VAULT;1.1;AES256

ansible-vault view ansible/inventory/group_vars/demo/vault.yml \
  --vault-password-file secrets/vault_pass.txt
# attendu: ansible_password: "LE_MDP_SSH_DU_SERVEUR"
```

## 4) Pré-requis d’exécution

* `ansible/ansible.cfg` pointe sur `inventory/hosts.ini`.
* Variable d’env dans le conteneur :
  `ANSIBLE_VAULT_PASSWORD_FILE=/run/secrets/vault_pass`
  `ANSIBLE_CONFIG=/back/ansible/ansible.cfg` (ou lance depuis `/back/ansible`).

### Rappel

* `vault_pass.txt` → **mot de passe du coffre**.
* `vault.yml` (chiffré) → contient `ansible_password` (**mot de passe SSH**).
