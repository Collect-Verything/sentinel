<p align="center">
  <a href="https://www.youtube.com/watch?v=guS1Bc6QPGI" target="blank"><img src="pic/img_1.png" width="420" alt="Matrice Logo" /></a href="https://www.youtube.com/watch?v=guS1Bc6QPGI" target="blank">
</p>

# 🚀 Sentinel Front — React (Vite + TS)

**Sentinel Front** est l’interface web d’administration de la plateforme.
Elle permet de piloter l’infra (serveurs, configurations, tâches) et d’accéder à l’observabilité.

---

## 🎯 Fonctionnalités principales

* **Inventaire serveurs**

    * Liste des serveurs **non configurés / configurés / en erreur**.
    * Import (CSV provider) et mise à jour d’état (réservé, configuré, etc.).
    * Actions rapides (détails, historisation d’opérations).

* **Configurations (Ansible)**

    * **Éditeur de configuration** : définir les étapes exécutées par Ansible (variables, chemins, templates).
    * **Persistance** des configurations (création / édition / duplication).
    * Association d’une config à une **collection de serveurs**.

* **Tâches & exécutions**

    * **Panneau “Tâches”** (flottant) présent sur toute l’app.
    * Création de tâches (enqueue), suivi en temps réel (**état, progression**).
    * Historique court, nettoyage, suppression.

* **Observabilité**

    * Liens rapides vers **Grafana / Prometheus / Loki** (dashboards par service).
    * (Option) intégration d’**iframes** / deeplinks vers dashboards.

---

## 🧱 Stack & principes

* **React + Vite + TypeScript**
* **MUI** (AppBar, Dialog, List, Progress…)
* **Context API** pour l’état global des tâches (start / remove / status / panel)
* **CSS** global (dégradé animé) + AppBar **transparente** pour laisser voir le fond

---

## ⚙️ Variables d’environnement

Deux fichiers d’environnement peuvent être utilisés côté **front** (Vite) : un pour le **dev** et un pour la **prod**.

> Rappel : seules les variables préfixées par `VITE_` sont exposées au code client.

### `.env.development` (dev local)

```env
# Hôte du backend en dev
VITE_API_BASE=localhost
```

### `.env.production` (prod)

> En prod, la valeur est **injectée par l’orchestrateur** (Docker / GitHub Actions / Variables).

Exemple dans le workflow :

```yaml
- name: Create .env.production
  working-directory: ./front
  run: |
    echo "VITE_API_BASE=${{ vars.SSH_HOST }}" > .env.production
```

> Pour **simuler la prod en local**, laisse `localhost` ou mets l’IP locale de test.

```env
VITE_API_BASE=localhost
# ou
# VITE_API_BASE=192.168.1.50
```

**Notes**

* Le **schéma/port HTTP** est **codé en dur** côté front pour l’instant (`:3001`).
  Si tu veux le rendre configurable, passe à une URL complète (ex. `VITE_API_BASE=http://host:3001`) et utilise-la telle quelle dans les `fetch()`.


---

## 🏃 Lancer l’app

### A) Dev (Node local)

```bash
cd front
npm i
npm run dev
# → http://localhost:5173
```

### B) Docker Compose (profil dev)

Lancer **uniquement** le front :

```bash
docker compose --profile dev up -d client-dev
docker compose logs -f client-dev
```

*(Pour lancer aussi back + DB + Redis depuis la racine :
`docker compose --profile dev up -d client-dev back-dev mysql-sentinel redis-dev`)*

### C) Build prod (local)

```bash
cd front
npm ci
npm run build
npm run preview
```

> En production, le build est servi par **Nginx** (voir `Dockerfile`).
> Si l’app est servie derrière un sous-chemin (ex. `/admin`), configure `base` côté Vite.

---

## ✅ Conventions & qualité

* **TypeScript strict** pour fiabilité.
* **MUI** : composants accessibles et responsives.
* **UX tâches** : progression **déterministe** si `progress` serveur dispo, sinon estimation locale.
* **ESLint / Prettier** : formattage et règles de base (scripts `lint` si présents).
