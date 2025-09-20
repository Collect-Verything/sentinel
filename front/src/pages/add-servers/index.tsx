import './index.css';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import {type ChangeEvent, useState} from "react";
import type {Server} from "../../common/types/backend";
import {parseServerCsvToJson} from "./parse-csv.ts";
import {apiPost} from "../../common/utils/web";
import {SERVERS_PATH} from "../../common/utils/web/const.ts";
import {Alert, type AlertColor, Grid} from "@mui/material";

// TODO : Alerte pop up if file is incorrect ... main error for format, extension ...
// TODO : Creer web util, voire meme creer un package npm histoire de ...

enum ErrorServerPersistenceMessage  {
    success = "Les serveurs ont bien été persistés",
    error = "Une erreur est apparue durant la persistance",
}

export const AddServers = () => {

    const [serverList, setServerList] = useState<Omit<Server, "id" | "createdAt" | "updatedAt">[]>()
    const [response, setResponse] = useState<{severity: AlertColor}>();

    const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
        setResponse(undefined);

        const file = event.target.files?.[0];
        if (file) parseServerCsvToJson(file).then(setServerList);
    };


    const sendFile = () => {
        apiPost(SERVERS_PATH, serverList).then(() => {
            setResponse({severity:"success"});
            // keep id created to configure in model
        }).catch(() => {
            setResponse({severity:"error"});
        })

    }


    return (
        <div className="page-container">
            <header className="page-header">
                <h1 className="page-title">Ajouter des serveurs</h1>
                <p className="page-subtitle">
                    Rentrez ici votre nouvelle range de serveurs via CSV.
                </p>
            </header>

            {response && (
                <Grid m={3}>
                    <Alert severity={response.severity}>
                        {ErrorServerPersistenceMessage[response.severity]}
                    </Alert>
                </Grid>
            )}

            <section className="form-section">
                <label htmlFor="csv-upload" className="form-label">
                    Importer un fichier CSV
                </label>
                <input
                    type="file"
                    id="csv-upload"
                    accept=".csv"
                    className="file-input"
                    // onChange={handleChange}
                    onChange={(e) => handleFile(e)
                    }
                />

                <div className="info-bubble">
                    {serverList ?
                        <DoneOutlineIcon className="valid-icon"/>
                        :
                        <InfoOutlinedIcon className="info-icon"/>
                    }

                    {serverList ?
                        <span>Fichier valide</span>
                        :
                        <span>
                            Voici le format à respecter :
                            <br/>
                            <code>hostname,ip,location</code>
                        </span>
                    }

                </div>
                <button className={`hero-button ${serverList ? "success" : ""}`} disabled={!serverList} onClick={sendFile}>📤 Envoyer</button>
            </section>

            <footer className="page-footer">
                <a href="/servers" className="hero-button secondary">
                    🖥️ Retour à la gestion des serveurs
                </a>
            </footer>
        </div>
    );
};
