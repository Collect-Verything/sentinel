import {useEffect, useMemo, useRef, useState} from "react";
import Box from '@mui/material/Box';
import {DataGrid, type GridColDef, type GridRowId, type GridRowSelectionModel} from '@mui/x-data-grid';
import {type ServerInterface} from "../../common/types/backend";
import CircularProgress from '@mui/material/CircularProgress';
import {SERVER_STATUS} from "../../common/enums/server-status.ts";
import {useTasks} from "../../contexts/TasksContext.tsx";
import {columnsServer} from "../../common/datagrid/servers.tsx";
import {CustomToolbarConfig} from "./custom-config.tsx";
import {useServers} from "../../contexts/ServersContext.tsx";
import {Loader} from "../../common/components/loader";
import {ErrorTemplate} from "../../common/components/error";


export const ServersConfig = () => {
    const {fetchServers, deleteServers, servers, loading, error} = useServers();
    const {hasActiveTasks} = useTasks();

    useEffect(() => {
        fetchServers(SERVER_STATUS.PENDING)
    }, []);

    const prevHasActive = useRef(hasActiveTasks);
    useEffect(() => {
        if (prevHasActive.current && !hasActiveTasks) {
            fetchServers(SERVER_STATUS.PENDING);
        }
        prevHasActive.current = hasActiveTasks;
    }, [hasActiveTasks, fetchServers]);

    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({type: 'include', ids: new Set()});
    const [selectedServerIds, setSelectedServerIds] = useState<GridRowId[]>([]);


    useEffect(() => {
        setSelectedServerIds(Array.from(rowSelectionModel.ids.values()))
    }, [setRowSelectionModel, rowSelectionModel]);


    const handleDeleteServers = () => deleteServers(selectedServerIds).then(() => setSelectedServerIds([]))

    const {isServerInProgress} = useTasks();

    const interactiveColumn = useMemo<GridColDef<ServerInterface>[]>(() => [
        {
            field: "id",
            headerName: "ID",
            width: 50,
            renderCell: (params) => {
                const busy = isServerInProgress(params.row.id as number);
                if (busy) {
                    return (
                        <span style={{display: "inline-flex", alignItems: "center", gap: 6}}>
                            <CircularProgress size={14}/>
                        </span>
                    );
                }
                return <>{params.value}</>;
            },
        },
        ...columnsServer.filter((c) => c.field !== "id")
    ], [isServerInProgress]);
    if (loading && servers.length === 0) return <Loader color="warning"/>
    if (error) return <ErrorTemplate errorId={error} details={error} onRetry={() => document.location.reload()} showReload/>

    return (
        <Box sx={{height: "80vh", width: '95vw', margin: 'auto', mt: 4}}>
            <DataGrid
                rows={servers}
                columns={interactiveColumn}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 10,
                        },
                    },
                }}
                slots={{toolbar: CustomToolbarConfig}}
                slotProps={{
                    toolbar: {
                        selectedServerIds,
                        handleDeleteServers,
                    },
                }}
                pageSizeOptions={[5]}
                checkboxSelection
                showToolbar
                onRowSelectionModelChange={(newRowSelectionModel) => {
                    setRowSelectionModel(newRowSelectionModel);
                }}
                keepNonExistentRowsSelected
                rowSelectionModel={rowSelectionModel}
            />
        </Box>
    )
}