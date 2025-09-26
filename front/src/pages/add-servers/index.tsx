import './index.css';
import {type ChangeEvent, useState} from "react";
import type {ServerInterface} from "../../common/types/backend";
import {parseServerCsvToJson} from "./parse-csv.ts";
import {apiPost} from "../../common/utils/web";
import {SERVERS_PATH} from "../../common/utils/web/const.ts";
import {type AlertColor, Grid} from "@mui/material";
import {ErrorServerPersistenceIcon, ErrorServerPersistenceMessage} from "./alert-message.tsx";
import {DialogConfigServers} from "./dialog.tsx";
import {LINKS} from "../../app/links.ts";

// TODO : Creer web util, voire meme creer un package npm pour le partage des type une fois que tout est stable

export const AddServers = () => {

    const [serverList, setServerList] = useState<Omit<ServerInterface, "id" | "createdAt" | "updatedAt">[]>()
    const [alert, setAlert] = useState<AlertColor | "validconv">("info");
    const [idsServerReadyToConfig, setIdsServerReadyToConfig] = useState<number[]>();
    const [openDialog, setOpenDialog] = useState(false);

    const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
        setAlert("info");
        const file = event.target.files?.[0];
        if (file) parseServerCsvToJson(file).then((res) => {
            setServerList(res)
            setAlert("validconv")
        }).catch(() => {
            setAlert("warning")
        });
    };


    const sendFile = () => {
        apiPost(SERVERS_PATH, serverList).then((res) => {
            setAlert("success");
            setIdsServerReadyToConfig(res.listId)
        }).catch(() => {
            setAlert("error");
        })
    }

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };


    return (
        <div className="page-container">
            <header className="page-header">
                <h1 className="page-title">Ajouter des serveurs</h1>
                <p className="page-subtitle">
                    Rentrez ici votre nouvelle range de serveurs via CSV.
                </p>
            </header>

            <section className="form-section">
                <label htmlFor="csv-upload" className="form-label">
                    Importer un fichier CSV
                </label>
                <input
                    type="file"
                    id="csv-upload"
                    accept=".csv"
                    className="file-input"
                    onChange={(e) => handleFile(e)}
                />

                <Grid className="info-bubble" container direction="column">
                    <Grid margin={"auto"} container spacing={3} alignItems="center">
                        <Grid margin={"left"}>
                            {ErrorServerPersistenceIcon[alert]}
                        </Grid>
                        <Grid>
                            {ErrorServerPersistenceMessage[alert]}
                        </Grid>
                    </Grid>
                    <Grid margin={"auto"}>
                        {idsServerReadyToConfig &&
                            <DialogConfigServers openDialog={openDialog} handleOpenDialog={handleOpenDialog} setOpenDialog={setOpenDialog} idsServerReadyToConfig={idsServerReadyToConfig}/>
                        }
                    </Grid>
                </Grid>
                <button
                    className={`hero-button ${alert === "validconv" ? "success" : ""}`}
                    disabled={alert !== "validconv"}
                    onClick={sendFile}
                >
                    📤 Envoyer
                </button>
            </section>

            <footer className="page-footer">
                <Grid container spacing={2}>
                    <Grid>
                        <a href={LINKS.SERVERS} className="hero-button secondary">
                            🖥️ Consulter serveurs
                        </a>
                    </Grid>
                    <Grid>

                        <a href={LINKS.SERVERS_CONFIG} className="hero-button secondary">
                            ⚙️ Configurer serveurs
                        </a>
                    </Grid>
                </Grid>
            </footer>
        </div>
    );
};
