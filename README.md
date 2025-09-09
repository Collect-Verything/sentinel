# Sentinel – Monitoring & Alerting Stack

## 📌 Introduction

**Sentinel** est une stack de monitoring et de logging basée sur **Prometheus**, **Grafana**, **Loki**, **Node Exporter** et **Fluent Bit**.
Elle permet de :

* Collecter et visualiser les métriques système et applicatives.
* Centraliser et explorer les logs (système, conteneurs Docker, Nginx, etc.).
* Définir des règles d’alertes personnalisées (ex. détection brute force SSH, 20 requêtes en 10s sur Nginx…).
* Être notifié automatiquement par email via Grafana Alerting.
* Déployer et maintenir la stack de manière **automatisée et versionnée** grâce à GitHub Actions.

---

## 🏗️ Architecture

La stack se compose des services suivants :

* **Prometheus** → collecte des métriques depuis Node Exporter et autres endpoints.
* **Node Exporter** → export des métriques système (CPU, mémoire, disque, réseau…).
* **Loki** → stockage et indexation des logs.
* **Fluent Bit** → agent de collecte qui envoie les logs système et conteneurs vers Loki.
* **Grafana** → visualisation (dashboards), alertes et notifications (SMTP).

---

## 📂 Arborescence du projet

```bash
sentinel/
├── .github/
│   └── workflows/                 # Workflows CI/CD GitHub Actions
├── documentation/                 # Documentation technique
├── sentinel/                      # Configuration principale
│   ├── docker-compose.yml         # Docker Compose principal
│   ├── prometheus.yml             # Config Prometheus
│   ├── grafana/
│   │   ├── dashboards/            # Dashboards Grafana
│   │   │   ├── node-exporter-full-1860.json
│   │   │   ├── products-logs.json
│   │   └── provisioning/          # Provisioning Grafana
│   │       ├── dashboards/        # Auto-import des dashboards
│   │       │   └── dashboard.yml
│   │       ├── datasources/       # Sources de données
│   │       │   └── datasource.yml
│   │       ├── alerting/          # Alerting Grafana
│   │       │   ├── contact-points.yml
│   │       │   ├── notification-policies.yml
│   │       │   └── rules/
│   │       │       └── nginx-rules.yml
```

---

## ⚙️ Déploiement manuel (local ou serveur)

1. **Cloner le repo**

```bash
git clone git@github.com:Collect-Verything/sentinel.git
cd sentinel
```

2. **Lancer la stack**

```bash
docker compose up -d
```

3. **Services disponibles**

* Prometheus → [http://localhost:9090](http://localhost:9090)
* Grafana → [http://localhost:3000](http://localhost:3000) (admin / password)
* Loki API → [http://localhost:3100](http://localhost:3100/ready)
* Node Exporter → [http://localhost:9100](http://localhost:9100)

---

## 🤖 CI/CD (GitHub Actions)

Le projet est entièrement **versionné et automatisé**.

### 🔑 Secrets & Variables utilisés

* `SSH_HOST` → IP du serveur Sentinel // Secrets and variables-> Actions -> Variables -> Repository Variables
* `SSH_USER` → utilisateur (root ou ansible) // Secrets and variables-> Actions -> Variables -> Repository Variables
* `SSH_PASSWORD` ou `SSH_PRIVATE_KEY` → credentials pour SSH // Secrets and variables-> Actions -> Secrets -> Repository Secrets
* `GF_SMTP_PASSWORD` → mot de passe SMTP pour Grafana // Secrets and variables-> Actions -> Secrets -> Repository Secrets

### 🚀 Pipeline

1. Déclenchement **automatique** sur modification du dossier `sentinel/`
2. **Connexion SSH** au serveur
3. **Synchronisation des fichiers** du repo vers `/root/sentinel` avec `rsync`
4. **Relance des conteneurs** avec `docker compose up -d`
5. **Healthcheck automatique** des services (`/ready` endpoints)

---

## 📊 Dashboards & Alertes

### Dashboards par défaut

* **Node Exporter Full (1860)** → monitoring serveur complet (CPU, RAM, disque, réseau)
* **Logs Nginx** → requêtes, erreurs 404/500, top endpoints
* **Logs système** → auth.log (tentatives SSH), syslog

### Alerting

* Exemple : **détection DDoS** → +20 requêtes en 10s sur Nginx
* Exemple : **SSH bruteforce** → alertes sur `Failed password`
* Notifications envoyées par **SMTP Gmail** → `collectverythings@gmail.com`

---

## 🔐 Sécurité & Bonnes pratiques

* Secrets sensibles (SMTP, password Grafana, clés SSH) stockés dans **GitHub Secrets**.
* Pas de credentials en clair dans `compose.yaml`.
* Possibilité de renforcer la sécurité serveur :

    * 🔑 Auth SSH par clé uniquement
    * 🔒 Interdiction du login root
    * 🚫 Fail2ban activé

---

## 🚀 Lancer App en mode dév

Le projet utilise les **profiles** de Docker Compose pour isoler les environnements.
En **mode dev**, on démarre le front, l’API NestJS et la base MySQL en une seule commande :

```bash
docker compose --profile dev up -d
```

### 📂 Services inclus

* `client-dev` → Front React (Vite) sur [http://localhost:5173](http://localhost:5173)
* `api-dev` → API NestJS sur [http://localhost:3001](http://localhost:3001)
* `db-dev` → MySQL (user/pass définis dans `docker-compose.yml`), accessible aussi en local sur `localhost:3307`

### 🔧 Commandes utiles

* Arrêter l’environnement dev :

  ```bash
  docker compose --profile dev down
  ```
* Suivre les logs de l’API :

  ```bash
  docker compose logs -f api-dev
  ```
* Rebuild + relancer l’API :

  ```bash
  docker compose --profile dev up -d --build api-dev
  ```

---


## 🛠️ Roadmap

* [x] Mise en place stack Docker Compose
* [x] Dashboards Grafana + alertes
* [x] CI/CD automatique via GitHub Actions
* [ ] Sécurisation avancée du serveur (SSH clé + Fail2ban)
* [ ] Ajout Ansible pour initialisation et scaling de serveurs clients
* [ ] UI (React + NestJS) pour gérer les plages d’IP et orchestrer les déploiements

