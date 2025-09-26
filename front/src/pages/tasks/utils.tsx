export const serversRange = (ids?: number[]) =>
    Array.isArray(ids) && ids.length ? `${Math.min(...ids)} à ${Math.max(...ids)}` : undefined;

export const currentIdFromInfo = (info?: string) => {
    const m = info?.match(/server\s+(\d+)/i);
    return m ? Number(m[1]) : undefined;
};


export const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
export const formatDateTime = (ts?: number) =>
    ts ? new Intl.DateTimeFormat(undefined, {dateStyle: "short", timeStyle: "medium"}).format(ts) : "—";

export const percentFromProgress = (p?: number | { step: number; total: number }) => {
    if (typeof p === "number") return clamp(p);
    if (p && p.total) return clamp(Math.round((p.step / p.total) * 100));
    return 0;
};

export function shouldReloadOnTasksClose(pathname: string) {
    return /^\/(servers-config|servers)(\/|$)/.test(pathname);
}