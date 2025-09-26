import {useEffect, useState} from "react";
import {DataGrid, type GridRowId, type GridRowSelectionModel} from '@mui/x-data-grid';
import {SERVER_STATUS} from "../../common/enums/server-status.ts";
import {useServers} from "../../contexts/ServersContext.tsx";
import {ErrorTemplate} from "../../common/components/error";
import {Loader} from "../../common/components/loader";
import {columnsServer} from "../../common/datagrid/servers.tsx";
import Box from "@mui/material/Box";
import {CustomToolbarConsult} from "./custom-consult.tsx";

export const Servers = () => {

    const {fetchServers, deleteServers, servers, loading, error} = useServers();

    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({type: 'include', ids: new Set()});
    const [serversToDelete, setServersToDelete] = useState<GridRowId[]>([]);

    const handleDeleteServers = () => deleteServers(serversToDelete)

    useEffect(() => {
        fetchServers(SERVER_STATUS.CONFIGURED)
    }, []);

    useEffect(() => {
        setServersToDelete(Array.from(rowSelectionModel.ids.values()))
    }, [setRowSelectionModel, rowSelectionModel]);

    if (loading && servers.length === 0) return <Loader color="warning"/>
    if (error) return <ErrorTemplate errorId={error} details={error} onRetry={() => document.location.reload()} showReload/>

    return (
            <Box sx={{height: "80vh", width: '95vw', margin: 'auto', mt: 4}}>
                <DataGrid
                    rows={servers}
                    columns={columnsServer}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    slots={{toolbar: CustomToolbarConsult}}
                    slotProps={{
                        toolbar: {
                            serversToDelete,
                            handleDeleteServers,
                        },
                    }}
                    pageSizeOptions={[5]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    showToolbar
                    onRowSelectionModelChange={(newRowSelectionModel) => {
                        setRowSelectionModel(newRowSelectionModel);
                    }}
                    rowSelectionModel={rowSelectionModel}
                />
            </Box>
    )
}
