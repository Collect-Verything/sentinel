# Fiche – `datasource.yml` (provisioning des **datasources** Grafana)

## Où se trouve ce fichier ?

**Dans ton repo (hôte) :**

```
/root/sentinel/
└─ grafana/
   └─ provisioning/
      └─ datasources/
         └─ datasource.yml    ← CE fichier
```

**Monté dans le conteneur Grafana (via docker compose) :**

```yaml
grafana:
  volumes:
    - ./grafana/provisioning:/etc/grafana/provisioning
    - ./grafana/dashboards:/var/lib/grafana/dashboards
```

Grafana lit les datasources dans **`/etc/grafana/provisioning/datasources`** (dans le conteneur).

> Contrairement aux dashboards, **les datasources sont provisionnées surtout au démarrage**. Pour prendre une modif en compte, redémarre Grafana.

---

## Rôle dans le workflow (lien avec la fiche “dashboards”)

* Les **dashboards provisionnés** doivent référencer une datasource par **son *nom*** (ex. `"Prometheus"`, `"Loki"`).
* Ce fichier **crée ces datasources avec ces noms**.
* Si le nom diverge (ex. dashboard → `"Prometheus"`, datasource → `"Prometheus-Prod"`), tu auras “**data source not found**”.

---

## Exemple minimal (celui que tu utilises)

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    isDefault: false
```

### Détail champ par champ

* `apiVersion: 1`
  Version du schéma de provisioning → laisse `1`.

* `datasources:`
  Tableau de définitions.

Pour **chaque** datasource :

* `name` *(obligatoire)*
  **Nom logique** affiché dans Grafana. C’est **celui que tes dashboards doivent utiliser** (ex. `"Prometheus"`, `"Loki"`).

* `type` *(obligatoire)*
  Plugin de datasource. Exemples usuels :

    * `prometheus`
    * `loki`
    * `postgres`, `mysql`, `elasticsearch`, etc.

* `access`

    * `proxy` (recommandé) : les requêtes passent par Grafana (CORS et auth simplifiés).
    * `direct` : le navigateur tape directement la datasource (rarement utile côté serveur).

* `url`
  Adresse **vue depuis le conteneur Grafana** (ex. `http://prometheus:9090`, `http://loki:3100`).

  À propos des `url` dans les datasources :

  L’URL n’est pas choisie “au hasard” : elle dépend du type de datasource.
  Par exemple, pour **Loki** (`type: loki`), Grafana s’attend à parler avec l’API Loki disponible sur le port **3100**.
  En Docker Compose, on utilise donc l’adresse du service :

    ```yaml
    url: http://loki:3100
    ```

  👉 Même logique pour Prometheus (`http://prometheus:9090`), Elasticsearch (`http://elasticsearch:9200`), etc.
  L’important est de pointer vers **l’endpoint natif du service**, soit via son nom de service Docker, soit via son IP/hostname.

  > Astuce : utilise le **nom de service Docker** pour éviter d’exposer en public.

* `isDefault`
  `true` pour la datasource par défaut (souvent Prometheus).

---

## Options fréquentes (selon le type)

### Prometheus – `jsonData` / `secureJsonData`

```yaml
- name: Prometheus
  type: prometheus
  access: proxy
  url: http://prometheus:9090
  isDefault: true
  jsonData:
    httpMethod: POST              # (optionnel) POST pour les grosses requêtes
    timeInterval: 5s             # min interval pour $__interval
    exemplarTraceIdDestinations: []  # exemplars/tempo (si tu en as)
  # secureJsonData: {}            # tokens / mots de passe si besoin
```

### Loki – `jsonData` (ex. derived fields vers traces)

```yaml
- name: Loki
  type: loki
  access: proxy
  url: http://loki:3100
  isDefault: false
  jsonData:
    maxLines: 1000
    timeout: 60
    derivedFields:
      - name: traceID
        matcherRegex: 'traceID=(\w+)'
        url: '$${__value.raw}'
```

---

## Authentification & TLS (exemples)

### Basic auth (serveur protégé)

```yaml
- name: Prometheus
  type: prometheus
  access: proxy
  url: https://prometheus.local:9090
  basicAuth: true
  basicAuthUser: admin
  secureJsonData:
    basicAuthPassword: "monMotDePasse"
  jsonData:
    tlsSkipVerify: true      # si tu as un cert self-signed (ou préfère tlsCACert)
```

### Bearer token (ex. reverse proxy)

```yaml
- name: Prometheus
  type: prometheus
  access: proxy
  url: https://prometheus.local
  secureJsonData:
    httpHeaderValue1: "Bearer MY_TOKEN"
  jsonData:
    httpHeaderName1: "Authorization"
```

---

## Bonnes pratiques & pièges fréquents

* **Nom exact** : aligne le `name` avec ce que tes dashboards utilisent (`"Prometheus"` / `"Loki"`).
* **Portée réseau** : `url` doit être atteignable **depuis Grafana** (réseau Docker).
* **Un “default”** : garde **une** datasource `isDefault: true` (souvent Prometheus).
* **Redémarrage** : après modif du fichier, **redémarre Grafana** pour re-provisionner.
* **UID vs name** : en provisioning fichier de dashboards, **utilise le *name***, pas l’UID de datasource.
* **Sécurité** : mets les secrets dans **`secureJsonData`** (et pas en clair).

---

## Sanity checks (rapides)

### 1) Voir les datasources enregistrées (API Grafana)

```bash
curl -s -u admin:admin http://localhost:3000/api/datasources \
 | jq -r '.[] | [.name,.type,.url,.isDefault] | @tsv'
# Attendu :
# Prometheus   prometheus  http://prometheus:9090  true
# Loki         loki        http://loki:3100        false
```

### 2) Vérifier reachability réseau (depuis Grafana)

```bash
# Prometheus OK ?
curl -fsS http://localhost:9090/-/ready && echo "Prometheus OK"

# Loki OK ?
curl -fsS http://localhost:3100/ready && echo "Loki OK"
```

### 3) Logs Grafana (au démarrage)

```bash
docker logs grafana 2>&1 | grep -i -E 'provision|datasource|error|warn'
```

---

## Variantes utiles

### Datasource “lecture seule”

```yaml
editable: false   # empêche la modif depuis l’UI
```

### Plusieurs environnements (nommage clair)

```yaml
- name: Prometheus-Prod
  type: prometheus
  url: http://prometheus:9090

- name: Prometheus-Stage
  type: prometheus
  url: http://prometheus-stage:9090
```

> Dans ce cas, tes dashboards doivent référencer le **bon name** (ou utiliser une variable de datasource si tu fais des imports manuels — pas conseillé pour le provisioning “as code”).

---

## TL;DR (à retenir)

* Ce fichier **crée/configure** tes datasources (Prometheus, Loki, …).
* Le **nom** (`name`) doit **matcher ce que les dashboards utilisent**.
* Après changement, **redémarre Grafana**.
* Vérifie via l’API que les datasources existent bien, avec la bonne `url` et le bon `type`.





