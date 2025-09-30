# Roadmap intégration Ansible

## Étape 1 — Installation et test local

* [x] Installer Ansible en local (`apt install ansible` / `brew install ansible`).
* [x] Créer un playbook minimal de ping (ex. `ansible/playbooks/ping.yml`).
* [x] Créer un inventaire local (ex. `ansible/inventory/hosts.ini`) avec un hôte de test.
* [x] Exécuter le playbook en CLI pour valider (`ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/ping.yml`).

## Étape 2 — Intégration backend (exécution simple)

* [ ] Créer le sous-répertoire backend `ansible/` (ex. `ansible/playbooks`, `ansible/inventory`, `ansible/roles`).
* [ ] Implémenter dans le service NestJS une méthode d’exécution shell (`child_process.exec` / `spawn`) pour lancer `ansible-playbook`.
* [ ] Paramétrer le chemin de travail (cwd) vers le dossier `ansible/`.
* [ ] Exécuter le playbook de ping via le service backend et journaliser la sortie/erreurs.
* [ ] Ajouter gestion d’erreurs, timeout, et code retour du process.
* [ ] Améliorer le modèle de données Prisma selon les besoins réels (configs/playbooks, inventaires, rôles/tags, exécutions, logs).
* [ ] Creer la methode qui va overide les fichier ansible avec le snouveau ip a configurer
 
## Étape 3 — Sélection dynamique playbook/serveurs

* [ ] Implémenter la sélection de la **config** (playbook) et des **serveurs** à partir des paramètres envoyés par le front.
* [ ] Récupérer via Prisma les IP/identifiants/mots de passe associés aux serveurs sélectionnés.
* [ ] Préparer deux configs **seedées** (config A / config B) avec actions distinguables (ex. package présent/absent) et versionner ces fichiers.
* [ ] Mettre à jour le seed et le mapping BDD ⇄ chemin fichiers (chemins persistés en base).
* [ ] Générer/adapter l’inventaire (ou un inventaire temporaire) avant exécution du playbook.
* [ ] Exécuter Ansible avec les arguments dynamiques (`-i` inventaire généré, playbook choisi, `--extra-vars` si nécessaire).

## Étape 4 — Persistance, versionnement et pipeline

* [ ] Versionner les playbooks dans le repo backend (source of truth).
* [ ] Vérifier que build/packaging **n’exclut pas** les fichiers Ansible (vérifier `.dockerignore`, bundlers, etc.).
* [ ] Intégrer la méthode du **service Ansible** au **service Tasks** dans la méthode `enqueueWorker`.
* [ ] Acheter un serveur de test “à 1€” et l’ajouter à la source d’inventaire (CSV/BDD) avec user/password/IP.
* [ ] Lancer une exécution end-to-end sur ce serveur et vérifier le résultat (logs + état serveur).
* [ ] Mettre à jour le workflow GitHub Actions du backend :

    * [ ] Installer/mettre à jour Ansible sur le runner Ubuntu.
    * [ ] Ne rien faire si déjà présent (idempotence).
    * [ ] Préparer le terrain pour que les playbooks soient déployés avec le backend.
* [ ] Corriger les issues de prod éventuelles (logs détaillés, traces, retry contrôlé).

## Étape 5 — Sécurité & robustesse (minimum recommandé)

* [ ] Remplacer mots de passe en clair par SSH keys ou **Ansible Vault** (au minimum chiffrer secrets).
* [ ] Paramétrer `ANSIBLE_CONFIG` et fichiers `ansible.cfg` (retries, host_key_checking, forks, callbacks).
* [ ] Ajouter un mode “dry-run” (`--check`) pour tests non destructifs depuis le backend.
* [ ] Standardiser la structure des inventaires (groupes par environnement : `dev`, `staging`, `prod`).

## Étape 6 — Fonctionnalités front

* [ ] Créer un espace **“Configurations Ansible”** (lecture seule dans un premier temps).
* [ ] Créer un espace **édition** :

    * [ ] Éditer des fichiers Ansible dans le navigateur **ou** uploader via formulaire (avec parsing/validation).
    * [ ] Persister la nouvelle config en BDD (métadonnées + chemin).
    * [ ] Sauvegarder le fichier dans `ansible/playbooks/Nconfig` côté backend.
* [ ] Ajouter une action “**Update/Upgrade**” en un clic pour une sélection de serveurs (tâche standardisée).
* [ ] Gérer l’état d’exécution côté UI : en file, en cours, réussi, échoué (retours du service Tasks).

## Étape 7 — Observabilité & DX

* [ ] Centraliser logs d’exécution Ansible (stdout/stderr) et conserver un historique par run.
* [ ] Exposer un endpoint pour consulter les derniers runs (filtrer par config/serveur/date).
* [ ] Ajouter des tests e2e “smoke” : ping, installation paquet factice, template no-op.
* [ ] Documenter commandes de base (README `ansible/`) et conventions de nommage.

---

### Notes de structure (rapides)

* [ ] Utiliser inventaires **générés** par le backend pour éviter de commit des secrets.
* [ ] Prévoir un “playbook runner” unique recevant `playbookPath`, `inventoryPath`, `extraVars`, `limits`.
* [ ] Envisager `--limit` pour cibler un sous-ensemble précis d’hôtes.
* [ ] Prévoir une file (queue) pour **séquentialiser** ou **throttler** les exécutions (éviter contention).

Si tu veux, je peux te générer les **squelettes** (ex. `ping.yml`, `hosts.ini` type, `ansible.cfg`, et un service NestJS minimal d’exécution) dans un second temps.
