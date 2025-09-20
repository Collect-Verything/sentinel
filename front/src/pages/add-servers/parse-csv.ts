import Papa, {type ParseResult } from "papaparse";
import type { Server } from "../../common/types/backend";

type ServerCreate = Omit<Server, "id" | "createdAt" | "updatedAt">;

const REQUIRED_HEADERS = [
    "serverIp",
    "isSsl",
    "cores",
    "ramMb",
    "storageGb",
    "sshUser",
    "sshPort",
    "sshAuth",
] as const;

export function parseServerCsvToJson(file: File): Promise<ServerCreate[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),      // nettoie les entêtes
            dynamicTyping: false,
            complete: (results: ParseResult<any>) => {

                // 1) erreurs de parsing (quoting, lignes invalides, etc.)
                if (results.errors?.length) {
                    return reject(
                        new Error(
                            `CSV invalide: ${results.errors
                                .slice(0, 3)
                                .map((e) => `${e.type} (row ${e.row}): ${e.message}`)
                                .join(" | ")}${results.errors.length > 3 ? " …" : ""}`
                        )
                    );
                }

                // 2) validation entêtes attendues
                const headers = Object.keys(results.data[0] ?? {});
                const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
                if (missing.length) {
                    return reject(
                        new Error(
                            `Colonnes manquantes: ${missing.join(
                                ", "
                            )}. Colonnes trouvées: ${headers.join(", ")}`
                        )
                    );
                }

                // 3) normalisation types
                const cleanList = (results.data as any[]).map((row) => {
                    const toNum = (v: unknown, def = 0) =>
                        v === "" || v == null ? def : Number(v);

                    const item: ServerCreate = {
                        serverIp: String(row.serverIp ?? "").trim(),
                        status: (row.status as ServerCreate["status"]) ?? "PENDING",
                        isSsl: String(row.isSsl).toLowerCase() === "true",
                        cores: toNum(row.cores),
                        ramMb: toNum(row.ramMb),
                        storageGb: toNum(row.storageGb),
                        provider: row.provider,
                        ownerClientId: toNum(row.ownerClientId, 0),
                        batchId: 0,

                        ansibleConfigId: 0,
                        sshUser: String(row.sshUser ?? "").trim(),
                        sshPort: row.sshPort === "" || row.sshPort == null ? 22 : Number(row.sshPort),
                        sshAuth: (row.sshAuth as ServerCreate["sshAuth"]) ?? "PASSWORD",
                        sshPassword:
                            row.sshPassword === "" || row.sshPassword == null
                                ? null
                                : row.sshPassword,
                        health: (row.health as ServerCreate["health"]) ?? "UNKNOWN",
                        lastSeenAt: row.lastSeenAt ?  row.lastSeenAt : null,
                        lastCheckAt: row.lastCheckAt ? row.lastCheckAt : null,
                    };
                    return item;
                });

                const bad = cleanList.find((s) => !s.serverIp);
                if (bad) {
                    return reject(new Error());
                }

                resolve(cleanList);
            },
            error: (err) => reject(err),
        });
    });
}
