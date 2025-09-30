export const HEADERS = [
    "serverIp",
    "status",
    "isSsl",
    "cores",
    "ramMb",
    "storageGb",
    "provider",
    "ownerClientId",
    "batchId",
    "ansibleConfigId",
    "sshUser",
    "sshPort",
    "sshAuth",
    "sshPassword",
    "health",
] as const;

export const toCsv = (rows: (string | number | boolean)[][], withBOM = true) => {
    const csv = rows
        .map((r) =>
            r
                .map((cell) => {
                    const s = String(cell ?? "");
                    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
                })
                .join(",")
        )
        .join("\n");
    return withBOM ? "\uFEFF" + csv : csv;
}

export const downloadTextFile = (content: string, filename: string, mime = "text/csv;charset=utf-8") => {
    const blob = new Blob([content], {type: mime});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

const randomPrivateIPv4 = (): string => {
    const choice = Math.floor(Math.random() * 3);
    if (choice === 0) {
        return `10.${rand8()}.${rand8()}.${randHost()}`;
    } else if (choice === 1) {
        const second = 16 + Math.floor(Math.random() * 16);
        return `172.${second}.${rand8()}.${randHost()}`;
    }
    return `192.168.${rand8()}.${randHost()}`;
}

const rand8 = () => Math.floor(Math.random() * 256);


const randHost = () => Math.floor(Math.random() * 253) + 1;

export const uniquePrivateIPs = (n: number): string[] => {
    const set = new Set<string>();
    while (set.size < n) set.add(randomPrivateIPv4());
    return Array.from(set);
}

export const buildServerRows = (ips: string[]): (string | number | boolean)[][] => {
    const candidates = [
        {role: "app", cores: 2, ramMb: 2048, storageGb: 40, provider: "ovh"},
        {role: "db", cores: 4, ramMb: 4096, storageGb: 80, provider: "scaleway"},
        {role: "cache", cores: 2, ramMb: 2048, storageGb: 30, provider: "hetzner"},
    ];

    return ips.map((ip, i) => {
        const c = candidates[i % candidates.length];
        return [
            ip,
            "PENDING",
            false,
            c.cores,
            c.ramMb,
            c.storageGb,
            c.provider,
            0,
            "",
            "",
            "root",
            22,
            "PASSWORD",
            "password",
            "UNKNOWN",
        ];
    });
}
