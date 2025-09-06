## 📖 Avant-propos

Pour bien comprendre la configuration Prometheus côté **Sentinel**, il est essentiel de garder en tête que la collecte des métriques dépend directement de la configuration en place sur les serveurs surveillés — en particulier le serveur **Product**.

Dans le repo `Collect-Verything/Products-Cms-Ui`, un dossier `deploy/` est présent à la racine du projet.
Ce dossier contient les fichiers de configuration nécessaires au déploiement de services comme :

* **Node Exporter** → pour exposer les métriques système (CPU, RAM, disque, réseau…) sur `:9100`.
* **Fluent Bit** → pour collecter et rediriger les logs vers Loki.

👉 Ces composants sont **alignés avec la configuration Sentinel** :

* Prometheus, dans `sentinel/prometheus.yml`, va chercher les métriques exposées par **Node Exporter** sur Product.
* Loki, configuré via Fluent Bit, recevra les logs envoyés par Product selon la même logique.

Ainsi, la supervision complète repose sur **deux côtés synchronisés** :

* La configuration **Sentinel** (monitoring centralisé).
* La configuration **Product** (exporters & agents déployés localement).
