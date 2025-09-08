import './App.css';
import {Grid} from "@mui/material";
import {LINKS} from "../../app/links.ts";

export const Home = () => {
    return (
        <Grid mt={10} className="home-container">
            <header className="hero" >
                <h1 className="hero-title">Bienvenue sur Sentinel</h1>
                <p className="hero-subtitle">
                    Gérez vos serveurs, consultez vos métriques et gardez un œil sur vos logs en toute simplicité.
                </p>
                <div className="hero-actions">
                    <a href={LINKS.DASHBOARD} className="hero-button primary">
                        📊 Dashboard Grafana
                    </a>
                    <a href={LINKS.SERVERS} className="hero-button secondary">
                        🖥️ Gestion des serveurs
                    </a>
                    <a href={LINKS.ADD_SERVERS} className="hero-button success">
                        ➕ Ajouter une nouvelle range
                    </a>
                    <a href="/delete-servers" className="hero-button danger">
                        ❌ Supprimer un serveur
                    </a>
                </div>

                {/* Sous-section */}
                <section className="extra-section">
                    <h2 className="extra-title">Autres outils</h2>
                    <div className="extra-actions">
                        <a href={LINKS.CONFIGURATOR} className="hero-button secondary">
                            🛒 Consulter la boutique
                        </a>
                        <a href={LINKS.SHOP} className="hero-button secondary">
                            ⚙️ Consulter le configurateur
                        </a>
                    </div>
                </section>
            </header>
        </Grid>
    );
};
