## Roadmap CI/CD Sentinel

1. **Connexion SSH**

    * Configurer l’accès via **clé SSH** (sécurisé et automatique).
    * Prévoir un fallback *manuel* avec mot de passe seulement en cas d’urgence (non recommandé).

2. **Mise à jour de la VM**

    * `apt-get update && apt-get upgrade -y`
    * Installer les paquets utiles de base (`curl`, `git`, `unzip`, etc.).

3. **Installation de Docker & Compose v2**

    * Installer **Docker Engine** (paquets officiels Docker).
    * Vérifier que la commande `docker compose version` renvoie bien une version récente (>= 2.x).

4. **Gestion des secrets & variables**

    * Stocker toutes les infos sensibles dans les **secrets GitHub Actions** (mots de passe, clés SMTP, tokens…).
    * Injecter ces valeurs en variables d’environnement **au moment du workflow** (pas dans le repo).

5. **Déploiement des fichiers de config Sentinel**

    * Copier le contenu du répertoire `sentinel/` (compose.yaml, configs Grafana, Prometheus, Loki, Fluent Bit…)
      → dans `/root/sentinel` (ou un autre dossier cible sur le serveur).
    * Utiliser `rsync` ou `scp` pour la copie depuis GitHub Actions.

6. **Redémarrage de la stack**

    * Se placer dans `/root/sentinel`.
    * Exécuter :

      ```bash
      docker compose down
      docker compose up -d --remove-orphans
      ```
    * Vérifier que tous les conteneurs sont up avec `docker ps`.

7. **Post-déploiement (optionnel mais recommandé)**

    * Vérifier la santé des services (`curl http://localhost:3000`, `curl http://localhost:9090/ready`, etc.).
    * Ajouter une étape de **notification** (Slack, mail, GitHub status) si le déploiement réussit ou échoue.
