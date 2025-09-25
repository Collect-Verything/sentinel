import type IORedis from 'ioredis';
import {RedisOptions} from "ioredis";
import type {Job, QueueEvents, Worker as BullWorker} from 'bullmq';

export type TaskPayload = { listIdServer: number[]; delayMs?: number };
export type TaskProgress = { step: number; total: number; info?: string };
export type TaskResult = { message: string; elapsedMs: number };

export const QUEUE_NAME = process.env.QUEUE_NAME ?? 'sentinel-tasks';
export const BULL_PREFIX = process.env.BULL_PREFIX ?? 'sentinel';

export const getRedisConfig = () => {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379/0';
    const redisOpts: RedisOptions = {
        maxRetriesPerRequest: null as unknown as number,
        enableReadyCheck: false,
    };
    return {redisUrl, redisOpts};
}

/**
 * Processor des tâches longues (tick chaque seconde et met à jour la progression).
 * Séparé pour testabilité et lisibilité.
 */
export async function processLongTask(job: Job<TaskPayload, TaskResult, string>): Promise<TaskResult> {
    const ids = job.data.listIdServer ?? [];
    const total = Math.max(1, ids.length || 1);
    const delayMs = Number.isFinite(job.data.delayMs) ? Math.max(0, job.data.delayMs!) : 1000;
    const start = Date.now();

    for (let i = 0; i < total; i++) {
        const currentId = ids[i];
        await new Promise((r) => setTimeout(r, delayMs));
        await job.updateProgress({
            step: i + 1,
            total,
            info: currentId != null ? `server ${currentId} (${i + 1}/${total})` : `tick ${i + 1}/${total}`,
        });
    }
    return { message: `Tâche ${job.id} terminée`, elapsedMs: Date.now() - start };
}

/**
 * Exécute une promesse de fermeture en loggant les erreurs sans interrompre le flux.
 * @param label  Libellé pour les logs (ex: "worker.close")
 * @param p      Promesse de fermeture (ou undefined si ressource absente)
 */
export async function safeClose<T>(label: string, p?: Promise<T>) {
    if (!p) return;
    try {
        await p;
    } catch (e: any) {
        console.error(`[shutdown] ${label} failed:`, e?.message ?? e);
    }
}

/**
 * Ferme une connexion ioredis proprement.
 * Tente QUIT, puis fallback sur disconnect() si la connexion est déjà cassée.
 * @param name    Nom pour les logs (ex: "redisMain")
 * @param client  Instance IORedis (ou undefined)
 */
export async function quitOrDisconnect(name: string, client?: IORedis) {
    if (!client) return;
    try {
        await client.quit();
    } catch {
        console.warn(`[shutdown] ${name}.quit failed, fallback to disconnect`);
        client.disconnect(false);
    }
}


/**
 * Attache les listeners d'observabilité au worker et aux QueueEvents.
 * @param worker  Instance BullMQ Worker
 * @param events  Instance BullMQ QueueEvents
 * @param logger  Interface de log (par défaut console)
 */
export function registerWorkerListeners<
    P = unknown,
    R = unknown,
    N extends string = string
>(
    worker: BullWorker<P, R, N>,
    events: QueueEvents,
    logger: Pick<Console, 'log' | 'error'> = console
): void {
    worker.on('completed', (job, result) => logger.log(`[worker] job ${job.id} completed`, result));
    worker.on('failed', (job, err) => logger.error(`[worker] job ${job?.id} failed:`, err?.message));
    worker.on('error', (err) => logger.error('[worker] error:', err?.message));
    events.on('failed', ({ jobId, failedReason }) => logger.error(`[events] job ${jobId} failed: ${failedReason}`));
}



export function mapState(bull: string): 'queued' | 'running' | 'completed' | 'failed' | 'unknown' {
    switch (bull) {
        case 'waiting':
        case 'delayed':
        case 'paused':
            return 'queued';
        case 'active':
            return 'running';
        case 'completed':
            return 'completed';
        case 'failed':
            return 'failed';
        default:
            return 'unknown';
    }
}