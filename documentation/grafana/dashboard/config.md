# 📊 Grafana – Méthodes d’import et d’auto-provisioning des dashboards

## 1. Méthodes d’importation

### 🔹 1.1 Import JSON manuel

* Depuis l’UI Grafana → **Import** → coller un JSON complet (souvent récupéré en téléchargeant un fichier `.json` sur grafana.com).
* Pratique pour tester rapidement un modèle ou un dashboard personnalisé.
* ⚠️ Attention : non versionné → disparaît si Grafana est recréé.

---

### 🔹 1.2 Import manuel par ID (grafana.com)

* Dans l’UI Grafana → **Import** → entrer l’ID du dashboard (ex: `1860`).
* Grafana va télécharger automatiquement le modèle depuis grafana.com.
* Utile pour les dashboards génériques et bien connus (ex: *Node Exporter Full*).
* ⚠️ Même limite : import manuel, donc pas versionné.

---

### 🔹 1.3 Auto-provisioning (recommandé)

* Méthode robuste → tu places ton JSON dans le dossier **provisioning** lié à Grafana :

  ```
  grafana/provisioning/dashboards/
  grafana/dashboards/my-dashboard.json
  ```
* Le provisioning est déclaré dans `grafana/provisioning/dashboards/dashboard.yml` : (voir detail fiche provisioning)

  ```yaml
  apiVersion: 1
  providers:
    - name: "Default"
      orgId: 1
      type: file
      disableDeletion: false
      updateIntervalSeconds: 10
      options:
        path: /var/lib/grafana/dashboards
        foldersFromFilesStructure: true
  ```
* Avantage : **versionné dans Git**, recréé automatiquement si Grafana redémarre.

---

## 2. Exemple concret

📌 Dashboard officiel *Node Exporter Full* (ID: 1860) :
👉 [https://grafana.com/grafana/dashboards/12486-node-exporter-full/](https://grafana.com/grafana/dashboards/12486-node-exporter-full/)

À télécharger, adapter (voir §3), puis placer dans :

```
grafana/dashboards/node-exporter-full-1860.json
```

---

## 3. Checklist de préparation (avant provisioning)

Quand tu ajoutes un dashboard téléchargé (JSON) dans la config :

✅ **`id`** → mettre `null`

```json
"id": null
```

✅ **`uid`** → donner un identifiant unique (pas celui du site)

```json
"uid": "node-exporter-full-1860"
```

✅ **Supprimer `__inputs`** → inutile et casse le provisioning

✅ **Corriger `datasource`**

* Mauvais format (téléchargé) :

```json
"datasource": { "type": "Prometheus", "uid": "xxxx" }
```

* Bon format (après correction) :

```json
"datasource": "Prometheus"
```

(le nom doit correspondre à ton `datasource.yml`) (voire fiche prov-datasrouce)

✅ **Corriger `templating.list`** (variables)

* Exemple correct :

```json
{
  "type": "query",
  "name": "job",
  "label": "Job",
  "datasource": "Prometheus",
  "query": "label_values(node_uname_info, job)",
  "refresh": 2
}
```

✅ **Annotations** → forcer sur la datasource interne Grafana si besoin :

```json
"datasource": { "type": "grafana", "uid": "grafana" }
```

---

## 4. Vérification après déploiement

1. Redémarrer Grafana :

   ```bash
   docker compose restart grafana
   ```
2. Vérifier les logs de provisioning :

   ```bash
   docker logs --since=2m grafana | grep -i -E 'provision|dashboard|error|warn'
   ```
3. Le dashboard doit apparaître automatiquement dans l’UI, dans le bon dossier.

---

## 🚀 Résumé rapide (workflow)

1. Télécharger le JSON du dashboard.
2. Nettoyer et adapter (`id=null`, `uid`, `datasource`, `templating`, `annotations`).
3. Placer le fichier dans `grafana/dashboards/`.
4. Provisionner avec `dashboard.yml`.
5. Redémarrer Grafana et vérifier les logs.

---

👉 Avec ça, chaque dashboard que tu récupères en ligne sera **propre, versionné et auto-provisionné** sans dépendre d’un import manuel.
