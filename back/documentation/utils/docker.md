## Npm Install

### Prod dépendances :

```bash
docker compose --profile dev exec <NOM_DU_SERVICE> npm install <LA_LIB>
```

### Dev dépendances :

```bash
docker compose --profile dev exec <NOM_DU_SERVICE> npm install -D <@LA/LIB>
```
👉 Attention à mentionner le nom des services spécifiés dans le docker-compose.yaml, et non ceux affichés par docker ps.

---

# Relancer conteneur en local :

Si changement particulier pas pris en compte par le hot reload comme un changement dans main.ts ou ce genre de chose

```bash
docker compose --profile dev restart back-dev
``` 
(rapide)


```
docker compose --profile dev stop back-dev
docker compose --profile dev up -d back-dev
```
⚡ Plus rapide que --build car ça ne reconstruit pas l’image, il reprend l’image déjà buildée.

ou

```bash
docker compose --profile dev up -d --build back-dev
```
(Trop long)
