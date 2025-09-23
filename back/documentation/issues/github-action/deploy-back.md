# ⚠️ `docker run` échoue dans l’action CI/CD (invalid reference format)

## Contexte

* **Repo** : monorepo Sentinel
* **Workflow** : `Back CI/CD` (GitHub Actions)
* **Étape** : déploiement via `appleboy/ssh-action` → script `docker run` sur le serveur
* **Objectif** : lancer le conteneur backend en passant `DATABASE_URL` et `REDIS_URL`
* **Spécificité récente** : ajout de **Redis** en prod (`redis-prod`, `REDIS_URL=redis://redis-prod:6379`)

## Symptômes observés

* Logs Actions (extrait) :

  ```
  ==> Replace API container
  docker: invalid reference format.
  ```
* `redis-prod` **démarré** (visible via `docker ps`)
* **Backend non lancé** (conteneur absent)

## Cause racine

**Erreur de continuation de ligne en shell** :
dans le script, la ligne avant l’image a un **backslash suivi d’un espace** :

```sh
-e REDIS_URL="$RUNTIME_REDIS_URL" \␠ 
"$IMAGE"
```

En POSIX, le `\` doit être **le dernier caractère** de la ligne pour échapper le **retour à la ligne**.
Avec un espace après `\`, le shell échappe **l’espace**, **pas** le newline → la ligne suivante n’est pas jointe, donc `docker run` est exécuté **sans nom d’image** → `invalid reference format`.

> Variantes qui cassent aussi : `\  # commentaire` en fin de ligne, ou **CRLF** (fin de ligne Windows).

## Reproduction minimale

```sh
docker run \
  -e FOO=bar \␠
  alpine:3
# → docker: invalid reference format.
```

## Correctif

Enlever l’espace (et tout commentaire) après le `\`, ou mettre l’image sur la **même ligne**.

**OK (version multi-lignes) :**

```sh
docker run -d \
  --name "$APP" \
  --restart unless-stopped \
  --network "$NET" \
  -p "${EXTERNAL_PORT}:${INTERNAL_PORT}" \
  -e NODE_ENV=production \
  -e DATABASE_URL="$RUNTIME_DATABASE_URL" \
  -e REDIS_URL="$RUNTIME_REDIS_URL" \
  "$IMAGE"
```

**OK (image sur la même ligne) :**

```sh
-e REDIS_URL="$RUNTIME_REDIS_URL" "$IMAGE"
```

## Vérifications/diagnostic (à ajouter dans le script)

```sh
echo "IMAGE=$IMAGE"
echo "DATABASE_URL=$RUNTIME_DATABASE_URL"
echo "REDIS_URL=$RUNTIME_REDIS_URL"
docker image inspect "$IMAGE" >/dev/null || { echo "image not found"; exit 1; }
```

Et, pour tracer la vraie commande :

```sh
set -x
# docker run ...
set +x
```

## Prévention (checklist)

* [ ] **Pas d’espace** ni de **commentaire** après un `\` (fin de ligne nue).
* [ ] Fichier en **LF**, pas CRLF.
* [ ] Ajouter des **sanity checks** (`IMAGE` non vide, `docker image inspect`).
* [ ] Optionnel : encapsuler les longs arguments avec un **here-doc** (évite les `\`) :

  ```sh
  docker run -d $(cat <<'ARGS'
  --name "$APP"
  --restart unless-stopped
  --network "$NET"
  -p "${EXTERNAL_PORT}:${INTERNAL_PORT}"
  -e NODE_ENV=production
  -e DATABASE_URL="$RUNTIME_DATABASE_URL"
  -e REDIS_URL="$RUNTIME_REDIS_URL"
  ARGS
  ) "$IMAGE"
  ```
* [ ] Paramétrer l’éditeur pour **trim trailing spaces** et forcer **LF**.
* [ ] En PR, faire un **diff “Invisibles/Whitespace”** (ex: `git diff --check`).

## Acceptance Criteria

* Le job **déploie** le back : conteneur `sentinel-back` **présent** et **UP**.
* `docker logs sentinel-back` ne contient pas d’erreur de démarrage.
* Le healthcheck `/health` **OK** dans les logs Actions.
* `REDIS_URL` et `DATABASE_URL` injectés et visibles dans les logs de démarrage.

## Notes liées au contexte Redis

* Le workflow crée/attend `redis-prod` puis passe `REDIS_URL=redis://redis-prod:6379`.
* Si auth Redis activée, utiliser `redis-server --requirepass` + `REDIS_URL=redis://:PASS@redis-prod:6379`.

---

**TL;DR** : un **espace** après un `\` empêche la continuation de ligne, ce qui retire l’**image** de la commande `docker run`. Supprimer l’espace (ou mettre l’image sur la même ligne) résout l’erreur.