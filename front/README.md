# 🚀 Frontend (React + Vite)

Ce dossier contient l’application **frontend** du projet Sentinel.
Elle est basée sur **React (Vite + TypeScript)** et peut être exécutée dans deux environnements :

* **Développement** : hot reload, montage du code source dans le container.
* **Production** : build statique servi par **Nginx**.

---

## 📂 Fichiers principaux

* **`Dockerfile`**
  Utilisé pour la **production**.

    * Étape 1 : build de l’application avec Node.js.
    * Étape 2 : copie des fichiers générés (`dist/`) dans un container **Nginx**.
    * Sert l’application sur le port **80**.

* **`Dockerfile.dev`**
  Utilisé pour le **développement**.

    * Lance `npm run dev` (Vite) à l’intérieur du container.
    * Monte le code source local pour profiter du hot reload.
    * Expose le port **5173**.

* **`docker-compose.yml`**
  Fournit deux services :

    * `client-dev` → environnement développement.
    * `client` → environnement production.

---

## 🛠️ Lancer l’environnement développement

Exécuter l’application avec Vite en mode dev (hot reload accessible depuis le navigateur) :

```bash
docker compose up client-dev
```

👉 L’application est disponible sur [http://localhost:5173](http://localhost:5173).

* Les fichiers du dossier courant sont montés dans le container.
* Toute modification est automatiquement reflétée dans le navigateur.
* Utile pour le développement et les tests rapides.

---

## 📦 Lancer l’environnement production

Construire et exécuter l’application en mode production (build statique servi par Nginx) :

```bash
docker compose up --build client
```

👉 L’application est disponible sur [http://localhost](http://localhost).

* Le code est compilé (`npm run build`).
* Le résultat est copié dans un container **Nginx** optimisé.
* C’est l’environnement cible pour la mise en production.
