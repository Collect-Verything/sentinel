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

Aucune n’est nécessaire **pour le moment** côté front.

> Optionnel (si besoin plus tard) :
>
> ```env
> VITE_API_BASE_URL=http://localhost:3001
> VITE_GRAFANA_URL=http://localhost:3000
> VITE_PROMETHEUS_URL=http://localhost:9090
> VITE_LOKI_URL=http://localhost:3100
> ```
>
> (Injectées via `.env.local` en dev ou par l’orchestrateur en prod.)

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
