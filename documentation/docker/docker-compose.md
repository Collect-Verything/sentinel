
# Fiche – `docker-compose.yml` (stack Sentinel : Prometheus, Node Exporter, Loki, Grafana)

## Vue d’ensemble

* **Prometheus** : scrappe des métriques (node\_exporter, Prometheus lui-même, etc.)
* **node\_exporter** : expose les métriques système de la machine (CPU, RAM, disques…)
* **Loki** : stock et sert les logs (ingestion via Fluent Bit côté *Product* ; requêtes depuis Grafana)
* **Grafana** : UI de visualisation (métriques Prometheus + logs Loki), **auto-provisionnée** via fichiers (cf. fiches `dashboard.yml` et `datasource.yml`)

Flux simplifié :

```
node_exporter  ──>  Prometheus  ───>  Grafana (Prometheus DS)
Fluent Bit(*)  ──>  Loki        ───>  Grafana (Loki DS)
```

(\*) Fluent Bit tourne sur *Product* et envoie vers `http://<Sentinel_IP>:3100`

---

## Le fichier, expliqué **ligne par ligne**

```yaml
services:
```

Racine des services Docker de la stack.

---

### Service `prometheus`

```yaml
  prometheus:
    image: prom/prometheus
    container_name: prometheus
```

* Image officielle Prometheus
* Nom de conteneur stable (pratique pour logs & commandes `docker`)

```yaml
    command:
      - --config.file=/etc/prometheus/prometheus.yml (checker doc cmd-conf-prom.md )
      - --storage.tsdb.retention.time=15d
```

* On fixe le **fichier de conf** (bindé plus bas)
* Rétention des séries temporelles : **15 jours** (adapter selon disque/usage)

```yaml
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prom_data:/prometheus   (check doc prom-data.md)
```

* **Bind-mount** du fichier de configuration *du repo* → dans le conteneur (en **lecture seule**)
* **Volume nommé** `prom_data` pour les données TSDB (`/prometheus`)

  > ⚠️ Les données persistent entre redémarrages. Pour repartir propre : supprimer ce volume.

```yaml
    ports:
      - "9090:9090"
```

* Expose l’UI et l’API de Prometheus sur l’hôte (http\://<sentinel>:9090)

```yaml
    restart: unless-stopped
```

* Redémarre automatiquement sauf si tu l’as stoppé manuellement.

**Lien fiches précédentes :**
Prometheus sera référencé dans `grafana/provisioning/datasources/datasource.yml` par :

```yaml
- name: Prometheus
  type: prometheus
  url: http://prometheus:9090
```

Les **dashboards provisionnés** doivent utiliser `"datasource": "Prometheus"` (pas d’UID).

---

### Service `node_exporter`

```yaml
  node_exporter:
    image: prom/node-exporter:latest
    container_name: node_exporter
    restart: unless-stopped
```

* Expose les métriques système de **la machine Sentinel**.

```yaml
    network_mode: host
    pid: host
```

* **network\_mode: host** : écoute directement sur l’hôte (pas de NAT) → port `:9100` disponible depuis l’hôte
* **pid: host** : permet à node\_exporter de lire certaines infos kernel/process si nécessaire

```yaml
    volumes:
      - /:/host:ro,rslave
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
```

* Monte parts du **filesystem de l’hôte** en lecture seule, sous `/host`, `/host/proc`, `/host/sys`
  → node\_exporter peut collecter les métriques de l’hôte, pas du conteneur. (checker rappel archi-server.md)

```yaml
    command:
      - '--path.rootfs=/host'
      - '--web.listen-address=:9100'
```

* Indique à node\_exporter de considérer `/host` comme racine (pour lire les bons chemins)
* Écoute sur le port **9100** (via `network_mode: host`)

  > **Prometheus** doit scrapper `sentinel:9100` (ou `82.165.92.40:9100`) dans `prometheus.yml`.

**Pourquoi ce choix ?**

* `network_mode: host` simplifie l’accès au port 9100 depuis Prometheus et depuis l’extérieur.
* Montages `/host`, `/host/proc`, `/host/sys` sont le standard pour des métriques **de l’hôte** (et non du conteneur).

---

### Service `loki`

```yaml
  loki:
    image: grafana/loki:latest
    container_name: loki
    command: -config.file=/etc/loki/local-config.yaml
```

* Image officielle Loki, configuration “local” par défaut dans l’image

  > Pour une conf personnalisée, bind-mounte ton propre `loki-config.yaml` vers `/etc/loki/loki-config.yaml` et adapte `command:`.

```yaml
    ports:
      - "3100:3100"
```

* Expose l’API Loki (http\://<sentinel>:3100)
  → Fluent Bit (sur *Product*) enverra les logs vers `http://<sentinel>:3100/loki/api/v1/push`

**Lien fiches précédentes :**
Dans `grafana/provisioning/datasources/datasource.yml`, Loki est :

```yaml
- name: Loki
  type: loki
  url: http://loki:3100
```

Les **dashboards logs** doivent utiliser `"datasource": "Loki"`.

---

### Service `grafana`

```yaml
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
```

* UI de visualisation (métriques + logs)

```yaml
    ports:
      - "3000:3000"
```

* Expose l’UI Grafana (http\://<sentinel>:3000)

```yaml
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_SMTP_ENABLED=true
      - GF_SMTP_HOST=smtp.gmail.com:587
      - GF_SMTP_USER=collectverythings@gmail.com
      - GF_SMTP_PASSWORD=xxxxxxxxxxxxxxxx
      - GF_SMTP_SKIP_VERIFY=true
      - GF_SMTP_FROM_ADDRESS=collectverythings@gmail.com
      - GF_SMTP_FROM_NAME=Grafana
```

* Paramètres **initiaux** (admin, SMTP pour alerting/mail, etc.)

  > **Sécurité :** passe ces secrets via variables d’environnement non versionnées (env-file) ou Docker secrets. Évite de committer les mots de passe.

```yaml
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
```

* **`grafana_data`** : volume persistant pour la base intégrée (dashboards créés/édités via UI, users, alert rules, etc.)
* **Provisioning** :

    * `/etc/grafana/provisioning` : **datasource.yml** + **dashboard.yml** (fiches précédentes)
    * `/var/lib/grafana/dashboards` : **tes JSON versionnés** de dashboards à charger automatiquement

  > C’est **le cœur** de ton approche “as-code” côté UI : pas d’import manuel.

```yaml
    depends_on:
      - prometheus
```

* Démarre Grafana **après** Prometheus (confort). Loki peut démarrer en parallèle.

```yaml
    restart: unless-stopped
```

---

### Volumes nommés

```yaml
volumes:
  prom_data:
  grafana_data:
```

* **prom\_data** : TSDB Prometheus (métriques persistantes)
* **grafana\_data** : base & données Grafana (users, annotations, règles d’alerting, dashboards créés via UI, etc.)

> **Conseil versionning :**
>
> * Versionne **les fichiers de provisioning** et **les dashboards JSON**.
> * **Ne** versionne **pas** le contenu de `grafana_data` (volume Docker).
> * Si tu dois recréer la stack ailleurs, le provisioning rechargera les dashboards/datasources **à l’identique**.

---

## Commandes utiles (opérations courantes)

### Démarrer / (re)créer

```bash
docker compose up -d
```

### Redémarrer un service (ex. Grafana après modif provisioning)

```bash
docker compose restart grafana
```

### Voir l’état

```bash
docker ps
docker compose ps
```

### Logs

```bash
docker logs -f prometheus
docker logs -f loki
docker logs --since=3m grafana | grep -i -E 'provision|dashboard|datasource|error|warn'
```

### Nettoyage (⚠️ supprime les données persistantes)

```bash
docker compose down -v   # stop + remove containers + networks + volumes
```

---

## Sanity checks (rapides)

* **Prometheus prêt**

  ```bash
  curl -fsS http://localhost:9090/-/ready && echo OK
  ```
* **Targets scrappées**

  ```bash
  curl -s "http://localhost:9090/api/v1/targets?state=any" | jq '.data.activeTargets[].labels.job'
  ```
* **Loki prêt**

  ```bash
  curl -fsS http://localhost:3100/ready && echo OK
  ```
* **Grafana voit bien les datasources**

  ```bash
  curl -s -u admin:admin http://localhost:3000/api/datasources \
   | jq -r '.[] | [.name,.type,.url] | @tsv'
  # Attendu:
  # Prometheus  prometheus  http://prometheus:9090
  # Loki        loki        http://loki:3100
  ```

---

## Rappels provisioning (fiches associées)

* **`grafana/provisioning/datasources/datasource.yml`**
  Crée “Prometheus” et “Loki” (noms **référencés** par les dashboards).
* **`grafana/provisioning/dashboards/dashboard.yml`**
  Dit à Grafana **où** charger les JSON (ex. `/var/lib/grafana/dashboards`).
* **Dashboards JSON**
  Nettoyés pour provisioning : `id=null`, `uid` stable, **`"datasource": "Prometheus"` / `"Loki"`**, pas de `__inputs`, templating & annotations corrigés.

---

## Sécurité / Prod – recommandations

* **Mots de passe/SMTP** : via **env-file** non commitée (ou Vault, ou secrets Docker).
* **Grafana admin** : change `GF_SECURITY_ADMIN_PASSWORD`.
* **Accès externes** : si Grafana/Prometheus publics, mets un reverse-proxy avec auth/TLS.
* **Rétentions** : ajuste `--storage.tsdb.retention.time` selon la taille disque & besoin.

---

Avec cette fiche, n’importe qui peut :

1. Comprendre **le rôle** de chaque service,
2. Savoir **où** sont les fichiers importants,
3. Démarrer/diagnostiquer la stack,
4. S’appuyer sur les fiches **datasources**/**dashboards** pour “as-code” côté UI.
