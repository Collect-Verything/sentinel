export function shouldReloadOnTasksClose(paths: string[], currentPath: string = window.location.pathname): boolean {
    const normalize = (s: string) => '/' + s.trim().replace(/^\/+/, '').split('?')[0].split('#')[0];
    const cur = normalize(currentPath);

    const shouldReload = paths.some((p) => {
        const base = normalize(p);
        return cur === base || cur.startsWith(base + '/');
    });

    if (shouldReload) window.location.reload();
    return shouldReload;
}