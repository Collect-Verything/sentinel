Docker cleaning

```shell


# Liste rapide des noms
docker ps --format '{{.Names}}'

# Supprime ceux lancés hors compose si présents
docker rm -f node_exporter || true
docker rm -f loki || true
docker rm -f prometheus || true
docker rm -f grafana || true


# Clean all container and childrens

# 1) arrêter et supprimer la stack Compose (avec volumes du projet)
docker compose down --volumes --remove-orphans

# 2) supprimer les conteneurs lancés "à la main" (ex: node_exporter hors compose)
docker rm -f node_exporter 2>/dev/null || true
docker rm -f loki 2>/dev/null || true
docker rm -f prometheus 2>/dev/null || true
docker rm -f grafana 2>/dev/null || true

# 3) supprimer le réseau du projet si présent
docker network rm sentinel_default 2>/dev/null || true

# 4) (optionnel) supprimer les volumes nommés “sentinel_*”
docker volume ls --format '{{.Name}}' | grep '^sentinel_' | xargs -r docker volume rm
```


