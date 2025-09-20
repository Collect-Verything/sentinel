import './index.css';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';

import Papa, {type ParseResult} from "papaparse";
import {useState} from "react";
import {apiPost} from "../../common/utils/web";
import {SERVERS_PATH} from "../../common/utils/web/const.ts";

// TODO : Alerte pop up if file is incorrect ... main error for format, extension ...
// TODO : Creer web util, voire meme creer un package npm histoire de ...

export const AddServers = () => {

    const [file, setFile] = useState<ParseResult<unknown>>()

    const handleFile = (event: any) => {
        const files = event.target.files;
        if (files) {
            Papa.parse(files[0], {
                header: true,
                skipEmptyLines: true,
                complete: function (results:ParseResult<unknown>) {
                    setFile(results.data);
                }
            });
        }
    };


    const sendFile = () => {
        // TODO : FIX



        apiPost(SERVERS_PATH, file)
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
                    // onChange={handleChange}
                    onChange={(e) => handleFile(e)
                    }
                />

                <div className="info-bubble">
                    {file ?
                        <DoneOutlineIcon className="valid-icon"/>
                        :
                        <InfoOutlinedIcon className="info-icon"/>
                    }

                    {file ?
                        <span>Fichier valide</span>
                        :
                        <span>
                            Voici le format à respecter :
                            <br/>
                            <code>hostname,ip,location</code>
                        </span>
                    }

                </div>
                <button className={`hero-button ${file ? "success" : ""}`} disabled={!file} onClick={sendFile}>📤 Envoyer</button>
            </section>

            <footer className="page-footer">
                <a href="/servers" className="hero-button secondary">
                    🖥️ Retour à la gestion des serveurs
                </a>
            </footer>
        </div>
    );
};
