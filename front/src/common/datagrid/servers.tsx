import type {GridColDef} from "@mui/x-data-grid";
import {type ServerInterface, ServerStatus} from "../types/backend";

export const columnsServer: GridColDef<ServerInterface>[] = [
    {field: 'id', headerName: 'ID', width: 10},
    {field: 'serverIp', headerName: 'IP Server', width: 100},
    {field: 'status', headerName: 'Status', width: 110, valueGetter: (_value) => `${_value === ServerStatus.PENDING ? "🟠 En attente" : "🟢 Configuré"}`},
    {field: 'isSsl', headerName: 'SSL', width: 70},

    {field: 'cores', headerName: 'Cores', width: 60},
    {field: 'ramMb', headerName: 'Ram Mb', width: 90, valueGetter: (_value) => `${_value} Mb`},
    {field: 'storageGb', headerName: 'Storage Gb', width: 90, valueGetter: (_value) => `${_value} Gb`},
    {field: 'provider', headerName: 'Fournisseur', width: 90, valueGetter: (_value: string) => `${_value.toUpperCase()[0]}${_value.slice(1, _value.length)}`},

    {field: 'ownerClientId', headerName: 'Owner Client Id', width: 90},
    {field: 'batchId', headerName: 'Batch Id', width: 90},
    {field: 'ansibleConfigId', headerName: 'Ansible Config Id', width: 90},

    {field: 'sshUser', headerName: 'Ssh User', width: 90},
    {field: 'sshPort', headerName: 'Ssh Port', width: 90},
    {field: 'sshAuth', headerName: 'Ssh Auth', width: 110},
    {field: 'sshPassword', headerName: 'Ssh Password', width: 110},

    {field: 'health', headerName: 'Etat', width: 90},
    {field: 'lastSeenAt', headerName: 'Last Seen At', width: 90},
    {field: 'lastCheckAt', headerName: 'last Check At', width: 90},

    {field: 'createdAt', headerName: 'Date création', width: 90},
    {field: 'updatedAt', headerName: 'Derniere MàJ', width: 90},
];
