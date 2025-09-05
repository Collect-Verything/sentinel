# Fiche – `dashboard.yml` (provisioning des dashboards Grafana)

## Où se trouve ce fichier ?

**Dans ton repo (hôte) :**

```
/root/sentinel/
└─ grafana/
   ├─ dashboards/                 # ← tes JSON de dashboards versionnés
   │  ├─ product-logs.json
   │  └─ node-exporter-full-1860.json
   └─ provisioning/
      └─ dashboards/
         └─ dashboard.yml         # ← CE fichier
```

**Monté dans le conteneur Grafana (via docker compose) :**

```yaml
# docker-compose.yml
grafana:
  volumes:
    - ./grafana/provisioning:/etc/grafana/provisioning
    - ./grafana/dashboards:/var/lib/grafana/dashboards
```

* Grafana lit la configuration de provisioning dans **`/etc/grafana/provisioning`** (dans le conteneur).
* Il charge les dashboards JSON depuis **`/var/lib/grafana/dashboards`** (dans le conteneur).

> 🔗 Cette fiche complète la “note d’import & adaptation” précédente : on y expliquait **comment rendre un JSON provisionnable** (id=null, datasource = "Prometheus"/"Loki", suppression de `__inputs`, templating corrigé, etc.). Ici, on explique **comment Grafana va le charger automatiquement**.

---

## À quoi sert `dashboard.yml` ?

* C’est **la recette** qui dit à Grafana **où** trouver tes dashboards JSON et **comment** les intégrer (rafraîchissement, dossiers, suppression, etc.).
* Il te permet d’**auto-provisionner** tes dashboards : pas d’import manuel, tout est **déclaratif** et **versionné**.

---

## Exemple minimal (ton fichier)

```yaml
apiVersion: 1
providers:
  - name: "Default"
    orgId: 1
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    options:
      path: /var/lib/grafana/dashboards // checker volume docker-compose
      foldersFromFilesStructure: true
```

### Détail champ par champ

* `apiVersion: 1`
  Version du schéma de provisioning des dashboards. Laisse `1`.

* `providers:`
  Liste des “fournisseurs” de dashboards (tu peux en avoir plusieurs).

#### Pour chaque provider :

* `name: "Default"`
  Nom logique (apparaît dans les logs). Mets un nom parlant si tu en as plusieurs (ex. “Infra”, “Logs”).

* `orgId: 1`
  Organisation ciblée (1 = l’org par défaut).

* `type: file`
  On charge des dashboards **depuis des fichiers**.

* `disableDeletion: false`

    * `false` : si tu **supprimes** un JSON du dossier, Grafana **supprime** aussi le dashboard de sa base (comportement “déclaratif”).
    * `true`  : Grafana **ne supprimera pas** le dashboard même si tu enlèves le fichier (comportement “accumulatif”).

  > En CI/CD, on préfère souvent `false`.

* `updateIntervalSeconds: 10`
  Intervalle de re-scan des fichiers (ici toutes les 10 s).

  > Dev = petit ; Prod = tu peux monter (ex. 60–300).

* `options:`
  Paramètres propres au type `file`.

    * `path: /var/lib/grafana/dashboards`
      **Répertoire dans le conteneur** où sont les JSON.

      > Assure-toi qu’il est bien monté depuis ton repo (cf. volumes ci-dessus).

    * `foldersFromFilesStructure: true`
      Si `true`, **la hiérarchie de dossiers** sur disque devient des **dossiers Grafana**.

        * Exemple :

          ```
          dashboards/
          ├─ Logs/
          │  └─ product-logs.json   → dossier “Logs” dans l’UI
          └─ node-exporter-full-1860.json  → à la racine
          ```

        * Si tu veux tout à plat, mets `false`.

  > Option utile (facultative) : `allowUiUpdates: true` permet d’éditer depuis l’UI **et** d’écrire dans la base, sans toucher au JSON sur disque. (À manipuler avec prudence : ça “diverge” du Git.)

---

## Rôle dans ton **workflow global**

1. **Tu ajoutes / modifies** un dashboard JSON dans `grafana/dashboards/` (versionné Git).
   (En ayant préalablement appliqué les règles de la fiche précédente : `id=null`, `uid`, `datasource` = "Prometheus"/"Loki", pas de `__inputs`, `templating`/`annotations` corrigés.)

2. **Grafana détecte** les fichiers via `dashboard.yml` :

    * regarde le **`path`**,
    * respecte `foldersFromFilesStructure`,
    * rescane toutes les `updateIntervalSeconds`.

3. Le dashboard **apparaît automatiquement** dans l’UI, sans import manuel, et **survivra** aux redéploiements.

---

## Bonnes pratiques & pièges fréquents

* **Montages Docker** : vérifie que les chemins de ton compose correspondent **aux chemins du conteneur** attendus par `dashboard.yml`.

    * `/etc/grafana/provisioning`
    * `/var/lib/grafana/dashboards`

* **Noms de datasources** : les dashboards provisionnés doivent utiliser `"datasource": "Prometheus"` / `"Loki"` (le **nom** défini dans `datasource.yml`), pas des UID ni `${DS_*}`.

* **`__inputs`** : à supprimer dans les JSON (uniquement utile en import **manuel**).

* **`disableDeletion: false`** : si tu supprimes le JSON du repo, le dashboard disparaît (logique déclarative).

* **UID** : chaque dashboard doit avoir un `uid` **unique** (stable dans le temps), sinon conflit.

* **Logs utiles** :

  ```bash
  docker logs --since=2m grafana | grep -i -E 'provision|dashboard|error|warn'
  ```

  Tu dois voir des lignes du type : `starting to provision dashboards` / `finished to provision dashboards`.

* **Forcer un rescan** sans restart :

  ```bash
  docker exec -it grafana sh -lc 'find /var/lib/grafana/dashboards -type f -exec touch {} +'
  ```

---

## Variantes (si tu veux aller plus loin)

### Plusieurs providers (par dossiers)

```yaml
apiVersion: 1
providers:
  - name: "Logs"
    orgId: 1
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    options:
      path: /var/lib/grafana/dashboards/Logs
      foldersFromFilesStructure: false

  - name: "Infra"
    orgId: 1
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    options:
      path: /var/lib/grafana/dashboards/Infra
      foldersFromFilesStructure: false
```

### Forcer un dossier (sans refléter l’arborescence disque)

```yaml
options:
  path: /var/lib/grafana/dashboards
  foldersFromFilesStructure: false
  folder: "Production"   # place tous les JSON dans le dossier “Production”
```

---

## Raccourci “sanity check” (3 commandes)

```bash
# 1) Les datasources existent et ont le BON nom
curl -s -u admin:admin http://localhost:3000/api/datasources \
 | jq -r '.[] | [.name,.type,.url] | @tsv'

# 2) Les fichiers sont bien visibles côté conteneur
docker exec -it grafana sh -lc 'ls -la /var/lib/grafana/dashboards && cat /etc/grafana/provisioning/dashboards/dashboard.yml'

# 3) Provisioning OK dans les logs
docker logs --since=2m grafana | grep -i -E 'provision|dashboard|error|warn'
```

---

### TL;DR

* `dashboard.yml` **orchestré** par Grafana = **charge automatiquement** tes dashboards JSON versionnés.
* Mets tes JSON “propres” (cf. fiche précédente), pose-les dans `grafana/dashboards/`, et c’est **auto**.
* Chemins **dans le conteneur** : `/etc/grafana/provisioning` et `/var/lib/grafana/dashboards`.
* `disableDeletion=false` + `updateIntervalSeconds` te donnent un provisioning **déclaratif** et **réactif**.
