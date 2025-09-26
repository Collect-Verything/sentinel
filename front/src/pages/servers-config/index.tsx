import {useEffect, useMemo, useState} from "react";
import {apiDelete, apiGet} from "../../common/utils/web";
import {SERVERS_PATH} from "../../common/utils/web/const.ts";
import Box from '@mui/material/Box';
import {DataGrid, type GridColDef, type GridRowId, type GridRowSelectionModel} from '@mui/x-data-grid';
import {type Server} from "../../common/types/backend";
import CircularProgress from '@mui/material/CircularProgress';
import {SERVER_STATUS} from "../../common/enums/server-status.ts";
import Button from "@mui/material/Button";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {Grid} from "@mui/material";
import {DialogConfig} from "./dialog-config.tsx";
import {useTasks} from "../../contexts/TasksContext.tsx";
import {columnsServer} from "../../common/datagrid/servers.tsx";


export const ServersConfig = () => {

    const [rows, setRows] = useState<Server[]>([]);
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({type: 'include', ids: new Set()});
    const [selectedServerIds, setSelectedServerIds] = useState<GridRowId[]>([]);

    useEffect(() => {
        apiGet(`${SERVERS_PATH}/by-config/${SERVER_STATUS.PENDING}`)
            .then(setRows)
            .catch(console.error);
    }, [])

    useEffect(() => {
        setSelectedServerIds(Array.from(rowSelectionModel.ids.values()))
    }, [setRowSelectionModel, rowSelectionModel]);

    const handleDeleteServers = () => {
        apiDelete(`${SERVERS_PATH}`, {serversToDelete: selectedServerIds})
            .then(() => window.location.reload())
            .then(() => setSelectedServerIds([]))
            .catch(console.error);
    }


    const {isServerInProgress} = useTasks();

    const interactiveColumn = useMemo<GridColDef<Server>[]>(() => [
        {
            field: "id",
            headerName: "ID",
            width: 90,
            renderCell: (params) => {
                const busy = isServerInProgress(params.row.id as number);
                if (busy) {
                    return (
                        <span style={{display: "inline-flex", alignItems: "center", gap: 6}}>
                            <CircularProgress size={14}/>
                            {params.value}
                        </span>
                    );
                }
                return <>{params.value}</>;
            },
        },
        ...columnsServer.filter((c) => c.field !== "id")
    ], [isServerInProgress]);


    return (
        <>
            {rows ?
                <Box sx={{height: "80vh", width: '95vw', margin: 'auto', mt: 4}}>
                    {selectedServerIds.length > 0 && (
                        <Grid spacing={1} container>
                            <Grid>
                                <Button variant="outlined" sx={{backgroundColor: "white", marginBottom: 1}} onClick={handleDeleteServers}><DeleteForeverIcon color="error"/></Button>
                            </Grid>
                            <DialogConfig selectedServerIds={selectedServerIds}/>
                        </Grid>
                    )}
                    <DataGrid
                        rows={rows}
                        columns={interactiveColumn}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
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
                :
                <Box sx={{display: 'flex'}}>
                    <CircularProgress/>
                </Box>
            }
        </>
    )
}