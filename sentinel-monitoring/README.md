<p align="center">
  <a href="https://www.youtube.com/watch?v=67EG3-3Kw6o" target="blank"><img src="../pic/img_3.png" width="420" alt="Sentinel Logo" /></a href="https://www.youtube.com/watch?v=67EG3-3Kw6o" target="blank">
</p>


---

# 🛰️ Sentinel Monitoring

**Pile d’observabilité** prête à l’emploi : **Prometheus** (métriques), **Grafana** (dashboards & alerting), **Loki** (logs), **Node Exporter** (métriques système).
Provisioning automatique de Grafana (datasources, dashboards, alertes).

> ℹ️ Pour relier ces paramètres à l’application produit, **ne pas oublier** de consulter le dépôt **Produit_Cms_Ui** (GitHub *Collect Verything*).

---

## 📦 Contenu

* **Docker Compose** : services **prometheus**, **grafana**, **loki**, **node\_exporter** et volumes persistants. Les mots de passe SMTP sont injectés via secrets/variables d’env.&#x20;
* **Prometheus** : découvre **Prometheus lui-même** et deux cibles **Node Exporter** (`sentinel-node`, `product-node`).&#x20;
* **Grafana – provisioning** :

    * **Datasources** : Prometheus (par défaut) et Loki.&#x20;
    * **Dashboards** : import auto depuis `grafana/dashboards` (Node Exporter 1860, logs produit, etc.).&#x20;
    * **Alerting** : contact par e-mail + policies de regroupement.
    * **Règles Nginx** : alerte “>20 requêtes en 10s” (exemple).&#x20;
* **Dashboards fournis** :

    * **Node Exporter Full (1860)** – surveillance complète CPU/RAM/Disk/Network.&#x20;
    * **Product Logs** – widgets basés sur **Loki** (compte requêtes, 500/404, etc.).&#x20;

---

## 🚀 Démarrage

### 1) Prérequis

* Docker & Docker Compose installés.
* Secret `GF_SMTP_PASSWORD` disponible (SMTP Gmail dans l’exemple Compose).&#x20;

### 2) Lancer la stack

```bash
# depuis sentinel-monitoring/
docker compose up -d
```

* **Grafana** : [http://localhost:3000](http://localhost:3000) (admin / admin par défaut dans l’exemple)&#x20;
* **Prometheus** : [http://localhost:9090](http://localhost:9090)&#x20;
* **Loki (ready)** : [http://localhost:3100/ready](http://localhost:3100/ready)&#x20;
* **Node Exporter** : écoute en **host mode** sur :9100.&#x20;

> Les dashboards/datasources/alertes sont **provisionnés automatiquement** au démarrage (fichiers `provisioning/…`).

### 3) Cibles Prometheus

Les targets sont définies dans `prometheus.yml` (ex. `sentinel-node`, `product-node`) ; adaptez les IPs/ports selon vos hôtes.&#x20;

---

## 🔧 Fichiers clés

* `docker-compose.yml` – orchestration, ports, volumes, SMTP Grafana.&#x20;
* `prometheus.yml` – jobs/targets (Prometheus & Node Exporter).&#x20;
* `grafana/provisioning/datasources/datasource.yml` – Prometheus/Loki via service name.&#x20;
* `grafana/provisioning/dashboards/dashboard.yml` – auto-import des dashboards.&#x20;
* `grafana/dashboards/node-exporter-full-1860.json` – dashboard système complet.&#x20;
* `grafana/dashboards/product-logs.json` – vues logs applicatifs (Loki).&#x20;
* `grafana/provisioning/alerting/contact-points.yml` & `notification-policies.yml` – email & policies.
* `grafana/provisioning/alerting/rules/nginx-requests.yml` – règle Nginx (DoS/rafale).&#x20;

---

## ✅ Bonnes pratiques

* Stocker `GF_SMTP_PASSWORD` en **secret** (Actions/Env), ne pas le commiter.&#x20;
* Ajuster la **rétention Prometheus** selon vos besoins (paramètre `--storage.tsdb.retention.time`).&#x20;
* Utiliser des **labels/uid** explicites pour les règles d’alerting (facilitent le tri/filtrage).&#x20;

---

## 🧭 Accès rapides

* **Grafana** (dashboards + alertes) : [http://localhost:3000](http://localhost:3000)
* **Prometheus** (targets/queries) : [http://localhost:9090](http://localhost:9090)
* **Loki** (API) : [http://localhost:3100](http://localhost:3100)
* **Node Exporter** (host) : [http://localhost:9100](http://localhost:9100)

---
