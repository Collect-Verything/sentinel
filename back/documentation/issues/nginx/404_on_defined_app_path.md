# 📄 Nginx + React/Vite (SPA) : Erreur 404 sur les routes front (`/servers`, `/add-servers`)

## 1. Contexte

En production, après déploiement du frontend via Nginx, les routes React comme `/servers` et `/add-servers` renvoyaient **404 Not Found**.
La page d’accueil (`/`) fonctionnait correctement, mais pas les autres routes quand on rechargeait directement l’URL dans le navigateur.

## 2. Symptôme

* `http://IP/` → OK
* `http://IP/servers` → 404
* `http://IP/add-servers` → 404

Dans les logs Nginx (`docker logs sentinel-front-app`), on voyait des 404 pour des fichiers inexistants (`/servers`, `/add-servers`).

## 3. Cause profonde

Une application React/Vite est une **Single Page Application (SPA)**.

* Le **router** (React Router) gère la navigation côté client.
* Nginx, lui, sert uniquement des fichiers statiques (HTML, JS, CSS).
* Quand on accède directement à `/servers`, Nginx cherche un dossier/fichier `/usr/share/nginx/html/servers` → inexistant → **404**.

➡️ La config Nginx n’avait pas de **fallback vers `index.html`** pour les routes inconnues.

## 4. Solution appliquée

Ajout d’un bloc `location /` avec un `try_files` :

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Explication :

* `$uri` = chemin demandé.
* `$uri/` = dossier demandé.
* `/index.html` = fallback si rien trouvé.

Ainsi, toutes les routes front retombent sur `index.html`, que React Router interprète.

## 5. Objectif et ce que ça résout

* Permet de **recharger n’importe quelle URL front** (ex : `/servers`) sans 404.
* Évite que Nginx considère les routes applicatives comme des fichiers manquants.
* Conserve le comportement attendu d’une SPA.

## 6. Prévention pour la prochaine fois

* Toujours inclure le bloc fallback `try_files ... /index.html;` dans la config Nginx d’une SPA.
* Vérifier avec un `curl` direct sur une route non racine avant de valider le déploiement.
* Garder en tête la différence entre **routes front (SPA)** et **endpoints API** :

    * Routes front doivent retomber sur `index.html`.
    * Routes API doivent être proxyfiées vers le backend (ex: `/api/` → NestJS).

## 7. Checklist rapide

1. Tester `/` et une route interne (`/servers`) après déploiement.
2. Si 404 → vérifier si `try_files` est bien dans `nginx.conf`.
3. Corriger avec :

   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
4. Rebuild l’image et redéployer.
5. Vérifier via `curl -I http://IP/servers` que le statut est **200**.
