import './index.css';
import {type ChangeEvent, useState} from "react";
import type {Server} from "../../common/types/backend";
import {parseServerCsvToJson} from "./parse-csv.ts";
import {apiPost} from "../../common/utils/web";
import {SERVERS_PATH} from "../../common/utils/web/const.ts";
import {type AlertColor} from "@mui/material";
import {ErrorServerPersistenceIcon, ErrorServerPersistenceMessage} from "./alert-message.tsx";

// TODO : Creer web util, voire meme creer un package npm histoire de ...

export const AddServers = () => {

    const [serverList, setServerList] = useState<Omit<Server, "id" | "createdAt" | "updatedAt">[]>()
    const [alert, setAlert] = useState<AlertColor | "validconv">("info");

    const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
        setAlert("info");
        const file = event.target.files?.[0];
        if (file) parseServerCsvToJson(file).then((res)=>{
            setServerList(res)
            setAlert("validconv")
        }).catch(()=>{
            setAlert("warning")
        });
    };


    const sendFile = () => {
        apiPost(SERVERS_PATH, serverList).then(() => {
            setAlert("success");
            // keep id created to configure in model
        }).catch(() => {
            setAlert("error");
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

            <section className="form-section">
                <label htmlFor="csv-upload" className="form-label">
                    Importer un fichier CSV
                </label>
                <input
                    type="file"
                    id="csv-upload"
                    accept=".csv"
                    className="file-input"
                    onChange={(e) => handleFile(e)
                    }
                />

                <div className="info-bubble">
                    {ErrorServerPersistenceIcon[alert]}
                    <span>
                        {ErrorServerPersistenceMessage[alert]}
                    </span>
                </div>
                <button
                    className={`hero-button ${alert === "validconv" ? "success":""}`}
                    disabled={alert !== "validconv"}
                    onClick={sendFile}
                >
                    📤 Envoyer
                </button>
            </section>

            <footer className="page-footer">
                <a href="/servers" className="hero-button secondary">
                    🖥️ Retour à la gestion des serveurs
                </a>
            </footer>
        </div>
    );
};
