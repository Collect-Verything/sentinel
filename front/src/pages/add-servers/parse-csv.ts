import Papa, {type ParseResult} from "papaparse";
import type {Server} from "../../common/types/backend";

type ServerCreate = Omit<Server, "id" | "createdAt" | "updatedAt">;


export const parseServerCsvToJson = (formFile: File): Promise<ServerCreate[]> => {
    return new Promise((resolve, reject) => {

        Papa.parse(formFile, {
            header: true,
            skipEmptyLines: true,
            complete: function (results: ParseResult<any>) {
                const cleanList = results.data.map((item: Omit<Server, "id" | "createdAt" | "updatedAt">) => ({
                    ...item,
                    isSsl: item.isSsl === 'true',
                    sshPort: item.sshPort ? Number(item.sshPort) : 22,
                    cores: item.cores ? Number(item.cores) : 0,
                    ramMb: item.ramMb ? Number(item.ramMb) : 0,
                    storageGb: item.storageGb ? Number(item.storageGb) : 0,
                    ownerClientId: item.ownerClientId ? Number(item.ownerClientId) : 0,
                    batchId: item.batchId ? Number(item.batchId) : 0,
                    ansibleConfigId: item.ansibleConfig ? Number(item.ansibleConfig) : 0,
                })) as ServerCreate[];

                resolve(cleanList);
            },
            error: reject,
        });
    });
}