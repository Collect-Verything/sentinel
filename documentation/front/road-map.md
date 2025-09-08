Yes ! Voici une **feuille de route** claire, ordonnée et “cochable” pour ton **front** et ton **back** dans le repo *sentinel*. J’ai réorganisé quelques points pour sécuriser le déploiement et éviter tout impact sur les autres containers du serveur.

# 🛣️ Roadmap globale (MVP → fiable en prod)

* [ ] **Nommage & conventions**

    * [ ] Nom d’image Docker front : `sentinel-front`
    * [ ] Nom d’image Docker back : `sentinel-ingest`
    * [ ] Nom de container front : `sentinel-front-app`
    * [ ] Nom de container back : `sentinel-ingest-service`
    * [ ] Réseau Docker : `sentinel`
    * [ ] Label commun : `com.sentinel.managed=true` (pour filtrer ce que tu touches)

---

# 🎨 FRONT (Vite + déploiement sûr)

## Phase 1 — Squelette & envs

* [ ] **Créer le projet Vite React/TS** (`services/front-app/`)
* [ ] **Configurer les envs Vite**

    * [ ] `.env.development` avec `VITE_API_URL=http://localhost:3001`
    * [ ] `.env.production` avec `VITE_API_URL=http://ingest-service:3001`
* [ ] **Page d’accueil (MVP)**

    * [ ] Écran “Home” : upload CSV (UI vide pour l’instant)
    * [ ] Bouton “Ouvrir Grafana” → lien URL dashboard
    * [ ] “Connexion” factice (admin fake) pour verrouiller l’accès UI

## Phase 2 — Docker & exécution locale

* [ ] **Dockerfile** (multi-stage, expose 80 via nginx ou `vite build` + `serve`)
* [ ] **docker-compose (local)**

    * [ ] Service `front-app` avec `container_name: sentinel-front-app`
    * [ ] `networks: [sentinel]`
    * [ ] Healthcheck HTTP `/`
* [ ] **Test local** : `docker compose up -d front-app`

## Phase 3 — CI/CD GitHub Actions (ciblage du sous-dossier)

* [ ] **Secrets nécessaires**

    * [ ] `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`
    * [ ] `SSH_HOST`, `SSH_USER`, `SSH_KEY` (clé privée)
    * [ ] `APP_NAME=sentinel-front` (ou similaire)
* [ ] **Déclencheurs filtrés**

    * [ ] `on: push` + `paths: ['services/front-app/**', '.github/workflows/front.yml']`
* [ ] **Build & tag sûrs**

    * [ ] Tags : `latest`, `sha-${{ github.sha }}`, `v${{ github.run_number }}`
    * [ ] `docker buildx` activé
* [ ] **Push Docker Hub**

    * [ ] Créer le repo (manuel une seule fois) **ou**
    * [ ] Étape idempotente “ensure repo” (optionnel si Docker Hub déjà ok)
* [ ] **Déploiement SSH (sans impacter les autres containers)**

    * [ ] `docker pull <user>/<APP_NAME>:latest`
    * [ ] `docker stop sentinel-front-app || true`
    * [ ] `docker rm sentinel-front-app || true`
    * [ ] `docker run -d --name sentinel-front-app --restart=unless-stopped --network sentinel -l com.sentinel.managed=true -p 8088:80 <user>/<APP_NAME>:latest`
* [ ] **Concurrence & safe-guards**

    * [ ] `concurrency: group: front-deploy, cancel-in-progress: true`
    * [ ] **Vérification** anti-commande dangereuse : échouer si un script contient `docker (compose )?down` ou `system prune`
    * [ ] Healthcheck post-deploy : curl `http://<server>:8088` → 200 OK

> ✅ Avec ça, le front se met à jour sans jamais toucher les autres containers.

---

# ⚙️ BACK (NestJS ingest-service)

## Phase 1 — Squelette & endpoints

* [ ] **Créer projet NestJS** (`services/ingest-service/`)
* [ ] **Endpoints MVP**

    * [ ] `POST /uploads` (multipart) → parse CSV (ip, name?, group?)
    * [ ] `POST /inventories/merge` → met à jour `ansible/inventories/hosts.yml` (backup `.bak`)
    * [ ] `POST /jobs/run` → lance playbook via `docker exec` sur container runner
    * [ ] `GET /jobs/:id` → statut + tail logs
    * [ ] `GET /inventories/preview`
* [ ] **Validation forte** (IP v4/v6, doublons, groupes)
* [ ] **Auth simple** (header token)
* [ ] **CORS** (autoriser `front-app`)

## Phase 2 — Docker & compose

* [ ] **Dockerfile** (Node 18, `dist/`, prod)
* [ ] **docker-compose**

    * [ ] Service `ingest-service` (port 3001, volumes `../data`, `../ansible`)
    * [ ] `container_name: sentinel-ingest-service`
    * [ ] `environment` via `.env`
    * [ ] Healthcheck HTTP `/health`
* [ ] **Ansible runner**

    * [ ] Service `ansible-runner` (image officielle), `sleep infinity`
    * [ ] Volumes `../ansible:/workspace/ansible`, `../data/jobs:/workspace/jobs`
    * [ ] Nom du container connu : `sentinel-ansible-runner`

## Phase 3 — CI/CD GitHub Actions (ciblage du sous-dossier)

* [ ] **Secrets** (peuvent réutiliser ceux du front)
* [ ] **Déclencheurs filtrés**

    * [ ] `on: push` + `paths: ['services/ingest-service/**', '.github/workflows/back.yml']`
* [ ] **Build, tag, push** vers Docker Hub (`sentinel-ingest`)
* [ ] **Déploiement SSH** (sans toucher le reste)

    * [ ] `docker pull <user>/sentinel-ingest:latest`
    * [ ] `docker stop sentinel-ingest-service || true`
    * [ ] `docker rm sentinel-ingest-service || true`
    * [ ] `docker run -d --name sentinel-ingest-service --restart=unless-stopped --network sentinel -l com.sentinel.managed=true -p 3001:3001 -v /path/sentinel/data:/app/data -v /path/sentinel/ansible:/app/ansible -e RUNNER_CONTAINER=sentinel-ansible-runner -e API_TOKEN=${API_TOKEN} <user>/sentinel-ingest:latest`
* [ ] **Safe-guards** (mêmes vérifications que front)
* [ ] **Tests smoke** (curl `/health`, `/inventories/preview`)

---

# 📦 Ansible & dossiers persistants

* [ ] `ansible/inventories/hosts.yml` (créé si absent)
* [ ] `ansible/playbooks/ping.yml` (playbook de test)
* [ ] `data/uploads/`, `data/jobs/` (persistants sur le serveur)
* [ ] Droits/ownership corrects pour que le container puisse écrire

---

# 🧪 Tests bout-en-bout (MVP)

* [ ] **Upload CSV** depuis le front → aperçu OK
* [ ] **Fusion inventaire** → `hosts.yml` mis à jour + backup `.bak`
* [ ] **Run playbook ping** via front → job créé, logs visibles
* [ ] **Lien Grafana** → ouvre bien le dashboard
* [ ] **Auth front** → bloque l’accès si non connecté (fake ok pour MVP)

---

# 🛡️ Garde-fous contre “couper les autres containers”

* [ ] Tous les scripts de déploiement utilisent **stop/rm** **uniquement** sur `sentinel-front-app` et `sentinel-ingest-service` (noms explicites)
* [ ] **Aucune** commande `docker compose down`, `docker system prune`, `docker stop $(docker ps -q)`
* [ ] Étape CI “**Scan sécurité**” qui **échoue** si ces motifs sont trouvés
* [ ] **Labels** et **network** dédiés pour filtrer
* [ ] **Healthchecks** post-deploy, rollback manuel documenté

---

# 📁 Dépendances & tâches annexes

* [ ] `.editorconfig`, `prettier` (confort)
* [ ] `README_sentinel_microservice.md` (comment build, run, deploy)
* [ ] Variables Grafana (URL dashboard) dans `.env.production` front
* [ ] Concurrency + environments GitHub (`environment: production`)
* [ ] Optionnel : logs applicatifs vers Loki plus tard
