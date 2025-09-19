# Migration

Apres modification d'un modele en locel pour test et avoir la lib a jour :

```bash
npx prisma migrate dev --name "server_ansible_tweaks"
npx prisma generate
```

Donc penser a modifier en seed sinecessaire ::

```bash
npm run seed  # seed:prod si ... prod mais aucune raison
```


Le plus simple (et rapide) pour **mettre à jour ton conteneur dev du back après une modif de modèles Prisma** :

### Cas standard (conteneurs déjà lancés)

```bash
# 1) Appliquer la migration dans le conteneur
docker compose --profile dev exec back-dev npx prisma migrate dev --name "model_update"

# 2) Régénérer le client Prisma
docker compose --profile dev exec back-dev npx prisma generate

# 3) (optionnel) Reseed si tu as besoin de données de démo
docker compose --profile dev exec back-dev npm run seed
```

> Nest démarre en `start:debug` chez toi, donc pas besoin de rebuild d’image : le volume `./back:/back` expose déjà tes derniers fichiers.
> Si l’app ne reprend pas bien (rare), fais un restart :
> `docker compose --profile dev restart back-dev`

### Si le service n’est pas démarré

```bash
docker compose --profile dev up -d mysql-sentinel back-dev
```

Puis enchaîne avec les commandes `migrate` / `generate` ci-dessus.

### Quand faut-il rebuild l’image ?

* **Seulement** si tu as modifié le **Dockerfile.dev** ou les **dépendances** (`package.json`/`lock`).
  Dans ce cas :

  ```bash
  docker compose --profile dev build back-dev
  docker compose --profile dev up -d back-dev
  # puis migrate/generate si nécessaire
  ```

### One-liner pratique (tout-en-un)

```bash
docker compose --profile dev exec back-dev sh -lc \
'npx prisma migrate dev --name "model_update" && npx prisma generate && npm run seed || true'
```

Si tu veux, on peut ajouter une **commande npm** “dev\:db” dans le back pour tout enchaîner proprement depuis un seul `exec`.
