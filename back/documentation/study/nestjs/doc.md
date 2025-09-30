
# NestJS (lifecycle, shutdown, configuration)

* **Lifecycle hooks** (`OnModuleInit`, `OnModuleDestroy`, async init). ([docs.nestjs.com][16])
* **`enableShutdownHooks()`** (pour déclencher proprement les hooks à la fin). ([docs.nestjs.com][16])
* **Graceful shutdown (exemples & bonnes pratiques)**. ([DEV Community][17])
* **Configuration & `ConfigModule`** (schema validation via Joi, ou `validate()` custom). ([docs.nestjs.com][18])
* **Queues dans Nest (intégration Bull/BullMQ, listeners d’événements)**. ([docs.nestjs.com][19])
* **Terminus / Healthchecks** (reco d’activer shutdown hooks). ([docs.nestjs.com][20])


[1]: https://docs.bullmq.io/guide/queues?utm_source=chatgpt.com "Queues"
[2]: https://docs.bullmq.io/guide/queues/auto-removal-of-jobs?utm_source=chatgpt.com "Auto-removal of jobs"
[3]: https://docs.bullmq.io/guide/architecture?utm_source=chatgpt.com "Architecture"
[4]: https://docs.bullmq.io/guide/workers?utm_source=chatgpt.com "Workers"
[5]: https://api.docs.bullmq.io/interfaces/v4.WorkerOptions.html?utm_source=chatgpt.com "Interface WorkerOptions"
[6]: https://api.docs.bullmq.io/classes/v5.Job.html?utm_source=chatgpt.com "Class Job<DataType, ReturnType, NameType>"
[7]: https://docs.bullmq.io/guide/retrying-failing-jobs?utm_source=chatgpt.com "Retrying failing jobs"
[8]: https://docs.bullmq.io/guide/rate-limiting?utm_source=chatgpt.com "Rate limiting"
[9]: https://docs.bullmq.io/bull/patterns/custom-backoff-strategy?utm_source=chatgpt.com "Custom backoff strategy"
[10]: https://api.docs.bullmq.io/classes/v2.Scripts.html?utm_source=chatgpt.com "Scripts | bullmq"
[11]: https://ioredis.readthedocs.io/en/latest/API/?utm_source=chatgpt.com "API - ioredis"
[12]: https://redis.github.io/ioredis/interfaces/CommonRedisOptions.html?utm_source=chatgpt.com "CommonRedisOptions | ioredis"
[13]: https://ioredis.readthedocs.io/en/stable/README/?utm_source=chatgpt.com "README - ioredis"
[14]: https://github.com/redis/node-redis/issues/2719?utm_source=chatgpt.com "quit vs disconnect - flipped behaviour or wrong ..."
[15]: https://github.com/redis/ioredis?utm_source=chatgpt.com "redis/ioredis: 🚀 A robust, performance-focused, and full- ..."
[16]: https://docs.nestjs.com/fundamentals/lifecycle-events?utm_source=chatgpt.com "Lifecycle events | NestJS - A progressive Node.js framework"
[17]: https://dev.to/hienngm/graceful-shutdown-in-nestjs-ensuring-smooth-application-termination-4e5n?utm_source=chatgpt.com "Graceful Shutdown in NestJS: Ensuring Smooth ..."
[18]: https://docs.nestjs.com/techniques/configuration?utm_source=chatgpt.com "Configuration | NestJS - A progressive Node.js framework"
[19]: https://docs.nestjs.com/techniques/queues?utm_source=chatgpt.com "Queues | NestJS - A progressive Node.js framework"
[20]: https://docs.nestjs.com/recipes/terminus?utm_source=chatgpt.com "Health checks (Terminus) | NestJS - A progressive Node.js ..."
[21]: https://blog.taskforce.sh/rate-limit-recipes-in-nodejs-using-bullmq/?utm_source=chatgpt.com "Rate-Limit recipes in NodeJS using BullMQ"
[22]: https://www.darraghoriordan.com/2021/10/10/validate-configuration-module-feature-nestjs?utm_source=chatgpt.com "How to validate configuration per module in NestJs"
