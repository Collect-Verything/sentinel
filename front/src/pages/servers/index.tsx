import {useEffect, useState} from "react";
import {apiDelete, apiGet} from "../../common/utils/web";
import {SERVERS_PATH} from "../../common/utils/web/const.ts";
import Box from '@mui/material/Box';
import {DataGrid, type GridRowId, type GridRowSelectionModel} from '@mui/x-data-grid';
import type {Server} from "../../common/types/backend";
import CircularProgress from '@mui/material/CircularProgress';
import {columnsServer} from "../../common/datagrid/servers.ts";
import {SERVER_STATUS} from "../../common/enums/server-status.ts";
import Button from "@mui/material/Button";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

export const Servers = () => {

    const [rows, setRows] = useState<Server[]>([]);
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
    const [serversToDelete, setServersToDelete] = useState<GridRowId[]>([]);

    const handleDeleteServers = () => {
        apiDelete(`${SERVERS_PATH}`, {serversToDelete}).then(() => window.location.reload()).catch(console.error);
    }

    useEffect(() => {
        apiGet(`${SERVERS_PATH}/by-config/${SERVER_STATUS.CONFIGURED}`).then(setRows).catch(console.error);
    }, [])

    useEffect(() => {
        setServersToDelete(Array.from(rowSelectionModel.ids.values()))
    }, [setRowSelectionModel, rowSelectionModel]);

    return (
        <>
            {rows ?
                <Box sx={{height: "80vh", width: '95vw', margin: 'auto', mt: 4}}>
                    {serversToDelete.length > 0 && <Button variant="contained" sx={{backgroundColor:"white" ,marginBottom:1}} onClick={handleDeleteServers}><DeleteForeverIcon color="error"/></Button>}
                    <DataGrid
                        rows={rows}
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
                :
                <Box sx={{display: 'flex'}}>
                    <CircularProgress/>
                </Box>
            }
        </>
    )
}