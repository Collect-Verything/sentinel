import {useEffect, useState} from "react";
import {apiGet} from "../../common/utils/web";
import {SERVERS_PATH} from "../../common/utils/web/const.ts";
import Box from '@mui/material/Box';
import {DataGrid} from '@mui/x-data-grid';
import {columns} from "./columns.ts";
import type {Server} from "../../common/types/backend";
import CircularProgress from '@mui/material/CircularProgress';

export const Servers = () => {

    const [rows, setRows] = useState<Server[]>([]);

    useEffect(() => {
        apiGet(SERVERS_PATH).then(setRows).catch(console.error);
    }, [])

    return (
        <>
            {rows ?
                <Box sx={{height: "80vh", width: '95vw', margin: 'auto', mt: 5}}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
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