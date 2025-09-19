import {useEffect, useState} from "react";
import {apiGet} from "../../common/utils/web";
import {SERVERS_PATH} from "../../common/utils/web/const.ts";
import {Grid} from "@mui/material";
import Typography from "@mui/material/Typography";

export const Servers = () => {

    const [servers, setServers] = useState([]);

    useEffect(() => {
        apiGet(SERVERS_PATH).then(setServers).catch(console.error);
    }, [])

    return (
        <Grid mt={10}>
            {servers.length === 0 ?
                <>
                    <Typography>Aucun serveur pour le moment</Typography>
                </>
                : <Grid>
                    {servers.map((server: any) => (
                        <p>{server.id}</p>
                    ))}
                </Grid>
            }
        </Grid>
    )
}