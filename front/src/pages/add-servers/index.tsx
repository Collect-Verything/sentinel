import './index.css';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export const AddServers = () => {
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
                />

                <div className="info-bubble">
                    <InfoOutlinedIcon className="info-icon" />
                    <span>
            Voici le format à respecter :
            <br />
            <code>hostname,ip,location</code>
          </span>
                </div>

                <button className="hero-button success">📤 Envoyer</button>
            </section>

            <footer className="page-footer">
                <a href="/servers" className="hero-button secondary">
                    🖥️ Retour à la gestion des serveurs
                </a>
            </footer>
        </div>
    );
};
