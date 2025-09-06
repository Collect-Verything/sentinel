## Utilité grafana



## 🔍 1. **Exploration ad hoc**

Ouvrir l’onglet “Explore” de Grafana, taper une requête LogQL et naviguer dans les logs.  
C’est utile pour :

- **déboguer** un problème ponctuel (“un client me dit qu’il a une 500 à 14h12, voyons les logs”).
- **chercher des patterns** (ex: “quels endpoints provoquent le plus d’erreurs 404 ?”).


---

## 📊 2. **Dashboards**

👉 Les gens créent des **dashboards visuels** dans Grafana à partir des logs.  
Exemple :

- Nombre de requêtes par seconde (RPS).
- Taux d’erreurs 4xx / 5xx par endpoint.
- Histogramme des temps de réponse (si tu logs les temps).
- Logs système (auth, SSH, etc.) centralisés pour sécurité.

Ça permet de voir **en un coup d’œil** si l’app va bien sans lire 1000 lignes de logs.


## 🧩 Étape 1 : Identifier les infos qu’on veut

Avec ta config actuelle, Fluent Bit envoie :

- **Logs Nginx** (via `/dev/stdout` du container)
- **Logs système** (`/var/log/syslog`, `/var/log/auth.log`)


👉 Donc sur Grafana/Loki on a déjà des `labels` comme :

- `job="nginx"` (défini dans `fluent-bit.conf`)
- `host="..."` (nom de ta machine)


Et dans les logs Nginx, tu as normalement des lignes du style :

```
172.17.0.1 - - [03/Sep/2025:10:52:10 +0000] "GET /api/v1/products HTTP/1.1" 200 123 "-" "Mozilla/5.0"
```

Ça veut dire qu’on peut extraire :

- **status code** (200, 404, 500…)
- **endpoint** (`/api/v1/products`)
- **volume de trafic**


---

## 🧩 Étape 2 : Requêtes LogQL utiles

Tu vas en avoir besoin pour construire les panels :

1. **Nombre total de requêtes**


```logql
count_over_time({job="nginx"}[1m])
```

2. **Taux d’erreurs 5xx**


```logql
sum(rate({job="nginx"} | regexp "(?P<status>[0-9]{3})" | unwrap status | status =~ "5.." [5m]))
```

3. **Top endpoints appelés**


```logql
topk(5, count_over_time({job="nginx"} | regexp "\"[A-Z]+ (?P<endpoint>[^ ]+) " | unwrap endpoint [5m]))
```

4. **Logs bruts (debug)**


```logql
{job="nginx"}
```

---


---

### 🔹 2. Logs système (depuis Fluent Bit)

Grâce à `system.syslog` et `system.auth` :

- **Auth logs (tentatives SSH)** :

    ```logql
    count_over_time({job="nginx", tag="system.auth"} |= "Failed password"[5m])
    ```

- **Erreurs critiques système** :

    ```logql
    count_over_time({job="nginx", tag="system.syslog"} |= "error"[5m])
    ```





# 📝 Note : Relation entre Fluent Bit `[INPUT]` et les volumes Docker

## 1. Comment Fluent Bit lit des fichiers de log ?

- Fluent Bit est lancé **dans un conteneur Docker**.
- Comme tout conteneur, il est **isolé** de l’hôte : par défaut, il ne "voit" pas les fichiers de ton serveur (ex. `/var/log/syslog`).
- Quand tu écris dans `fluent-bit.conf` :

```ini
[INPUT]
    Name tail
    Path /var/log/syslog
    Tag  system.syslog
```

- `Name tail` → on lit un fichier en continu
- `Path` → chemin exact du fichier (qui doit exister grâce au volume)
- `Tag` → identifiant du flux (ex. `system.syslog`)

👉 Ça veut dire : **"Fluent Bit doit lire `/var/log/syslog`"**.

⚠️ Mais si ce fichier n’existe **pas dans le conteneur**, Fluent Bit plante ou ne lit rien.


Attention chaque input doit posseder un output :

Chaque `[OUTPUT]` envoie les logs vers une destination (ici Loki).  
**Règle d’or** : si tu veux distinguer plusieurs types de logs dans Grafana, tu dois créer **un output par type d’input/tag**.

```json
[OUTPUT]
    Name        loki
    Match       nginx.*
    Host        82.165.92.40
    Port        3100
    Labels      job=nginx,host=${HOSTNAME}
    line_format json

[OUTPUT]
    Name        loki
    Match       system.*
    Host        82.165.92.40
    Port        3100
    Labels      job=system,host=${HOSTNAME}
    line_format json


```

- `Match` → indique quels tags d’INPUT sont envoyés (ex. `nginx.*` ou `system.*`)
- `Labels` → ajoute un label `job=xxx` pour les retrouver dans Grafana


### 📝 Mini Note : `Match` dans Fluent Bit

- Chaque `[OUTPUT]` de Fluent Bit a une directive `Match` qui dit **quels logs (tags) vont être envoyés vers cette sortie**.

- **Tags** :
    - Chaque `[INPUT]` attribue un `Tag` (ex: `nginx.access`, `system.syslog`).
    - C’est ce `Tag` que `Match` utilise pour savoir quoi router.

- **Règles** :
    - `Match *` → prend **tous** les logs (attention, ça peut “avaler” les autres).
    - `Match nginx.*` → prend seulement les logs dont le tag commence par `nginx.`
    - `Match system.syslog` → prend seulement ce tag précis.

- **Bonne pratique** :
    - Éviter `Match *` sauf pour un **catch-all** en dernier recours.
    - Créer un `[OUTPUT]` par “famille de logs” (nginx, system, auth, misc).
    - Ça garde les flux **propres et séparés** côté Loki/Grafana.


---

## 2. Le rôle des volumes dans `docker-compose.yml`

Un volume permet de **partager des fichiers de ton hôte (serveur)** avec un conteneur.

Exemple :
```yaml
volumes:
  - /var/log:/var/log:ro
```

👉 Cela fait apparaître **le répertoire `/var/log` de ton serveur** dans **le `/var/log` du conteneur**.
- Ainsi, quand Fluent Bit cherche `/var/log/syslog`, il trouve bien le vrai fichier de ton hôte.
- L’option `:ro` (read-only) est importante : Fluent Bit lit les logs mais ne peut pas les modifier.

Sans ce volume : `/var/log/syslog` dans le conteneur est vide ou inexistant → Fluent Bit ne lit rien.

---

## 3. Exemple concret

### docker-compose.yml :

```yaml
fluent-bit:
  image: fluent/fluent-bit:latest
  container_name: fluent-bit
  volumes:
    - ./fluent-bit.conf:/fluent-bit/etc/fluent-bit.conf
    - /var/lib/docker/containers:/var/lib/docker/containers:ro   # logs Docker JSON
    - /var/run/docker.sock:/var/run/docker.sock                  # métadonnées Docker
    - /var/log:/var/log:ro                                       # logs système
  ports:
    - "2020:2020"
```

### fluent-bit.conf :

```ini
# Logs système
[INPUT]
    Name tail
    Path /var/log/syslog
    Tag  system.syslog

[INPUT]
    Name tail
    Path /var/log/auth.log
    Tag  system.auth

# Logs Docker (Nginx, client, etc.)
[INPUT]
    Name tail
    Path /var/lib/docker/containers/*/*-json.log
    Tag  docker.*
    Parser docker
```

---

## 4. Déroulé complet (chaîne d’acheminement)

1. **Ton serveur écrit des logs** :
    - `/var/log/syslog` : logs système
    - `/var/log/auth.log` : authentifications
    - `/var/lib/docker/containers/...-json.log` : logs des conteneurs (stdout/stderr)

2. **Docker volume monte ces chemins** dans le conteneur Fluent Bit.
3. **Fluent Bit lit ces fichiers** grâce aux `[INPUT]` de `fluent-bit.conf`.
4. Fluent Bit **parse** les logs (si tu as défini un `Parser` comme `docker`).
5. Fluent Bit envoie ces logs vers un `[OUTPUT]` (dans ton cas Loki).


---

## 5. Pourquoi c’est indispensable ?

- Sans volume : le conteneur est isolé → `/var/log/syslog` est introuvable → pas de logs collectés.
- Avec volume : Fluent Bit voit les vrais fichiers du serveur → collecte réussie.


---

👉 Résumé :  
**Le `[INPUT]` dit à Fluent Bit _quel chemin lire_.  
Le volume Docker fait en sorte que ce chemin existe dans le conteneur.  
Sans volume, l’`INPUT` pointe dans le vide.**


```json
[Serveur Linux]
   /var/log/syslog
   /var/log/auth.log
   /var/lib/docker/containers/...-json.log
        |
        | (montés en volumes dans docker-compose)
        v
[Fluent Bit container]
   INPUT (tail, docker...) + TAG
        v
   OUTPUT (Loki) + LABEL (job=nginx, job=system, etc.)
        v
[Loki + Grafana]
   Requêtes LogQL : {job="nginx"} , {job="system"} ...

```




---

### 🔹 3. Metrics serveurs (Node Exporter)

Comme tu as **node-exporter**, on peut rajouter :

- **CPU usage** :

    ```promql
    100 - (avg by (instance)(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
    ```

- **RAM usage** :

    ```promql
    node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes
    ```

- **Disk usage** :

    ```promql
    node_filesystem_size_bytes - node_filesystem_free_bytes
    ```


👉 Ces panels tu les mets dans une **section “Infrastructure”** du dashboard.

---

### 🔹 4. Alertes possibles

- **HTTP 500 > 5 en 1m**

- **Auth SSH échoué > 10 en 5m**

- **CPU > 80% pendant 2m**


---

👉 Donc ton dashboard pourrait être structuré comme ça :

1. **Overview**

    - Nombre total de requêtes (nginx)

    - Erreurs 4xx / 5xx

    - Auth SSH échouées

2. **Traffic**

    - Top endpoints

    - Graph codes HTTP

3. **System**

    - Syslog errors

    - Auth logs

4. **Infrastructure**

    - CPU / RAM / Disk

    - Uptime du node




---

## 🚨 3. **Alerting**

👉 Grâce à Loki + Alertmanager (ou Grafana Alerting), on peut définir des **alertes automatiques** :

- Si >1% des requêtes sont des 500 sur 5 minutes → alerte Slack.

- Si un utilisateur tente 20 logins ratés en 1 minute → alerte sécurité.

- Si ton service ne génère plus de logs → alerte (le service est peut-être down).


Pour le smail il faut creer une alert, et ajouter un mail dans la config contact point: creer l'alerte avec une query ciblé et cofigurer le smtp de grafana dans le docker compose ou dans la config, ici docker compose=

Parfait ✅ reprenons doucement, étape par étape, en utilisant **Gmail** comme SMTP (c’est plus simple que Ionos pour tester).

---

## 1. Vérifier si Grafana tourne en Docker

```bash
docker ps | grep grafana
```

👉 Si tu vois `grafana/grafana`, alors Grafana est bien en container.  
Dans ce cas, sa config (`grafana.ini`) est **à l’intérieur** du container, pas sur ton serveur.

---

## 🗂️ 4. **Centralisation multi-services**

👉 Quand tu as plusieurs apps/microservices, tu envoies **tous les logs** (front, back, base, infra) dans Loki.  
Avantage : tu peux **corréler** :

- voir qu’un appel frontend a déclenché un appel backend → qui a échoué → erreur DB.

- suivre une requête avec un `trace_id` unique dans tous les services.


---

## 🔐 5. **Audit & sécurité**

👉 Beaucoup d’équipes exploitent les logs pour la **compliance** ou la **cybersécurité** :

- garder un historique centralisé (même si une machine crashe, les logs sont sauvegardés).

- détecter des comportements anormaux (ex: brute force SSH, injection SQL, spam).


---

## 🧑‍💻 Concrètement au quotidien

- Les devs → vont dans Grafana “Explore” pour **debugger**.

- Les ops/devops → utilisent des **dashboards + alertes** pour surveiller l’état global.

- Les responsables sécurité → exploitent les logs centralisés pour **auditer**.


