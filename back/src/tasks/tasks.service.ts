import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import IORedis, { RedisOptions } from 'ioredis';

type TaskPayload = { seconds: number };
type TaskProgress = { step: number; total: number; info?: string };
type TaskResult = { message: string; elapsedMs: number };

const QUEUE_NAME = 'sentinel-tasks';
const BULL_PREFIX = 'sentinel';


@Injectable()
export class TasksService implements OnModuleInit, OnModuleDestroy {
    private queue!: Queue<TaskPayload, TaskResult, string>;
    private worker!: Worker<TaskPayload, TaskResult, string>;
    private events!: QueueEvents;
    private redisMain!: IORedis;
    private redisEvents!: IORedis;


    constructor() {
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
    }

    async onModuleInit() {
        await this.events.waitUntilReady();
        await this.queue.waitUntilReady();

        this.worker = new Worker<TaskPayload, TaskResult>(
            QUEUE_NAME,
            async (job) => {
                const total = Math.max(1, Math.floor(job.data.seconds ?? 20));
                const start = Date.now();
                for (let i = 1; i <= total; i++) {
                    await new Promise((r) => setTimeout(r, 1000));
                    await job.updateProgress({ step: i, total, info: `tick ${i}/${total}` });
                }
                return { message: `Tâche ${job.id} terminée`, elapsedMs: Date.now() - start };
            },
            { connection: this.redisMain, prefix: BULL_PREFIX, concurrency: 3 },
        );

        await this.worker.waitUntilReady().catch(() => void 0);

        this.worker.on('failed', (job, err) => {
            console.error(`[worker] job ${job?.id} failed:`, err?.message);
        });
    }

    async onModuleDestroy() {
        try { await this.worker?.close(); } catch {}
        try { await this.events?.close(); } catch {}
        try { await this.queue?.close(); } catch {}
        try { await this.redisEvents?.quit(); } catch {}
        try { await this.redisMain?.quit(); } catch {}
    }

    async enqueue(seconds = 20) {
        await this.queue.waitUntilReady().catch(() => void 0);
        const opts: JobsOptions = {
            attempts: 1,
            removeOnComplete: { age: 3600, count: 100 },
            removeOnFail: { age: 3600, count: 100 },
        };
        const job = await this.queue.add('longTask', { seconds }, opts);
        console.log('[enqueue] created job id=', job.id);
        return { id: String(job.id) };
    }

    /** Etat du job*/
    async getStatus(id: string) {
        if (!id) return { error: 'not_found' as const, id };

        let job = await this.queue.getJob(id);
        if (!job && /^\d+$/.test(id)) job = await this.queue.getJob(String(Number(id)));
        if (!job) return { error: 'not_found' as const, id };

        const state = await job.getState();
        const progress = job.progress as TaskProgress | number;
        const result = state === 'completed' ? job.returnvalue : undefined;
        const failedReason = state === 'failed' ? job.failedReason : undefined;

        return { id: job.id, state, progress, result, failedReason };
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
