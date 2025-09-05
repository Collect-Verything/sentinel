
```yaml
      - --config.file=/etc/prometheus/prometheus.yml
```

---

## 1. Le contexte

* Dans ton `docker-compose.yml`, on lance Prometheus via l’image officielle `prom/prometheus`.
* Par défaut, Prometheus cherche **un fichier de configuration** (souvent `prometheus.yml`) pour savoir :

    * quelles **targets** scrapper (ex. `node_exporter`, `localhost:9090`, etc.),
    * quels **jobs** définir,
    * éventuellement les **alert rules**,
    * et d’autres paramètres (scrape interval, evaluation interval…).

---

## 2. Ce que fait `--config.file`

* `--config.file` est un **argument de ligne de commande** passé au binaire `prometheus`.
* Il dit explicitement à Prometheus :
  👉 **“Va chercher ta configuration dans ce fichier précis”**.

Ici : `/etc/prometheus/prometheus.yml`.

---

## 3. Pourquoi ce chemin ?

* Dans ton `docker-compose.yml`, tu as cette ligne de volume :

```yaml
- ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
```

→ Ça fait un **bind-mount** :

* ton fichier `./prometheus.yml` (dans le repo, à côté du `docker-compose.yml`),
* est copié/monté **dans le conteneur**, au chemin `/etc/prometheus/prometheus.yml`,
* en lecture seule (`:ro`).

Du coup, quand Prometheus lit `/etc/prometheus/prometheus.yml`, il lit en réalité **ton fichier versionné dans le repo** ✅.

---

## 4. Et si on ne mettait pas cette ligne ?

Si tu n’ajoutes pas `--config.file=…` :

* Prometheus cherche un fichier par défaut (`prometheus.yml`) dans son répertoire de travail.
* Comme tu ne maîtrises pas forcément où est ce répertoire dans l’image, tu risques :

    * soit une erreur **“no config file found”**,
    * soit qu’il parte avec un fichier par défaut (qui ne scrappe rien d’utile).

---

## 5. Résumé

* `--config.file=/etc/prometheus/prometheus.yml` = chemin **dans le conteneur** vers la conf Prometheus.
* Ce chemin correspond à ton fichier local `./prometheus.yml` (grâce au bind volume).
* C’est **obligatoire** pour s’assurer que Prometheus utilise **ta config versionnée**, pas une config par défaut inconnue.
