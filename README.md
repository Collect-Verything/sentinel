<p align="center">
  <a href="https://www.youtube.com/watch?v=pQ0db2ERil8" target="blank"><img src="pic/img.png" width="420" alt="Sentinel Logo" /></a href="https://www.youtube.com/watch?v=pQ0db2ERil8" target="blank">
</p>

# Sentinel – Monitoring, Tasks & Ops

## 📌 Introduction

**Sentinel** est une stack d’**observabilité** et d’**exécution de tâches** orientée e-commerce, combinant :

* **Monitoring/Logging** : Prometheus, Grafana, Loki, Fluent Bit, Node Exporter.
* **Traitement asynchrone** : **BullMQ** (Queue/Worker/Events) + **Redis**.
* **API** : **NestJS** (service de tâches, endpoints REST) + **React** (panneau des tâches).
* **Ops** : **Ansible** (provisioning/maintenance serveurs), intégrée à la chaîne CI/CD.

Objectifs : mesurer, diagnostiquer, exécuter en arrière-plan (jobs), déployer et opérer de manière **fiable**, **traçable** et **automatisée**.

---

## 📂 Arborescence du projet

```bash
sentinel/
├── .github/
│   └── workflows/                 # Workflows CI/CD GitHub Actions
├── back/                          # NestJS backend (TasksService, API)
├── front/                         # React frontend (panneau tâches, UI)
├── documentation/                 # Documentation technique
├── sentinel/                      # Configuration monitoring
│   ├── docker-compose.yml         # Docker Compose (observabilité)
│   ├── prometheus.yml             # Config Prometheus
│   ├── grafana/
│   │   ├── dashboards/            # Dashboards Grafana
│   │   │   ├── node-exporter-full-1860.json
│   │   │   ├── products-logs.json
│   │   └── provisioning/          # Provisioning Grafana
│   │       ├── dashboards/
│   │       │   └── dashboard.yml
│   │       ├── datasources/
│   │       │   └── datasource.yml
│   │       ├── alerting/
│   │       │   ├── contact-points.yml
│   │       │   ├── notification-policies.yml
│   │       │   └── rules/
│   │       │       └── nginx-rules.yml
```

---

### 🏗️ Observabilité - Périmètre & Rôles par composant

### Monitoring / Logging
- **Prometheus** — Collecte et stocke les **métriques** (CPU, RAM, latence HTTP, etc.) via pull; sert de source pour alerting.
- **Grafana** — **Visualisation** (dashboards), **exploration** de métriques/logs, **alerting** (SMTP/webhooks) et annotations.
- **Loki** — Stockage **scalable** des **logs** (sans index lourd), requêtage type LogQL pour corréler avec les métriques.
- **Fluent Bit** — **Agent de collecte** léger : parse, enrichit et envoie les logs (système/containers) vers **Loki**.
- **Node Exporter** — Expose les **métriques système** (CPU, mémoire, disque, réseau) consommées par **Prometheus**.

### Traitement asynchrone (Workers)
- **BullMQ (Queue / Worker / Events)** — Orchestration des **jobs** : mise en file, exécution **concurrente**, suivi d’état, progression, retries, délais.
- **Redis** — **Backend** de la file BullMQ : persistance des jobs/états, déduplication, planification, communication d’événements.

### API & Frontend
- **NestJS** — **API** (REST) pour la gestion des tâches : endpoints `enqueue`, `status`, `counts`; instancie le **Worker** au démarrage; expose la santé/observabilité.
- **React (Vite)** — **UI** client : panneau « Tâches » global (progression, états, actions), intégration aux endpoints, rendu temps réel via polling (ou SSE/WebSocket ultérieurement).

### Ops / Automatisation
- **Ansible** — **Provisioning** et **opérations** : bootstrap serveurs (users, Docker, SSH), déploiements idempotents, mises à jour et scaling.
- **Docker** — **Conteneurisation** des services (images officielles et builds front/back), isolation & portabilité.
- **Docker Compose** — **Orchestration multi-services**, réseaux/volumes, **profils `dev`/`prod`** pour lancer la stack selon l’environnement.
- **Git & GitHub Actions** — **Gestion de versions** et **CI/CD** : build/test, packaging, **auto-déploiement** sur branches/tag, gestion **Secrets/Variables**.


---


## 🐳 Démarrage local — profils Docker Compose

### ▶️ Mode **dev** (front + back + mysql + redis)

```bash
docker compose --profile dev up -d
```

**Services :**

* `client-dev` → Front React (Vite) : [http://localhost:5173](http://localhost:5173)
* `back-dev` → API NestJS : [http://localhost:3001](http://localhost:3001)
* `mysql-sentinel` → MySQL : host `localhost`, port `3307`
* `redis-dev` → Redis : host `localhost`, port `6379`

**Commandes utiles :**

Checker la doc.


### 🧪 “Test prod” en local

**Option A — profil prod (si défini dans ton compose)**

```bash
docker compose --profile prod up -d
```

---


## 🤖 CI/CD (GitHub Actions)

- **Déclencheurs par répertoire** : les workflows sont configurés pour **écouter les changements par dossier** :
    - modifications dans `front/` → pipeline **front**,
    - modifications dans `back/` → pipeline **back**.
- **Branche cible** : sur **push vers `main`**, le workflow correspondant se lance.
- **Chaîne d’actions (par service impacté)** :
    1) **Build & tests** (lint/unit/e2e si présents),
    2) **Build Docker** de l’image du service,
    3) **Push** de l’image vers le registre,
    4) **Connexion SSH** au serveur,
    5) **Pull** de la nouvelle image puis `docker compose up -d` (service ciblé).
- **Paramétrage serveur (temporaire)** : en attendant la finalisation d’**Ansible**, les paramètres (hôte, utilisateur, chemin de déploiement, profil compose, etc.) sont **définis dans le workflow**.  
  **Objectif** : externaliser ces paramètres dans l’**inventaire/vars Ansible** pour ne plus les maintenir dans les Actions.


## 🔑 Vars & Secrets (GitHub Actions)

> **Où les définir :**  
> – **Secrets** : *Repository → Settings → Secrets and variables → Actions → Secrets* (chiffrés, ne s’affichent pas en clair)  
> – **Variables** : *Repository → Settings → Secrets and variables → Actions → Variables* (visibles en clair, non chiffrées)

### 🔐 Secrets
| Nom | Utilisation | Exemple / Remarque |
| --- | --- | --- |
| `DATABASE_URL` | Connexion Prisma du **backend** (chaîne unique) | `mysql://user:pass@host:3306/sentinel_db` — **évite** de mixer avec `MYSQL_*` si tu utilises ça |
| `DOCKERHUB_TOKEN` | Auth **Docker Hub** (push d’images) | Token d’accès Docker Hub |
| `DOCKERHUB_USERNAME` | Auth **Docker Hub** (namespace) | Nom d’utilisateur Docker Hub |
| `GF_SMTP_PASSWORD` | **Grafana SMTP** (alerting) | Mot de passe d’appli |
| `MYSQL_DATABASE` | **MySQL** (backend) | Doit correspondre à la DB déclarée côté infra |
| `MYSQL_PASSWORD` | **MySQL** (backend) | Mot de passe utilisateur applicatif |
| `MYSQL_ROOT_PASSWORD` | **MySQL root** (healthcheck, init) | À limiter aux usages strictement nécessaires |
| `MYSQL_USER` | **MySQL** (backend) | Utilisateur applicatif |
| `SSH_PASSWORD` | **SSH** de déploiement | ⚠️ **Préférer** une clé privée `SSH_PRIVATE_KEY` (meilleure sécurité) |

> Todo sécurité : remplacer `SSH_PASSWORD` par un secret `SSH_PRIVATE_KEY` (clé privée en PEM) + ajout de la clé publique sur le serveur.

### 🧭 Variables (non chiffrées)
| Nom | Utilisation | Exemple / Remarque |
| --- | --- | --- |
| `SSH_HOST` | Cible **serveur** de déploiement | IP/hostname Sentinel (ex: `203.0.113.10`) |
| `SSH_USER` | **Utilisateur SSH** | ex: `deploy` |

> **Note pipelines :** La plupart de ces éléments sont consommés dans les workflows **front/back** (déclenchés par changements dans `front/` et `back/`), qui :
> 1) build & test, 2) build image docker, 3) push au registre, 4) SSH sur le serveur, 5) pull & `docker compose up -d` du service concerné.  
     > Tant que **Ansible** est en cours d’intégration, le **paramétrage serveur** (host/user/chemins/profil) est **géré dans les Actions**. Objectif : **déporter** ces paramètres dans l’inventaire/vars **Ansible** à terme.

### ✅ Conseils de configuration
- **Choisis un seul mode DB** :
    - soit **`DATABASE_URL`** (recommandé pour Prisma),
    - soit le couple **`MYSQL_*`**. Évite de mélanger les deux pour ne pas diverger.
- **Docker Hub** : logins via `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN`.
- **SSH** : préfère **clé** (`SSH_PRIVATE_KEY`) à **mot de passe** (`SSH_PASSWORD`).
- **Sépare dev/prod** : si besoin, crée des **Environments** GitHub (dev/staging/prod) avec leurs secrets dédiés.

---

## 🗺️ Roadmap (mise à jour)

* [x] Stack Docker Compose (dev) : front/back/mysql/redis
* [x] Worker BullMQ (Queue/Worker/Events) + Redis (tasks)
* [x] Panneau React « Tâches » (progress, états, actions)
* [x] Observabilité (Prometheus, Loki, Grafana) + alerting SMTP
* [x] CI/CD GitHub Actions (build/test/deploy, healthchecks)

**Prochaines étapes :**

* [ ] **Endpoint IP de déploiement** : exposer un endpoint qui **réserve/retourne l’IP** prête au déploiement d’une **boutique client** (intégration e-commerce).
* [ ] **SSE (Server-Sent Events)** pour pousser `progress/completed/failed` **sans polling** (bridge `QueueEvents` → SSE).
* [ ] **Bull Board** (ou équivalent) pour l’UI d’inspection des jobs.
* [ ] **Cancel/Retry endpoints** : annulation d’un job, retry contrôlé (politiques de backoff).
* [ ] **Ansible** : rôles dédiés *redis*, *backend*, *monitoring*, *front* + inventaires *staging/prod*.
* [ ] **Sécurité** : SSH par clé uniquement, fail2ban, durcissement Docker/Compose, rotation secrets.

---

## 📚 Références

* **BullMQ** : [https://docs.bullmq.io/](https://docs.bullmq.io/)
* **NestJS – Lifecycle** : [https://docs.nestjs.com/fundamentals/lifecycle-events](https://docs.nestjs.com/fundamentals/lifecycle-events)
* **ioredis** : [https://github.com/luin/ioredis](https://github.com/luin/ioredis)
* **Grafana** : [https://grafana.com/docs/](https://grafana.com/docs/)
* **Prometheus** : [https://prometheus.io/docs/](https://prometheus.io/docs/)
* **Loki** : [https://grafana.com/oss/loki/](https://grafana.com/oss/loki/)
* **Fluent Bit** : [https://docs.fluentbit.io/](https://docs.fluentbit.io/)
* **Ansible** : [https://docs.ansible.com/](https://docs.ansible.com/)

