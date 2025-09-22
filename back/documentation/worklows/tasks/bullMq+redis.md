# Vue d’ensemble (architecture)

* **BullMQ** (lib Node) fournit :

    * une **Queue** (producteur) pour **enquêter** des jobs,
    * un **Worker** (consommateur) qui **exécute** les jobs,
    * des **QueueEvents** (canal d’événements) pour écouter ce qui se passe (progress, completed, failed…).
* **Redis** sert de **backing store** (file, états, déduplication, retard…), la queue y lit/écrit tout.
* **NestJS** fournit le **contenant** et le **cycle de vie** via `OnModuleInit/OnModuleDestroy`.
* **Client** (ton front) : envoie `POST /tasks/enqueue` pour créer un job, puis **poll** `GET /tasks/status/:id` pour suivre l’état (ou écoute des events si tu utilises SSE/WebSocket).

---

# Les librairies utilisées (et pourquoi)

* **bullmq**
  Gestion de jobs distribués, fiable, persistants — alternative moderne à bull (v2).
  (concepts : Queue, Worker, QueueEvents, JobsOptions, retry, removeOnComplete…)
* **ioredis**
  Client Redis robuste, support cluster/sentinelle, events, gestion options bas niveau.
* **@nestjs/common**
  Décorateurs et interface de **lifecycle** (`OnModuleInit`, `OnModuleDestroy`).

```sh
npm i bullmq ioredis
npm i -D @types/ioredis
```

Réfs utiles :

* BullMQ docs : [https://docs.bullmq.io/](https://docs.bullmq.io/)
* ioredis : [https://github.com/luin/ioredis](https://github.com/luin/ioredis)
* Nest lifecycle : [https://docs.nestjs.com/fundamentals/lifecycle-events](https://docs.nestjs.com/fundamentals/lifecycle-events)

---

# Lecture du code — service `TasksService`

## Types

```ts
type TaskPayload = { seconds: number };
type TaskProgress = { step: number; total: number; info?: string };
type TaskResult = { message: string; elapsedMs: number };
```

* **Payload** : ce que tu mets dans la file (ici, “durée” simulée).
* **Progress** : forme que tu fournis à `job.updateProgress(...)`.
* **Result** : valeur retournée par le worker (disponible quand `completed`).

## Constantes

```ts
const QUEUE_NAME = 'sentinel-tasks';
const BULL_PREFIX = 'sentinel';
```

* **QUEUE\_NAME** : identifie ta file côté Redis.
* **prefix** : préfixe Redis → pratique pour isoler plusieurs apps ou environnements (toutes les keys Redis commenceront par `sentinel:`).

## Constructeur : **wiring** Redis + BullMQ

```ts
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';
const redisOpts: RedisOptions = { maxRetriesPerRequest: null as unknown as number, enableReadyCheck: false };

this.redisMain = new IORedis(redisUrl, redisOpts);
this.redisEvents = new IORedis(redisUrl, redisOpts);

this.queue = new Queue<TaskPayload, TaskResult>(QUEUE_NAME, {
  connection: this.redisMain,
  prefix: BULL_PREFIX,
});

this.events = new QueueEvents(QUEUE_NAME, {
  connection: this.redisEvents,
  prefix: BULL_PREFIX,
});
```

* **Deux connexions** Redis :

    * `redisMain` pour Queue/Worker,
    * `redisEvents` pour `QueueEvents` (bon pattern : éviter les interférences).
* **Options** ioredis : `maxRetriesPerRequest: null` & `enableReadyCheck: false` → évite des timeouts/ready checks redondants dans certains environnements docker/k8s.
* **Queue** : instance côté **producteur**.
* **QueueEvents** : canal d’événements pour *écouter* (progress, completed, failed…). Tu l’utilises déjà pour `waitUntilReady`, et tu peux brancher des listeners (voir plus bas).

## `onModuleInit` : **démarrage** en ordre

```ts
await this.events.waitUntilReady();
await this.queue.waitUntilReady();

this.worker = new Worker<TaskPayload, TaskResult>(
  QUEUE_NAME,
  async (job) => { /* handler */ },
  { connection: this.redisMain, prefix: BULL_PREFIX, concurrency: 3 },
);

await this.worker.waitUntilReady().catch(() => void 0);

this.worker.on('failed', (job, err) => { ... });
```

* **waitUntilReady()** : s’assure que les connexions sont **prêtes** avant d’aller plus loin (pratique au boot).
* **Worker** : *consommateur* qui exécute les jobs.

    * `processor` = ta *fonction* qui reçoit `job` et **retourne** un résultat (ou jette une erreur).
    * `concurrency: 3` → jusqu’à **3 jobs en parallèle**.
* **Events worker** : on logge les échecs (`failed`). Tu peux en ajouter :

    * `completed`, `progress`, `error`, `stalled`, etc.

### Le **processor** (le cœur du travail)

```ts
async (job) => {
  const total = Math.max(1, Math.floor(job.data.seconds ?? 20));
  const start = Date.now();
  for (let i = 1; i <= total; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    await job.updateProgress({ step: i, total, info: `tick ${i}/${total}` });
  }
  return { message: `Tâche ${job.id} terminée`, elapsedMs: Date.now() - start };
}
```

* Simulation : **1 tick par seconde**, pendant `seconds` secondes.
* À chaque tick → `updateProgress(...)` : c’est **persisté** dans Redis et visible via `getStatus`.
* À la fin → on **retourne** un objet (accessible dans `returnvalue` côté client).

## `onModuleDestroy` : **arrêt propre**

```ts
await this.worker?.close();
await this.events?.close();
await this.queue?.close();
await this.redisEvents?.quit();
await this.redisMain?.quit();
```

* Ferme le worker (stoppe la consommation), les channels BullMQ, puis les connexions Redis.
* Important pour **éviter les fuites** et laisser Docker fermer cleanly.

---

# API Métiers

## `enqueue(seconds)`

```ts
const opts: JobsOptions = {
  attempts: 1,
  removeOnComplete: { age: 3600, count: 100 },
  removeOnFail: { age: 3600, count: 100 },
};
const job = await this.queue.add('longTask', { seconds }, opts);
return { id: String(job.id) };
```

* Ajoute un job avec un **nom** (`longTask`) : tu peux router différemment selon le nom (plusieurs types de jobs, même queue).
* **JobsOptions** :

    * `attempts` : nb de tentatives automatiques (ici 1).
    * `removeOnComplete/removeOnFail` : **auto-nettoyage** dans Redis (limite âge et/or count) pour éviter d’accumuler des millions de jobs.
* Retourne l’**id** du job → côté front tu polleras avec cet id.

## `getStatus(id)`

```ts
let job = await this.queue.getJob(id);
if (!job && /^\d+$/.test(id)) job = await this.queue.getJob(String(Number(id)));
if (!job) return { error: 'not_found', id };

const state = await job.getState(); // 'waiting' | 'active' | 'completed' | 'failed' | ...
const progress = job.progress as TaskProgress | number;
const result = state === 'completed' ? job.returnvalue : undefined;
const failedReason = state === 'failed' ? job.failedReason : undefined;

return { id: job.id, state, progress, result, failedReason };
```

* Récupère le **job** et son **état** :

    * `waiting`, `delayed`, `active`, `completed`, `failed`, `paused`, etc.
* **Progress** : tu récupères ce que tu as mis dans `updateProgress` (objet ou nombre).
* **Result** : dispo si `completed`.
* **failedReason** : message d’échec si `failed`.

> Ton front peut **poller** ce endpoint toutes les 1s (ou 2s) pour mettre à jour l’UI, comme tu l’as fait.
> Alternative “temps réel” sans WebSocket : exposer les **QueueEvents** via **SSE** (voir bonus plus bas).

## `getCounts()` (debug)

```ts
const [counts, waiting, active, delayed, completed, failed] = await Promise.all([
  this.queue.getJobCounts(),
  this.queue.getWaiting(0, 10),
  this.queue.getActive(0, 10),
  this.queue.getDelayed(0, 10),
  this.queue.getCompleted(0, 10),
  this.queue.getFailed(0, 10),
]);
```

* **Photo** de la queue : nombres par état + **exemples** des 10 premiers jobs de chaque liste.
* Très utile pour vérifier rapidement ce qui tourne.

---

# Intégration Docker / Compose

Extraits clés de ton `docker-compose.yml` :

```yaml
redis-dev:
  image: redis:7
  container_name: redis-dev
  ports:
    - "6379:6379"

back-dev:
  build: ./back
  environment:
    REDIS_URL: redis://redis-dev:6379/0
  depends_on:
    redis-dev:
      condition: service_started
    mysql-sentinel:
      condition: service_healthy

client-dev:
  build: ./front
  ports:
    - "5173:5173"
```

* Le **backend** pointe vers `redis-dev:6379/0` (grâce au réseau Docker, `redis-dev` est le **hostname** interne).
* **Port mapping** : 6379 exposé sur l’hôte → utile si tu veux inspecter Redis avec un client local.
* **Front** sur 5173 → ton Vite dev server.
* **MySQL** est sans lien direct avec BullMQ, mais le `depends_on` garantit l’ordre de démarrage global.

> Dans le **service Nest**, `process.env.REDIS_URL` est lu au **constructeur**. Compose te fournit cette variable → parfait.

---

# Cycle de vie Nest (pourquoi `OnModuleInit/Destroy`)

* `OnModuleInit` : tu crées le **worker** **après** que les connexions soient prêtes (`waitUntilReady`).
  Cela évite que le worker tente de consommer avant que l’infra soit “up”.
* `OnModuleDestroy` : fermeture **gracieuse**, avant que le processus ne meure → important pour ne pas laisser d’intervals/connexions ouverts.

Docs : [https://docs.nestjs.com/fundamentals/lifecycle-events](https://docs.nestjs.com/fundamentals/lifecycle-events)

---

# Contrôleur HTTP minimal (exemple)

Tu as le service ; voici un **controller** type à coller si besoin :

```ts
import { Controller, Post, Get, Param, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post('enqueue')
  async enqueue(@Query('seconds') seconds?: string) {
    const s = Number(seconds ?? 20);
    return this.tasks.enqueue(isFinite(s) ? s : 20);
  }

  @Get('status/:id')
  async status(@Param('id') id: string) {
    return this.tasks.getStatus(id);
  }

  @Get('counts')
  async counts() {
    return this.tasks.getCounts();
  }
}
```

**Curl rapides** :

```bash
# créer une tâche de 10s
curl -XPOST 'http://localhost:3001/tasks/enqueue?seconds=10'

# statut
curl 'http://localhost:3001/tasks/status/<ID>'

# debug
curl 'http://localhost:3001/tasks/counts'
```

---

# Exploiter `QueueEvents` (bonus “événements” sans WebSocket)

Tu peux convertir les events BullMQ en **SSE** (Server-Sent Events) pour pousser du temps réel au front **sans WebSocket** :

```ts
// dans onModuleInit
this.events.on('progress', ({ jobId, data }) => {
  // data = ce que tu as passé à updateProgress
  // broadcast SSE: { type:'progress', jobId, data }
});
this.events.on('completed', ({ jobId, returnvalue }) => {
  // SSE: { type:'completed', jobId, result:returnvalue }
});
this.events.on('failed', ({ jobId, failedReason }) => {
  // SSE: { type:'failed', jobId, reason:failedReason }
});
```

Côté Nest, expose un endpoint `/tasks/stream` qui garde la connexion ouverte et pousse les messages `event: progress` / `data: ...`. Le front écoute avec `EventSource`.

Réfs :

* QueueEvents : [https://docs.bullmq.io/guide/events](https://docs.bullmq.io/guide/events)
* MDN SSE : [https://developer.mozilla.org/en-US/docs/Web/API/Server-sent\_events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

# Options BullMQ utiles (à connaître)

* `concurrency` (Worker) : nb de jobs traités en parallèle.
* `attempts` (JobsOptions) : nb de retries automatiques.
* `backoff` : stratégie d’attente entre retries (`{ type: 'exponential', delay: 1000 }`).
* `removeOnComplete` / `removeOnFail` : **hygiène** redis (âge max et/ou nombre max).
* `delay` : planifier l’exécution plus tard.
* `jobId` : déduplication (si tu fixes un id connu, BullMQ n’en créera pas un autre identique).

Docs : [https://docs.bullmq.io/guide/jobs](https://docs.bullmq.io/guide/jobs)

---

# Bonnes pratiques / pièges

* **Connexions séparées** (main/events) : ✔️ tu l’as fait.
* **Prefix** par environnement (dev/staging/prod) : ✔️ `sentinel`.
* **Gracieuse fermeture** (close/quit) : ✔️.
* **Éviter le hot reload sauvage** du worker en dev (vite/ts-node) → s’assurer de ne pas créer **plusieurs workers** concurrents par erreur.
* **Nettoyage** des jobs (removeOnComplete/Fail) pour éviter de **gonfler Redis**.
* **Sécurité** : si exposé publiquement, protéger les endpoints (authN/Z).

---

# Comment “raconter” l’exécution de bout en bout

1. Le front appelle `POST /tasks/enqueue` → **création** d’un job (id `42`).
2. Le **Worker** prend le job, exécute `seconds` ticks, appelle **`updateProgress`** à chaque seconde.
3. Le front **poll** `GET /tasks/status/42` toutes les 1–2s.

    * Il lit `state` (`waiting/active/completed/failed`), `progress` (objet), et `result` à la fin.
4. Quand `state=completed` (ou `failed`), le frontend **arrête** de poller et met l’UI à jour.
5. La queue **auto-nettoie** les jobs après un âge/nombre donné (config).

---

# Check-list d’installation & démarrage

1. Lancer `docker compose` (Redis, MySQL, front, back) :

   ```bash
   docker compose --profile dev up --build
   ```
2. Vérifier que `back-dev` voit `REDIS_URL=redis://redis-dev:6379/0`.
3. Appeler `/tasks/enqueue` et `/tasks/status/:id`.
4. Surveiller les logs `back-dev` : tu dois voir le worker démarrer et les messages `failed` éventuels.

---

# Extensions possibles

* **SSE** (ou WebSocket) à partir de `QueueEvents` pour live updates sans poller.
* **Bull Board** (UI de bullmq) : visualiser la queue (attention aux versions/licences).
* **Sharding** workers (plusieurs instances) avec mêmes `QUEUE_NAME`/`prefix` pour scaler horizontalement.
* **Backoff/retry** configurables par type de job.
