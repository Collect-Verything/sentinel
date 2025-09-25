import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import { Queue, QueueEvents, Worker as BullWorker} from 'bullmq';
import type { JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
import {mapState, TaskPayload, TaskProgress, TaskResult} from './tasks.tool';
import {BULL_PREFIX, getRedisConfig, processLongTask, QUEUE_NAME, quitOrDisconnect, registerWorkerListeners, safeClose} from "./tasks.tool";


@Injectable()
export class TasksService implements OnModuleInit, OnModuleDestroy {
    private readonly queue: Queue<TaskPayload, TaskResult, string>;
    private readonly events: QueueEvents;
    private readonly redisMain: IORedis;
    private readonly redisEvents: IORedis;
    private worker: BullWorker<TaskPayload, TaskResult, string> | null = null;


    constructor() {
        const {redisUrl, redisOpts} = getRedisConfig();

        this.redisMain = new IORedis(redisUrl, redisOpts);
        this.redisEvents = new IORedis(redisUrl, redisOpts);

        this.queue = new Queue<TaskPayload, TaskResult, string>(QUEUE_NAME, {
            connection: this.redisMain,
            prefix: BULL_PREFIX,
        });

        this.events = new QueueEvents(QUEUE_NAME, {
            connection: this.redisEvents,
            prefix: BULL_PREFIX,
        });
    }

    /**
     * Initialise la chaîne BullMQ :
     *  1) Attend la readiness de QueueEvents et Queue en parallèle (logs d’erreur si KO).
     *  2) Crée le Worker avec processor dédié et concurrence configurée.
     *  3) Attend la readiness du Worker (exception si KO).
     *  4) Enregistre les listeners d’observabilité (worker + events).
     */
    async onModuleInit() {
        try {
            await Promise.all([
                this.events.waitUntilReady(),
                this.queue.waitUntilReady(),
            ]);
        } catch (e) {
            console.error('[tasks] BullMQ not ready:', (e as Error)?.message);
            throw e;
        }

        this.worker = new BullWorker<TaskPayload, TaskResult, string>(
            QUEUE_NAME,
            (job) => processLongTask(job),
            {connection: this.redisMain, prefix: BULL_PREFIX, concurrency: 3},
        );

        const worker = this.worker;
        if (!worker) throw new Error('Worker not initialized');
        await worker.waitUntilReady();
        registerWorkerListeners<TaskPayload, TaskResult, string>(worker, this.events);
    }

    /**
     * Arrête proprement le worker, les events, la queue, puis les connexions Redis.
     * Utilise Promise.allSettled pour paralléliser sans interrompre le shutdown complet.
     */
    async onModuleDestroy() {
        await safeClose('worker.close', this.worker?.close());

        await Promise.allSettled([
            safeClose('events.close', this.events?.close()),
            safeClose('queue.close', this.queue?.close()),
        ]);

        await Promise.allSettled([
            quitOrDisconnect('redisEvents', this.redisEvents),
            quitOrDisconnect('redisMain', this.redisMain),
        ]);
    }

    async enqueue(listIdServer: number[] , idempotencyKey?: string) {
        try {
            await this.queue.waitUntilReady();
        } catch (e) {
            console.error('[enqueue] queue not ready:', (e as Error)?.message);
            throw e;
        }

        const opts: JobsOptions = {
            attempts: 3,
            backoff: {type: 'exponential', delay: 1000},
            removeOnComplete: {age: 3600, count: 100},
            removeOnFail: {age: 3600, count: 100},
            jobId: idempotencyKey
        };

        const job = await this.queue.add('longTask', { listIdServer, delayMs: 2000 }, opts);
        console.log('[enqueue] created job id=', job.id);
        return {id: String(job.id)};
    }

    /** Etat du job*/

    async getStatus(id: string) {
        if (!id) return { error: 'not_found' as const, id };

        let job = await this.queue.getJob(id) ?? (/^\d+$/.test(id) ? await this.queue.getJob(String(Number(id))) : null);
        if (!job) return { error: 'not_found' as const, id };

        const bullState = await job.getState();
        const state = mapState(bullState);
        const progress = job.progress as TaskProgress | number;
        const result = bullState === 'completed' ? (job.returnvalue as TaskResult) : undefined;
        const failedReason = bullState === 'failed' ? job.failedReason : undefined;

        return {
            id: String(job.id),
            state,
            progress,
            result,
            failedReason,
            queuedAt: job.timestamp,
            startedAt: job.processedOn ?? null,
            finishedAt: job.finishedOn ?? null,
        };
    }

    //  debug
    async getCounts() {
        const [
            counts,
            waiting, active, delayed, completed, failed
        ] = await Promise.all([
            this.queue.getJobCounts(),
            this.queue.getWaiting(0, 10),
            this.queue.getActive(0, 10),
            this.queue.getDelayed(0, 10),
            this.queue.getCompleted(0, 10),
            this.queue.getFailed(0, 10),
        ]);

        return {
            counts,
            waiting: waiting.map(j => j.id),
            active: active.map(j => j.id),
            delayed: delayed.map(j => j.id),
            completed: completed.map(j => j.id),
            failed: failed.map(j => j.id),
        };
    }

}
