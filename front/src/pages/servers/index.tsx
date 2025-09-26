import {useEffect, useState} from "react";
import {apiDelete} from "../../common/utils/web";
import {SERVERS_PATH} from "../../common/utils/web/const.ts";
import {DataGrid, type GridRowId, type GridRowSelectionModel} from '@mui/x-data-grid';
import {SERVER_STATUS} from "../../common/enums/server-status.ts";
import {useServers} from "../../contexts/ServersContext.tsx";
import {ErrorTemplate} from "../../common/components/error";
import {Loader} from "../../common/components/loader";
import {columnsServer} from "../../common/datagrid/servers.tsx";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

export const Servers = () => {

    const {fetchServers, getServers, loading, error} = useServers();

    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({type: 'include', ids: new Set()});
    const [serversToDelete, setServersToDelete] = useState<GridRowId[]>([]);

    const handleDeleteServers = () => {
        apiDelete(`${SERVERS_PATH}`, {serversToDelete}).then(() => window.location.reload()).catch(console.error);
    }

    useEffect(() => {
        fetchServers(SERVER_STATUS.CONFIGURED)
    }, []);
    const servers = getServers('CONFIGURED');


    useEffect(() => {
        setServersToDelete(Array.from(rowSelectionModel.ids.values()))
    }, [setRowSelectionModel, rowSelectionModel]);

    if (loading) return <Loader color="warning"/>
    if (error) return <ErrorTemplate errorId={error} details={error} onRetry={() => document.location.reload()} showReload/>

    return (
        <>
            <Box sx={{height: "80vh", width: '95vw', margin: 'auto', mt: 4}}>
                {serversToDelete.length > 0 && <Button variant="contained" sx={{backgroundColor: "white", marginBottom: 1}} onClick={handleDeleteServers}><DeleteForeverIcon color="error"/></Button>}
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
        </>
    )
}