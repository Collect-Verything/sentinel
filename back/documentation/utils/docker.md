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