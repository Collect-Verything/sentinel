import type IORedis from 'ioredis';
import {RedisOptions} from "ioredis";
import type {QueueEvents, Worker as BullWorker} from 'bullmq';

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
    events.on('failed', ({jobId, failedReason}) => logger.error(`[events] job ${jobId} failed: ${failedReason}`));
}

/**
 * Normalise un état BullMQ vers les états métiers de l'UI.
 *
 * BullMQ expose des états fins (waiting, delayed, paused, active, completed, failed).
 * L'UI n'en utilise que 4 principaux : queued, running, completed, failed.
 *
 * Mapping :
 *  - waiting / delayed / paused  → 'queued'
 *  - active                      → 'running'
 *  - completed                   → 'completed'
 *  - failed                      → 'failed'
 *  - (autre)                     → 'unknown'
 *
 * @param bull - État brut renvoyé par BullMQ (ex: 'waiting', 'active', ...)
 * @returns État normalisé pour l'UI : 'queued' | 'running' | 'completed' | 'failed' | 'unknown'
 *
 * @example
 * mapState('waiting');   // 'queued'
 * mapState('active');    // 'running'
 * mapState('completed'); // 'completed'
 * mapState('oops');      // 'unknown'
 */
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