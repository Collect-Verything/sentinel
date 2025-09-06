# 📘 Fiche – Prometheus (`prometheus.yml` avec Sentinel & Product)


**AVANT LECTURE, LIRE AVANT-PROPOS DANS :** -> documentation/lire-avant-de-rentrer-dans-la-doc.md

---

## 🎯 Rôle de Prometheus

Prometheus est **le collecteur central de métriques** dans Sentinel.
Il se connecte aux **exporters** (par ex. Node Exporter) déployés sur les serveurs (Sentinel et Product) pour récupérer périodiquement des informations système :

* CPU, mémoire, disque
* Réseau, sockets, IO
* Uptime, load average

👉 Ces métriques alimentent **Grafana** (dashboards) et **Grafana Alerting** (alertes).

---

## 📂 Localisation

Le fichier `prometheus.yml` est dans :

```
sentinel/
├── prometheus.yml   # Config Prometheus
```

Et est monté dans le conteneur Prometheus via `docker-compose.yml`.

---

## 📑 Contenu actuel

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "sentinel-node"
    static_configs:
      - targets: ["82.165.92.40:9100"]

  - job_name: "product-node"
    static_configs:
      - targets: ["82.165.46.201:9100"]
```

---

## 🔍 Explication détaillée

### Bloc `global`

* **`scrape_interval: 15s`**

    * Toutes les 15 secondes, Prometheus interroge ses cibles (`targets`) pour collecter les métriques.
    * ⚖️ Bon compromis entre précision et charge système.

* **`evaluation_interval: 15s`**

    * Toutes les 15 secondes, Prometheus évalue les règles d’alerte (si elles sont définies).
    * Exemple futur : "si CPU > 90% sur Product pendant 5 minutes, déclencher une alerte".

---

### Bloc `scrape_configs`

Chaque bloc définit un **job** (= un groupe de targets homogènes).

#### 1. `job_name: "prometheus"`

* **Cible : `localhost:9090`**
* Rôle : Prometheus se surveille lui-même.
* Utile pour :

    * Vérifier qu’il scrape bien.
    * Avoir un dashboard "Health Prometheus".
    * Détecter s’il est surchargé ou tombe en panne.

👉 C’est de l’**auto-monitoring**.

---

#### 2. `job_name: "sentinel-node"`

* **Cible : `82.165.92.40:9100`** (ton serveur Sentinel).
* Cela correspond au **Node Exporter** qui tourne sur Sentinel.
* Permet de :

    * Monitorer les ressources système du serveur Sentinel (CPU, RAM, disque, réseau).
    * Détecter si Sentinel est saturé ou tombe (important car c’est le serveur de monitoring).
* Futur :

    * Créer une alerte "Sentinel down".
    * Vérifier la santé de l’infra de monitoring elle-même.

---

#### 3. `job_name: "product-node"`

* **Cible : `82.165.46.201:9100`** (ton serveur Product).
* Cela correspond au **Node Exporter** installé sur Product.
* Permet de :

    * Suivre les ressources système du serveur applicatif (où ton produit tourne).
    * Corréler les métriques système avec les logs applicatifs (via Fluent Bit + Loki).
* Futur :

    * Alerte si Product manque de RAM/disque.
    * Dashboard spécifique Product (CPU par process, utilisation mémoire, erreurs réseau).

---

## 📊 Exemple d’utilisation dans Grafana

* Query PromQL pour voir l’utilisation CPU sur Product :

```promql
rate(node_cpu_seconds_total{job="product-node", mode="user"}[5m])
```

* Query PromQL pour voir l’espace disque restant sur Sentinel :

```promql
node_filesystem_avail_bytes{job="sentinel-node"} / node_filesystem_size_bytes{job="sentinel-node"}
```

👉 Ces queries sont utilisées dans les dashboards comme **Node Exporter Full (1860)**.

---

## ⚠️ Problèmes courants

1. **Exporter inaccessible**

    * Si `82.165.46.201:9100` est fermé par firewall → pas de métriques Product.
    * Vérifier avec :

      ```bash
      curl http://82.165.46.201:9100/metrics
      ```

2. **Targets incorrectes**

    * En Docker Compose, utiliser les **noms de service** (`node-exporter:9100`) plutôt qu’une IP directe.
    * Pour des serveurs externes comme Product → OK d’utiliser IP.

3. **Scrape interval trop court**

    * < 15s surcharge la DB et les serveurs.
    * 15–30s recommandé.

---

## 💡 Bonnes pratiques futures

* **Nommer les jobs de manière cohérente**
  Ex : `sentinel-node`, `product-node`, `db-node`, `cache-node`…
* **Groupes d’instances**
  On peut mettre plusieurs targets dans un job, par ex :

  ```yaml
  - job_name: "product-nodes"
    static_configs:
      - targets:
          - "82.165.46.201:9100"
          - "82.165.46.202:9100"
  ```
* **Relabelling**
  Ajouter des labels (`env=prod`, `env=dev`) pour filtrer facilement dans Grafana.
* **Exporter d’applications**
  Plus tard, tu pourras ajouter des exporters spécifiques :

    * MySQL exporter (DB metrics).
    * Nginx exporter (requêtes HTTP).
    * Redis exporter.

---

## 🧭 Résumé

* `prometheus.yml` = **liste des serveurs à surveiller** via Node Exporter.
* Actuellement, tu surveilles :

    * Prometheus lui-même.
    * Sentinel (ton serveur de monitoring).
    * Product (ton serveur applicatif).
* Cela permet déjà :

    * De voir si Product tourne bien.
    * D’avoir des alertes sur Product et Sentinel.
* Futur :

    * Ajouter d’autres services (DB, cache, API…).
    * Créer des règles d’alertes ciblées (ex. Product saturé = mail).
