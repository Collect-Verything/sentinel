import './App.css';
import {Grid} from "@mui/material";

export const Home = () => {
    return (
        <Grid mt={10} className="home-container">
            <header className="hero" >
                <h1 className="hero-title">Bienvenue sur Sentinel</h1>
                <p className="hero-subtitle">
                    Gérez vos serveurs, consultez vos métriques et gardez un œil sur vos logs en toute simplicité.
                </p>
                <div className="hero-actions">
                    <a href="http://82.165.92.40:3000/" className="hero-button primary">
                        📊 Dashboard Grafana
                    </a>
                    <a href="/servers" className="hero-button secondary">
                        🖥️ Gestion des serveurs
                    </a>
                    <a href="/servers/add" className="hero-button success">
                        ➕ Ajouter une nouvelle range
                    </a>
                    <a href="/servers/delete" className="hero-button danger">
                        ❌ Supprimer un serveur
                    </a>
                </div>

                {/* Sous-section */}
                <section className="extra-section">
                    <h2 className="extra-title">Autres outils</h2>
                    <div className="extra-actions">
                        <a href="http://82.165.46.201/" className="hero-button secondary">
                            🛒 Consulter la boutique
                        </a>
                        <a href="http://82.165.44.233/" className="hero-button secondary">
                            ⚙️ Consulter le configurateur
                        </a>
                    </div>
                </section>
            </header>
        </Grid>
    );
};
