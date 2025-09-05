# 📓 Fiche – Migration Docker Compose V1 → V2

## 🔹 1. Le problème rencontré

Sur ton serveur **Sentinel**, tu avais initialement utilisé la commande :

```bash
docker-compose restart grafana
```

Mais :

* Tu obtenais des erreurs du type :

  ```
  ERROR: No containers to restart
  ```
* Ou encore :

  ```
  ERROR: 1
  ```
* Et parfois des conflits entre les conteneurs (`name already in use`).

👉 En fait, il y avait une confusion entre **Docker Compose V1** (binaire `docker-compose`) et **Docker Compose V2** (plugin intégré à Docker : `docker compose`).

---

## 🔹 2. Pourquoi ce problème ?

* **Docker Compose V1** :

    * Était installé comme un **binaire indépendant** (`/usr/local/bin/docker-compose`).
    * Aujourd’hui **déprécié** (fin de vie depuis juin 2023).
    * Certaines commandes ne sont plus supportées avec Docker Engine récent.

* **Docker Compose V2** :

    * Est livré comme **plugin natif** de Docker (`docker compose …`).
    * Compatible avec toutes les dernières versions de Docker Engine.
    * Supporte les nouvelles syntaxes (ex: `version` dans `compose.yml` est obsolète).

---

## 🔹 3. Comment on a résolu ?

On est passé de :

❌ Ancienne syntaxe V1 :

```bash
docker-compose up -d
docker-compose restart grafana
```

✅ Nouvelle syntaxe V2 :

```bash
docker compose up -d
docker compose restart grafana
```

Résultat :

* Plus d’erreurs de compatibilité.
* Les services ont bien redémarré (Grafana, Prometheus, Loki, Node Exporter).
* On s’aligne avec la **nouvelle norme Docker** (tout le monde migre en V2).

---

## 🔹 4. Impact sur notre workflow Sentinel

* Nos fichiers `docker-compose.yml` continuent de fonctionner **sans modification majeure**.
* On doit juste :

    * Retirer la ligne `version: "3"` → car obsolète.
    * Utiliser toujours la syntaxe `docker compose …`.

---

## ✅ Résumé

* Le problème venait de l’utilisation de **Docker Compose V1** → obsolète, plus maintenu.
* Passage en **V2** (plugin intégré à Docker) → règle les erreurs et garantit la compatibilité future.
* Changement concret :

    * Utiliser `docker compose` au lieu de `docker-compose`.
    * Nettoyer les vieux conteneurs/volumes si nécessaire.
