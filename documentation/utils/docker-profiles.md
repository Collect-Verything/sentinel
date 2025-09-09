# 🎯 Objectif

Gérer **dev** et **prod** dans **un seul** `docker-compose.yml` grâce aux `profiles`, et lancer exactement ce dont tu as besoin en **une commande**.

# 🧱 Principe (dans ton contexte)

* `client-dev`, `api-dev`, `db-dev` → `profiles: ["dev"]`
* (plus tard) `client`, `api`, `db` → `profiles: ["prod"]`

Extrait type :

```yaml
services:
  client-dev:
    profiles: ["dev"]
    # ...

  api-dev:
    profiles: ["dev"]
    # ...

  db-dev:
    profiles: ["dev"]
    # ...
```

# ▶️ Commandes utiles

* **Tout le dev (front + API + DB)**
  `docker compose --profile dev up -d`
* **Juste l’API dev**
  `docker compose --profile dev up api-dev`
* **Arrêter ce qui tourne (profil dev)**
  `docker compose --profile dev down`
* **Logs**
  `docker compose logs -f api-dev`
  `docker compose logs -f client-dev`
* **Rebuild un service dev**
  `docker compose --profile dev up -d --build api-dev`

# ✅ Bonnes pratiques

* **Nest en dev** : écouter sur `0.0.0.0:3001`

  ```ts
  await app.listen(3001, '0.0.0.0');
  ```
* **DB dev** : user dédié (évite `root`), healthcheck prêt, port host (ex: `3307:3306`) si besoin.
* **Volumes dev** :

    * code monté (`./front:/app`, `./back:/app`)
    * `node_modules` **non bindé** → utilise un volume anonyme (`/app/node_modules`)
      (évite les conflits d’arch/libc)
* **Isolation réseaux** : `sentinel-front` pour le front, `sentinel-back` pour API/DB.

# 🔜 Pour la prod (quand tu seras prêt)

* Duplique les services en `client`, `api`, `db` avec `profiles: ["prod"]`
* Pas de montages de code, `restart: unless-stopped`, pas d’expo DB publique
* CI/CD qui build/push l’image et déploie (comme pour le front)

C’est tout — compact, efficace, et ça colle à ton workflow actuel.
