import { Button } from "@mui/material";
import {buildServerRows, downloadTextFile, HEADERS, toCsv, uniquePrivateIPs} from "./functions.ts";
import {useCallback} from "react";

export const DownloadCsvTemplateButton = ({filename = "servers_template.csv"}: { filename?: string; }) => {
    const handleDownload = useCallback(() => {
        const ips = uniquePrivateIPs(3);
        const header = HEADERS as unknown as string[];
        const rows = buildServerRows(ips);
        const csv = toCsv([header, ...rows], true);
        downloadTextFile(csv, filename);
    }, [filename]);

    return (
        <Button variant="contained" onClick={handleDownload}>Télécharger le template CSV</Button>
    );
}