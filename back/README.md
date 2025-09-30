<p align="center">
  <a href="https://www.youtube.com/watch?v=ioIg4kDLMZQ" target="blank"><img src="../pic/img_2.png" width="420" alt="Backend matrice Logo" /></a href="https://www.youtube.com/watch?v=ioIg4kDLMZQ" target="blank">
</p>


[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->
Parfait — voici une **base de README pour le backend** (NestJS) claire, propre et complète. Tu peux la coller dans `back/README.md` et l’ajuster ensuite.

---

# Sentinel Back – API & Workers (NestJS + BullMQ)

## 📌 Vue d’ensemble

Backend **NestJS** fournissant :

* une **API REST** pour gérer des tâches asynchrones,
* un **worker BullMQ** (connecté à **Redis**) pour exécuter les jobs,
* des endpoints de **statut** et de **debug**,
* un point d’entrée propre pour l’observabilité (health/ready).

Stack : **NestJS**, **BullMQ**, **Redis**, **Prisma** (DB), **Docker/Compose**.

---

## 🧩 Architecture (résumé)

* **TasksModule / TasksService** : encapsulent la **Queue BullMQ**, le **Worker** et les **QueueEvents**.
* **TasksController** : expose les endpoints `enqueue`, `status`, `counts`.
* **Config** : variables d’environnement (ex. `REDIS_URL`, DB…).
* **Observabilité** (optionnel) : endpoints `GET /health`, `GET /ready`.


Mettre a jour ansible ...
```
back/
├─ .env                     # Variables d'env locales
├─ Dockerfile               # Build image backend (prod)
├─ Dockerfile.dev           # Build image backend (dev, hot reload)
├─ prisma/
│  ├─ schema.prisma         # Modèle de données Prisma
│  └─ migrations/           # Migrations SQL générées par Prisma

src/
├─ main.ts                  # Bootstrap NestJS (listen, pipes, etc.)
├─ configs/                 # Gestion config appli (env, constantes, intégration Ansible à terme)
├─ prisma/                  # Intégration Prisma côté Nest (module/service)
├─ tasks/                   # Tâches asynchrones (BullMQ/Redis) : enqueue, worker, status, counts
└─ servers/                 # Gestion serveurs (inventaire, IP prêtes au déploiement, endpoints dédiés)

test/
└─ ...                      # Tests unitaires/e2e

```

---

## 📦 Services du backend

### `configs` — Configurations d’orchestration (Ansible)

- **But** : centraliser les configurations (variables/fichiers) définies depuis le front et les **persister** pour les déploiements.
- **Données** : `id`, `name`, `description`, `path` (chemin sur serveur), `payload`, `createdAt`, `updatedAt`...
- **Endpoints (ex.)** : `POST /configs`, `GET /configs/:id`, `PUT /configs/:id`, `GET /configs`.
- **Notes** : possible d’écrire la config depuis un IDE et de **renseigner en base** son `path`/métadonnées pour qu’elle soit référencée.

### `servers` — Inventaire & cycle de vie des serveurs

- **But** : **ingérer** (CSV provider), **persister** et **mettre à jour** l’état des serveurs (disponible, réservé, configuré, erreur).
- **Données** : `id`, `providerRef`, `ip`, `region`, `status`, `labels`, `lastActionAt`, `notes`...
- **Endpoints (ex.)** : `POST /servers/import`, `GET /servers`, `GET /servers/:id`, `PATCH /servers/:id`.
- **À venir** : endpoint **IP disponible** (réservation), historique d’actions, intégration Ansible (retours de playbooks).

### `tasks` — Orchestration asynchrone (BullMQ + Redis)

- **But** : **créer** et **suivre** des tâches (ex. appliquer une config à une collection de serveurs) avec **progression** temps réel.
- **Données** : `jobId`, `state` (queued/running/completed/failed), `progress` (`step/total/info`), `result`/`failedReason`, timestamps.
- **Endpoints (ex.)** :
    - `POST /tasks/enqueue?seconds=20`
    - `GET /tasks/status/:id`
    - `GET /tasks/counts`
- **À venir** : persistance des **logs Ansible** (consultables dans l’UI), **SSE** pour updates live, **cancel/retry**, backoff.

> **Relations** : `configs` fournit les paramètres d’exécution aux `tasks`; `tasks` opèrent sur l’inventaire `servers` et mettent à jour leurs statuts.

---

## 🔧 Variables d’environnement (backend)

> La plupart des variables nécessaires en **prod** sont récapitulées dans le **README principal** du monorepo (section *Vars & Secrets*).
> Pour le **backend** uniquement, voici le minimum à définir dans `back/.env` (ou via votre orchestrateur/Actions) :

```dotenv
# Base de données (Prisma)
DATABASE_URL="mysql://user:password@mysql-sentinel:3306/sentinel_db"
# DATABASE_URL="mysql://user:password@localhost:3306/sentinel_db"  # ← exemple local npm start:dev

# File de tâches (BullMQ)
REDIS_URL=redis://redis-dev:6379
```

⚠️ Vault Ansible ⚠️ : Checker documentation/study/vault/encrypt.md

### Notes utiles

* **Checker** `documentation/utils`.

  > Les commandes de génération/migration Prisma sont déjà exécutées par les scripts Docker : **rien à faire manuellement** dans ce cas.
* Pour un **test rapide en local** avec `npm run start:dev`, pointez la DB sur `localhost` dans `back/.env`, puis :

```bash
npx prisma generate
npx prisma migrate dev   # en local (dev)
# ou, si la base est déjà provisionnée :
# npx prisma migrate deploy
```

---

## 🐳 Lancer en local

### Avec Node local pour test rapide

```bash
npm run start:dev
```

> Attention ceci e lance pas redis etc ...

### Via docker-compose (monorepo)

```bash
docker compose --profile dev up -d // Tout
docker compose --profile dev up -d back-dev mysql-sentinel redis-dev // Just Back
```


---

## ♻️ Bonnes pratiques

* **Prefix Redis** spécifique (`sentinel`) pour isoler l’environnement.
* **removeOnComplete / removeOnFail** pour éviter de gonfler Redis.
* **Concurrence** du worker ajustable (`concurrency`).
* **Logs d’échec** (`worker.on('failed', ...)`) pour diagnostiquer rapidement.
* **Lifecycle Nest** (`OnModuleInit/Destroy`) pour un démarrage/arrêt propre.
* **(Optionnel)** : exposer des endpoints `GET /health` / `GET /ready`.

---

## 📚 Références

* BullMQ — [https://docs.bullmq.io/](https://docs.bullmq.io/)
* NestJS Lifecycle — [https://docs.nestjs.com/fundamentals/lifecycle-events](https://docs.nestjs.com/fundamentals/lifecycle-events)
* ioredis — [https://github.com/luin/ioredis](https://github.com/luin/ioredis)
* Prisma — [https://www.prisma.io/docs](https://www.prisma.io/docs)
